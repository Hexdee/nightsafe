import { useState } from 'react';
import { X } from 'lucide-react';
import type { Transfer } from '../generated/nightsafe/index.js';
import { commitMemo, parseAmount, parseBytes32 } from '../lib/treasury';

type Props = { open: boolean; calling: boolean; onClose(): void; onPropose(transfer: Transfer): Promise<void> };
export function CoreFeature({ open, calling, onClose, onPropose }: Props) {
  const [recipient, setRecipient] = useState('');const [amount, setAmount] = useState('');
  const [color, setColor] = useState('0'.repeat(64));const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    setError(null);
    try {
      const memo = await commitMemo(note);
      await onPropose({ recipient: { bytes: parseBytes32(recipient, 'Recipient public address') }, color: parseBytes32(color, 'Token color'), amount: parseAmount(amount), memoCommitment: memo.commitment });
      setRecipient('');setAmount('');setNote('');onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to propose payment.'); }
  }
  if (!open) return null;
  return <div className="modal-layer"><div className="modal-scrim" /><section className="transaction-drawer" role="dialog" aria-modal="true" aria-labelledby="transaction-title">
    <header className="drawer-header"><div><span className="drawer-kicker">NIGHTSAFE TREASURY</span><h2 id="transaction-title">Propose payment</h2></div><button className="icon-button" onClick={onClose} disabled={calling} aria-label="Close"><X /></button></header>
    <div className="drawer-body"><div className="form-section">
      <label className="form-field"><span>Recipient public address (64 hex characters)</span><input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Unshielded address bytes" /></label>
      <label className="form-field"><span>Amount in token base units</span><input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="1000000" /></label>
      <label className="form-field"><span>Unshielded token color</span><input value={color} onChange={(e) => setColor(e.target.value)} /></label>
      <small>Native test NIGHT uses the all-zero color. DUST pays fees and is not a transferable treasury asset.</small>
      <label className="form-field"><span>Private note (optional)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context for your own records" /></label>
    </div><div className="proof-callout"><p>Recipient, token and amount are public. Only a hash of the note with fresh random salt is recorded. This form does not store or encrypt the note. Proposing does not approve or execute the payment.</p></div>{error && <p role="alert" className="error-banner">{error}</p>}</div>
    <footer className="drawer-footer"><button className="secondary-button" onClick={onClose} disabled={calling}>Cancel</button><button className="primary-button" onClick={() => void submit()} disabled={calling}>{calling ? 'Submitting…' : 'Create proposal'}</button></footer>
  </section></div>;
}
