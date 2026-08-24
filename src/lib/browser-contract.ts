import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createNightSafePrivateState, witnesses } from '../witnesses.js';
import {
  CONTRACT_ADDRESS,
  CONTRACT_INITIAL_PRIVATE_LIMIT,
  CONTRACT_PRIVATE_STATE_ID,
  CONTRACT_ZK_BASE_URL,
  LOCAL_PROOF_SERVER_URL,
  TARGET_NETWORK,
} from './config';
import { decodeTransactionPayload, encodeTransactionPayload } from './encoding';

export interface BrowserSession {
  connected: ConnectedAPI;
  address: string;
  networkId: string;
  contract: any;
  publicDataProvider: ReturnType<typeof indexerPublicDataProvider>;
}

function createInMemoryPrivateStateProvider() {
  let contractAddress = '';
  const state = new Map<string, unknown>();
  const signingKeys = new Map<string, string>();

  return {
    setContractAddress(address: string) {
      contractAddress = address;
    },
    async set(privateStateId: string, value: unknown) {
      state.set(`${contractAddress}:${privateStateId}`, value);
    },
    async get(privateStateId: string) {
      return state.get(`${contractAddress}:${privateStateId}`) ?? null;
    },
    async remove(privateStateId: string) {
      state.delete(`${contractAddress}:${privateStateId}`);
    },
    async clear() {
      state.clear();
    },
    async setSigningKey(address: string, signingKey: string) {
      signingKeys.set(address, signingKey);
    },
    async getSigningKey(address: string) {
      return signingKeys.get(address) ?? null;
    },
    async removeSigningKey(address: string) {
      signingKeys.delete(address);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    async exportPrivateStates() {
      throw new Error('Private state export is not enabled in NightSafe.');
    },
    async importPrivateStates() {
      throw new Error('Private state import is not enabled in NightSafe.');
    },
    async exportSigningKeys() {
      throw new Error('Signing key export is not enabled in NightSafe.');
    },
    async importSigningKeys() {
      throw new Error('Signing key import is not enabled in NightSafe.');
    },
  };
}

function serializeTx(tx: { serialize(): Uint8Array }): string {
  return encodeTransactionPayload(tx.serialize());
}

function deserializeFinalTx(tx: string) {
  return ledger.Transaction.deserialize('signature', 'proof', 'binding', decodeTransactionPayload(tx));
}

async function loadNightSafeContract() {
  return import('../../contracts/managed/nightsafe/contract/index.js');
}

function requireServiceUrl(value: string, label: string, protocols: readonly string[]): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} returned by the wallet is not a valid absolute URL: ${value || '(empty)'}`);
  }

  if (!protocols.includes(url.protocol)) {
    throw new Error(`${label} must use ${protocols.join(' or ')}, but received ${url.protocol}`);
  }

  return url.toString();
}

export async function connectNightSafeSession(api: ConnectedAPI): Promise<BrowserSession> {
  const connectionStatus = await api.getConnectionStatus();
  if (connectionStatus.status !== 'connected') {
    throw new Error('Wallet connection dropped before session setup finished.');
  }

  if (connectionStatus.networkId !== TARGET_NETWORK) {
    throw new Error(`Wallet is connected to ${connectionStatus.networkId}, but NightSafe needs ${TARGET_NETWORK}.`);
  }

  const configuration = await api.getConfiguration();
  if (configuration.networkId !== TARGET_NETWORK) {
    throw new Error(`Wallet configuration reports ${configuration.networkId}, but NightSafe needs ${TARGET_NETWORK}.`);
  }

  setNetworkId(configuration.networkId as 'preview' | 'preprod' | 'mainnet' | 'undeployed');

  const shielded = await api.getShieldedAddresses();
  const unshielded = await api.getUnshieldedAddress();

  const zkBaseUrl = new URL(CONTRACT_ZK_BASE_URL, window.location.origin).toString();
  const proofServerUrl = requireServiceUrl(LOCAL_PROOF_SERVER_URL, 'NightSafe proof server URL', ['http:', 'https:']);
  const indexerUrl = requireServiceUrl(configuration.indexerUri, 'Indexer HTTP URL', ['http:', 'https:']);
  const indexerWsUrl = requireServiceUrl(configuration.indexerWsUri, 'Indexer WebSocket URL', ['ws:', 'wss:']);

  const zkConfigProvider = new FetchZkConfigProvider(zkBaseUrl, window.fetch.bind(window));
  const proofProvider = httpClientProofProvider(proofServerUrl, zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);
  const privateStateProvider = createInMemoryPrivateStateProvider();

  if (!CONTRACT_ADDRESS) {
    throw new Error('Set VITE_NIGHTSAFE_CONTRACT_ADDRESS after deploying NightSafe to Preprod.');
  }
  privateStateProvider.setContractAddress(CONTRACT_ADDRESS);

  const walletProvider = {
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    async balanceTx(tx: { serialize(): Uint8Array }, ttl?: Date) {
      const balanced = await api.balanceUnsealedTransaction(serializeTx(tx), {
        payFees: true,
      });
      return deserializeFinalTx(balanced.tx) as ledger.FinalizedTransaction;
    },
  };

  const midnightProvider = {
    async submitTx(tx: ledger.FinalizedTransaction) {
      await api.submitTransaction(serializeTx(tx));
      return tx.transactionHash();
    },
  };

  const NightSafeContract = await loadNightSafeContract();
  const compiledContract = CompiledContract.make('nightsafe', NightSafeContract.Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(zkBaseUrl),
  );

  const providers = {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };

  const contract = await findDeployedContract(providers as any, {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    privateStateId: CONTRACT_PRIVATE_STATE_ID,
    initialPrivateState: createNightSafePrivateState(CONTRACT_INITIAL_PRIVATE_LIMIT),
  } as any);

  return {
    connected: api,
    address: unshielded.unshieldedAddress,
    networkId: configuration.networkId,
    contract,
    publicDataProvider,
  };
}

export function walletLabel(api: { name: string; rdns: string }): string {
  return `${api.name} (${api.rdns})`;
}

export function selectWalletId(wallets: Array<[string, { name: string; rdns: string }]>) {
  const lace = wallets.find(([, api]) => /lace/i.test(api.name) || /lace/i.test(api.rdns));
  return lace?.[0] ?? wallets[0]?.[0] ?? null;
}

export function isWalletLikelyLace(api: { name: string; rdns: string }) {
  return /lace/i.test(api.name) || /lace/i.test(api.rdns);
}
