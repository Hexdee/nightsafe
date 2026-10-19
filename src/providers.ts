import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import type { WalletContext } from './wallet';
import path from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { NetworkConfig } from './network';
const zkConfigPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../contracts/managed/nightsafe');
export async function createProviders(walletCtx: WalletContext, networkConfig: NetworkConfig) {
  let privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim();
  if (!privateStatePassword) {
    const directory = path.resolve('.nightsafe-private');
    const passwordPath = path.join(directory, 'storage-password');
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    if (!existsSync(passwordPath)) writeFileSync(passwordPath, randomBytes(32).toString('hex'), { mode: 0o600, flag: 'wx' });
    // Prefix guarantees the SDK's character-class requirement; entropy comes
    // from the 256-bit random suffix. Keep this derivation stable on reopen.
    privateStatePassword = `Ns1!${readFileSync(passwordPath, 'utf8').trim()}`;
  }
  if (privateStatePassword.length < 16) throw new Error('PRIVATE_STATE_PASSWORD must contain at least 16 characters.');

  const walletProvider = {
    // In Midnight.js 4.1.x the WalletProvider interface returns the key objects
    // (CoinPublicKey / EncPublicKey) directly — no longer hex strings.
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      // Sign the wallet-selected unshielded inputs before finalizing.
      // DUST registration has its own already-signed path in deploy.ts.
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signed = await walletCtx.wallet.signRecipe(recipe, (data) => walletCtx.unshieldedKeystore.signData(data));
      return walletCtx.wallet.finalizeRecipe(signed);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'nightsafe-v2-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword!,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}
