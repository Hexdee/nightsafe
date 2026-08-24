import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Fingerprint, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { bytesToHex } from '../lib/encoding';
import type { TreasuryCallResult, TreasuryLedgerSnapshot } from '../hooks/useMidnight';

type CoreFeatureProps = {
  open: boolean;
  connected: boolean;
  calling: boolean;
  ledgerState: TreasuryLedgerSnapshot;
  lastCall: TreasuryCallResult | null;
  error: string | null;
  onClose: () => void;
  onConnectRequest: () => void;
  onAuthorize: (proposalCommitment: Uint8Array, approvalCommitment: Uint8Array, approvalCount: bigint) => Promise<void>;
};

async function sha256Bytes(message: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

export function CoreFeature({
  open,
  connected,
  calling,
  ledgerState,
  lastCall,
  error,
  onClose,
  onConnectRequest,
  onAuthorize,
}: CoreFeatureProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [approvalCount, setApprovalCount] = useState('2');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localCommitment, setLocalCommitment] = useState<string | null>(null);

  const formattedAmount = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0';
  }, [amount]);

  async function handleSubmit() {
    setLocalError(null);
    const cleanAmount = amount.trim();
    const cleanRecipient = recipient.trim();
    const cleanNote = note.trim();
    const approvals = Number.parseInt(approvalCount.trim(), 10);

    if (!cleanAmount || !cleanRecipient || !cleanNote) {
      setLocalError('Complete the recipient, amount, and private note.');
      return;
    }
    if (!Number.isFinite(approvals) || approvals < 2) {
      setLocalError('At least two approvals are required.');
      return;
    }

    const proposalCommitment = await sha256Bytes(`NightSafe:proposal:${cleanAmount}:${cleanRecipient}:${cleanNote}`);
    const approvalCommitment = await sha256Bytes(`NightSafe:approvals:${cleanAmount}:${cleanRecipient}:${approvalCount}:${cleanNote}`);
    setLocalCommitment(bytesToHex(proposalCommitment));
    await onAuthorize(proposalCommitment, approvalCommitment, BigInt(approvals));
  }

  if (!open) return null;

  return (
    <div className="modal-layer" role="presentation">
      <button className="modal-scrim" onClick={onClose} aria-label="Close transaction composer" />
      <section className="transaction-drawer" role="dialog" aria-modal="true" aria-labelledby="transaction-title">
        <header className="drawer-header">
          <div><span className="drawer-kicker">ATLAS TREASURY</span><h2 id="transaction-title">New transaction</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>

        <div className="drawer-body">
          <div className="step-indicator"><span className="active"><i>1</i>Details</span><b /><span><i>2</i>Review & prove</span></div>

          <div className="form-section">
            <label className="form-field"><span>Recipient address</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Enter a Midnight address" /></label>
            <div className="form-grid">
              <label className="form-field"><span>Amount</span><div className="input-with-unit"><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0" /><strong>tDUST</strong></div></label>
              <label className="form-field"><span>Approvals collected</span><div className="select-wrap"><select value={approvalCount} onChange={(event) => setApprovalCount(event.target.value)}><option value="2">2 approvals</option><option value="3">3 approvals</option><option value="4">4 approvals</option></select></div></label>
            </div>
            <label className="form-field"><span>Private note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Add context for this authorization" /><small><LockKeyhole size={13} /> Encrypted locally. Never published on-chain.</small></label>
          </div>

          <div className="transaction-preview">
            <div><span>You send</span><strong>{formattedAmount} tDUST</strong></div>
            <div><span>Network</span><strong>Midnight Preprod</strong></div>
            <div><span>Network fee</span><strong>Calculated on approval</strong></div>
          </div>

          <div className="proof-callout">
            <span><Fingerprint size={20} /></span>
            <div><strong>Zero-knowledge authorization</strong><p>NightSafe proves the quorum is valid without revealing the signing threshold, approval set, recipient context, or private note.</p></div>
          </div>

          {localCommitment ? <div className="commitment-box"><span>Local proposal commitment</span><code>{lastCall?.lastProposalCommitment ?? localCommitment}</code></div> : null}
          {error || localError ? <p className="error-banner">{localError ?? error}</p> : null}
          {lastCall ? <p className="success-banner"><Check size={16} /> Transaction proved and submitted. Public proposal #{ledgerState.proposalCount}.</p> : null}
        </div>

        <footer className="drawer-footer">
          <button className="secondary-button" type="button" onClick={onClose}><ChevronLeft size={16} />Cancel</button>
          {connected ? (
            <button className="primary-button" type="button" disabled={calling} onClick={() => void handleSubmit()}>
              {calling ? 'Generating private proof…' : 'Review & generate proof'}{!calling ? <ArrowRight size={17} /> : null}
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={onConnectRequest}><ShieldCheck size={17} />Connect wallet first</button>
          )}
        </footer>
      </section>
    </div>
  );
}
