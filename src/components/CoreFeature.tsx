import { useMemo, useState } from 'react';
import { bytesToHex } from '../lib/encoding';
import type { TreasuryCallResult, TreasuryLedgerSnapshot } from '../hooks/useMidnight';

type CoreFeatureProps = {
  connected: boolean;
  calling: boolean;
  ledgerState: TreasuryLedgerSnapshot;
  lastCall: TreasuryCallResult | null;
  error: string | null;
  onAuthorize: (proposalCommitment: Uint8Array, approvalCommitment: Uint8Array, approvalCount: bigint) => Promise<void>;
};

async function sha256Bytes(message: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

export function CoreFeature({
  connected,
  calling,
  ledgerState,
  lastCall,
  error,
  onAuthorize,
}: CoreFeatureProps) {
  const [recipient, setRecipient] = useState('Operations vault');
  const [amount, setAmount] = useState('250');
  const [approvalCount, setApprovalCount] = useState('2');
  const [note, setNote] = useState('Monthly treasury transfer');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localCommitment, setLocalCommitment] = useState<string | null>(null);

  const statusText = useMemo(() => {
    if (!connected) return 'Connect Lace to prove a treasury action.';
    if (calling) return 'Generating a private proof locally before submission.';
    return 'Ready to prove a quorum without revealing the raw treasury details.';
  }, [calling, connected]);

  async function handleSubmit() {
    setLocalError(null);

    const cleanAmount = amount.trim();
    const cleanRecipient = recipient.trim();
    const cleanNote = note.trim();
    const approvals = Number.parseInt(approvalCount.trim(), 10);

    if (!cleanAmount || !cleanRecipient || !cleanNote) {
      setLocalError('Fill in the amount, recipient, and note first.');
      return;
    }
    if (!Number.isFinite(approvals) || approvals < 2) {
      setLocalError('Approval count must be at least 2.');
      return;
    }

    const proposalCommitment = await sha256Bytes(
      `NightSafe:proposal:${cleanAmount}:${cleanRecipient}:${cleanNote}`,
    );
    const approvalCommitment = await sha256Bytes(
      `NightSafe:approvals:${cleanAmount}:${cleanRecipient}:${approvalCount}:${cleanNote}`,
    );

    setLocalCommitment(bytesToHex(proposalCommitment));
    await onAuthorize(proposalCommitment, approvalCommitment, BigInt(approvals));
  }

  return (
    <section className="panel circuit-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Privacy core</p>
          <h2>Prove the multisig quorum without exposing the treasury details</h2>
        </div>
        <span className="status-pill status-pill--quiet">Proved without revealing your input</span>
      </div>

      <p className="panel-copy">{statusText}</p>

      <div className="proposal-grid">
        <label>
          <span className="field-label">Recipient label</span>
          <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Operations vault" />
        </label>
        <label>
          <span className="field-label">Amount</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="250" inputMode="numeric" />
        </label>
        <label>
          <span className="field-label">Approvals</span>
          <input value={approvalCount} onChange={(event) => setApprovalCount(event.target.value)} placeholder="2" inputMode="numeric" />
        </label>
        <label>
          <span className="field-label">Memo</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Monthly treasury transfer" />
        </label>
      </div>

      <div className="counter-display">
        <span className="field-label">Public audit trail</span>
        <strong>{ledgerState.proposalCount} proposals · {ledgerState.executedCount} executed</strong>
        <code>{ledgerState.lastProposalCommitment}</code>
      </div>

      <button className="button button--wide" type="button" onClick={() => void handleSubmit()} disabled={!connected || calling}>
        {calling ? 'Generating proof...' : 'Authorize treasury move'}
      </button>

      <div className="circuit-stats">
        <div>
          <span className="field-label">Latest proposal commitment</span>
          <code>{lastCall?.lastProposalCommitment ?? localCommitment ?? 'Pending'}</code>
        </div>
        <div>
          <span className="field-label">Latest approval commitment</span>
          <code>{lastCall?.lastApprovalCommitment ?? 'Pending'}</code>
        </div>
      </div>

      <div className="circuit-stats">
        <div>
          <span className="field-label">Transaction hash</span>
          <code>{lastCall?.txHash ?? 'Pending'}</code>
        </div>
        <div>
          <span className="field-label">Transaction id</span>
          <code>{lastCall?.txId ?? 'Pending'}</code>
        </div>
      </div>

      {localError ? <p className="error-banner">{localError}</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}
    </section>
  );
}
