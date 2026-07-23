import { useEffect, useMemo, useState } from 'react';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import * as NightSafe from '../../contracts/managed/nightsafe/contract/index.js';
import { connectNightSafeSession, isWalletLikelyLace, selectWalletId, walletLabel, type BrowserSession } from '../utils/contract.js';
import { CONTRACT_ADDRESS, TARGET_NETWORK } from '../lib/config';
import { bytesToHex } from '../lib/encoding';

export type WalletEntry = {
  id: string;
  api: InitialAPI;
};

export type TreasuryLedgerSnapshot = {
  proposalCount: string;
  executedCount: string;
  lastProposalCommitment: string;
  lastApprovalCommitment: string;
};

export type TreasuryCallResult = TreasuryLedgerSnapshot & {
  txHash: string;
  txId: string;
};

function discoverWallets(): WalletEntry[] {
  const injected = window.midnight ?? {};
  return Object.entries(injected)
    .map(([id, api]) => ({ id, api }))
    .filter(({ api }) => typeof api.connect === 'function')
    .sort((left, right) => {
      const leftLace = isWalletLikelyLace(left.api) ? 0 : 1;
      const rightLace = isWalletLikelyLace(right.api) ? 0 : 1;
      if (leftLace !== rightLace) return leftLace - rightLace;
      return walletLabel(left.api).localeCompare(walletLabel(right.api));
    });
}

function readLedgerSnapshot(stateValue: unknown): TreasuryLedgerSnapshot | null {
  if (!stateValue) return null;
  const ledgerState = NightSafe.ledger(stateValue as never);

  return {
    proposalCount: ledgerState.proposalCount.toString(),
    executedCount: ledgerState.executedCount.toString(),
    lastProposalCommitment: bytesToHex(ledgerState.lastProposalCommitment as Uint8Array),
    lastApprovalCommitment: bytesToHex(ledgerState.lastApprovalCommitment as Uint8Array),
  };
}

export function useMidnight() {
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [session, setSession] = useState<BrowserSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCall, setLastCall] = useState<TreasuryCallResult | null>(null);
  const [ledgerState, setLedgerState] = useState<TreasuryLedgerSnapshot>({
    proposalCount: '0',
    executedCount: '0',
    lastProposalCommitment: '0x00',
    lastApprovalCommitment: '0x00',
  });

  useEffect(() => {
    const nextWallets = discoverWallets();
    setWallets(nextWallets);
    setSelectedWalletId((current) => current ?? selectWalletId(nextWallets.map((wallet) => [wallet.id, wallet.api] as const)));
  }, []);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWalletId) ?? null,
    [selectedWalletId, wallets],
  );

  async function refreshLedgerState(activeSession: BrowserSession) {
    const currentState = await activeSession.publicDataProvider.queryContractState(CONTRACT_ADDRESS);
    const snapshot = currentState ? readLedgerSnapshot(currentState.data) : null;
    if (snapshot) setLedgerState(snapshot);
    return snapshot;
  }

  async function connectWallet(walletId: string) {
    const wallet = wallets.find((entry) => entry.id === walletId);
    if (!wallet) {
      setError('Wallet not found.');
      return;
    }

    setConnecting(true);
    setError(null);
    setLastCall(null);

    try {
      const connected = await wallet.api.connect(TARGET_NETWORK);
      const browserSession = await connectNightSafeSession(connected);
      setSession(browserSession);
      setSelectedWalletId(walletId);
      await refreshLedgerState(browserSession);
    } catch (err) {
      setSession(null);
      setError(err instanceof Error ? err.message : 'Unable to connect wallet.');
    } finally {
      setConnecting(false);
    }
  }

  function disconnectWallet() {
    setSession(null);
    setLastCall(null);
    setError(null);
    setLedgerState({
      proposalCount: '0',
      executedCount: '0',
      lastProposalCommitment: '0x00',
      lastApprovalCommitment: '0x00',
    });
  }

  async function authorizeTreasuryMove(
    proposalCommitment: Uint8Array,
    approvalCommitment: Uint8Array,
    approvalCount: bigint,
  ) {
    if (!session) {
      setError('Connect Lace before calling the treasury circuit.');
      return;
    }

    setCalling(true);
    setError(null);

    try {
      const callResult = await session.contract.callTx.authorizeMove(
        proposalCommitment,
        approvalCommitment,
        approvalCount,
      );

      const txHash = callResult.public.txHash;
      const txId = callResult.public.txId;
      const snapshot = await refreshLedgerState(session);

      if (!snapshot) {
        throw new Error('No public ledger state found after execution.');
      }

      setLastCall({
        ...snapshot,
        txHash,
        txId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Treasury circuit call failed.');
    } finally {
      setCalling(false);
    }
  }

  return {
    wallets,
    selectedWallet,
    session,
    connecting,
    calling,
    error,
    lastCall,
    ledgerState,
    selectWallet: setSelectedWalletId,
    connectWallet,
    disconnectWallet,
    authorizeTreasuryMove,
  };
}
