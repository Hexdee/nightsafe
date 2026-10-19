import { useEffect, useMemo, useRef, useState } from 'react';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { isWalletLikelyLace, selectWalletId, walletLabel } from '../lib/wallet-utils.js';
import { CONTRACT_ADDRESS, TARGET_NETWORK } from '../lib/config';
import { bytesToHex } from '../lib/encoding';
import type { BrowserSession } from '../lib/browser-contract.js';
import type { NightSafePrivateState } from '../witnesses';
import type { Transfer } from '../generated/nightsafe/index.js';

export type WalletEntry = { id: string; api: InitialAPI };
export type ProposalSnapshot = { id: string; recipient: string; color: string; amount: string; approvals: string; executed: boolean; memoCommitment: string };
export type TreasuryLedgerSnapshot = {
  proposalCount: string; executedCount: string;
  signerKeys: string[]; policyCommitment: string; proposals: ProposalSnapshot[];
};
export type TreasuryCallResult = { txHash: string; txId: string; action: string };
const empty = (): TreasuryLedgerSnapshot => ({ proposalCount: '0', executedCount: '0', signerKeys: [], policyCommitment: '', proposals: [] });

export function useMidnight() {
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [session, setSession] = useState<BrowserSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [calling, setCalling] = useState(false);
  const callLock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCall, setLastCall] = useState<TreasuryCallResult | null>(null);
  const [ledgerState, setLedgerState] = useState<TreasuryLedgerSnapshot>(empty);
  useEffect(() => {
    const discover = () => {
      const entries = Object.entries(window.midnight ?? {}).map(([id, api]) => ({ id, api }))
        .filter(({ api }) => typeof api.connect === 'function')
        .sort((a, b) => Number(isWalletLikelyLace(b.api)) - Number(isWalletLikelyLace(a.api)) || walletLabel(a.api).localeCompare(walletLabel(b.api)));
      setWallets(entries);
      setSelectedWalletId((id) => id ?? selectWalletId(entries.map((w) => [w.id, w.api] as const)));
    };
    discover(); const timer = window.setInterval(discover, 2000);
    return () => window.clearInterval(timer);
  }, []);
  const selectedWallet = useMemo(() => wallets.find((w) => w.id === selectedWalletId) ?? null, [wallets, selectedWalletId]);
  async function refreshLedgerState(active = session) {
    if (!active) return;
    const current = await active.publicDataProvider.queryContractState(CONTRACT_ADDRESS);
    if (!current) throw new Error('No deployed V2 treasury state was found.');
    const NightSafe = await import('../generated/nightsafe/index.js');
    const l = NightSafe.ledger(current.data);
    const snapshot: TreasuryLedgerSnapshot = {
      proposalCount: l.proposalCount.toString(), executedCount: l.executedCount.toString(),
      signerKeys: l.signerKeys.map(bytesToHex), policyCommitment: bytesToHex(l.policyCommitment),
      proposals: Array.from(l.proposals).map(([id, p]) => ({ id: id.toString(), recipient: bytesToHex(p.recipient.bytes), color: bytesToHex(p.color), amount: p.amount.toString(), memoCommitment: bytesToHex(p.memoCommitment), approvals: l.approvalCounts.lookup(id).toString(), executed: l.executed.member(id) })).reverse(),
    };
    setLedgerState(snapshot);
    return snapshot;
  }
  async function connectWallet(id: string) {
    if (callLock.current) return;
    const wallet = wallets.find((w) => w.id === id); if (!wallet) return;
    setConnecting(true); setError(null);
    try {
      const { connectNightSafeSession } = await import('../lib/browser-contract');
      const active = await connectNightSafeSession(await wallet.api.connect(TARGET_NETWORK));
      await refreshLedgerState(active); setSession(active); setSelectedWalletId(id);
    } catch (e) { setSession(null); setError(e instanceof Error ? e.message : 'Connection failed.'); }
    finally { setConnecting(false); }
  }
  function disconnectWallet() { if (callLock.current) return; setSession(null); setLastCall(null); setLedgerState(empty()); setError(null); }
  async function call(action: 'propose' | 'approve' | 'execute' | 'deposit', args: unknown[], privateState: NightSafePrivateState) {
    if (!session) throw new Error('Connect a wallet first.');
    if (callLock.current) throw new Error('Wait for the current transaction to finish.');
    callLock.current = true;setCalling(true);setError(null);setLastCall(null);
    try {
      await session.setPrivateState(privateState);
      const result = await session.contract.callTx[action](...args);
      setLastCall({ txHash: result.public.txHash, txId: result.public.txId, action });
      try { await refreshLedgerState(session); }
      catch { setError('Transaction confirmed, but the ledger refresh failed. Refresh the state instead of resubmitting.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Transaction failed.');throw e; }
    finally {
      await session.setPrivateState({ threshold: 2n, nonce: null, secret: null });
      callLock.current = false;setCalling(false);
    }
  }
  return { wallets, selectedWallet, session, connecting, calling, error, lastCall, ledgerState, selectWallet: setSelectedWalletId, connectWallet, disconnectWallet,
    refresh: () => refreshLedgerState(),
    propose: (transfer: Transfer, ps: NightSafePrivateState) => call('propose', [transfer], ps),
    approve: (id: bigint, ps: NightSafePrivateState) => call('approve', [id], ps),
    execute: (id: bigint, ps: NightSafePrivateState) => call('execute', [id], ps),
    deposit: (color: Uint8Array, amount: bigint, ps: NightSafePrivateState) => call('deposit', [color, amount], ps),
  };
}
