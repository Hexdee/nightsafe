import { useState } from 'react';
import { Fingerprint, Plus, ShieldCheck, WalletCards, RefreshCw } from 'lucide-react';
import { CoreFeature } from './components/CoreFeature';
import { LocalDemo } from './components/LocalDemo';
import { WalletConnect } from './components/WalletConnect';
import { useMidnight } from './hooks/useMidnight';
import { CONTRACT_ADDRESS, TARGET_NETWORK } from './lib/config';
import { bytesToHex } from './lib/encoding';
import { parseAmount, parseBytes32 } from './lib/treasury';
import { createNightSafePrivateState } from './witnesses';

export default function App() {
  const m = useMidnight();
  const [walletOpen, setWalletOpen] = useState(false);const [proposalOpen, setProposalOpen] = useState(false);
  const [secret, setSecret] = useState('');const [publicKey, setPublicKey] = useState('');
  const [threshold, setThreshold] = useState('2');const [nonce, setNonce] = useState('');
  const [depositAmount, setDepositAmount] = useState('');const [depositColor, setDepositColor] = useState('0'.repeat(64));
  const [notice, setNotice] = useState('');const [localError, setLocalError] = useState('');
  function privateState() { return createNightSafePrivateState(BigInt(threshold), secret ? parseBytes32(secret, 'Signer key') : null, nonce ? parseBytes32(nonce, 'Policy opening') : null); }
  async function run(action: () => Promise<unknown>) { setLocalError('');setNotice('');try { await action(); } catch (e) { setLocalError(e instanceof Error ? e.message : 'Action failed.'); } }
  async function setSigner(value: string) {
    const bytes = parseBytes32(value, 'Signer key');
    const { pureCircuits } = await import('./generated/nightsafe/index.js');
    setSecret(value);setPublicKey(bytesToHex(pureCircuits.signerPublicKey(bytes)));
  }
  async function newSigner() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const value = bytesToHex(bytes);await setSigner(value);
    const { pureCircuits } = await import('./generated/nightsafe/index.js');
    const key = bytesToHex(pureCircuits.signerPublicKey(bytes));
    const blob = new Blob([JSON.stringify({ version: 2, secret: value, publicKey: key }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);const anchor = document.createElement('a');anchor.href = url;anchor.download = 'nightsafe-signer-private.json';anchor.click();URL.revokeObjectURL(url);
    setNotice('Signer key downloaded. Keep this file private and backed up. Share only the public key. Each signer must generate their own key.');
  }
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#top"><span className="brand-mark"><img src="/brand/nightsafe-logo.png" alt="" /></span><span>NightSafe</span></a>
      <div className="safe-switcher safe-switcher--static"><span className="safe-avatar">NS</span><span className="safe-switcher__copy"><small>MIDNIGHT</small><strong>Shared treasury</strong></span><ShieldCheck size={18} /></div>
      <p className="privacy-note">Three registered signers. A fixed, committed threshold. Independent approvals for each payment.</p>
      <div className="sidebar-spacer" /><button className="wallet-pill" onClick={() => setWalletOpen(true)} disabled={m.calling}><WalletCards size={18} /><span>{m.session ? 'Wallet connected' : 'Connect wallet'}</span></button>
    </aside>
    <main className="main" id="top"><header className="topbar"><strong>NightSafe Treasury</strong><span className="network-chip">{TARGET_NETWORK}</span></header>
      <div className="content"><section className="page-heading"><div><div className="eyebrow"><Fingerprint size={16} /> AUTHENTICATED APPROVALS</div><h1>Treasury overview</h1><p>Propose a payment, collect independent approvals, then execute once.</p></div>
        <button className="primary-button" disabled={!m.session || m.calling} onClick={() => setProposalOpen(true)}><Plus size={18} />Propose payment</button></section>
      {!CONTRACT_ADDRESS && <p className="error-banner">This V2 treasury needs a new deployment. The previous prototype address cannot accept these calls. See the setup guide in the repository.</p>}
      <LocalDemo />
      <section className="overview-grid"><article className="balance-card"><div className="card-label">Proposals</div><h2>{m.ledgerState.proposalCount}</h2><p>Recorded on the connected contract</p></article>
        <article className="balance-card"><div className="card-label">Executed payments</div><h2>{m.ledgerState.executedCount}</h2><p>Quorum-approved transfers from contract custody</p></article></section>
      <section className="transactions-card"><div className="section-heading"><div><h2>Your signer identity</h2><p>Separate from your wallet seed. Secrets stay in this browser session and are cleared on reload.</p></div><button className="secondary-button" disabled={m.calling} onClick={() => void run(newSigner)}>Generate & download key</button></div>
        <div className="form-section ns-form"><label className="form-field"><span>Load your private signer key file</span><input type="file" accept="application/json" disabled={m.calling} onChange={(e) => { const file = e.target.files?.[0];if(file) void run(async () => { const data = JSON.parse(await file.text());await setSigner(data.secret); });e.target.value = ''; }} /></label>
          <label className="form-field"><span>Or enter your NightSafe signer key</span><input type="password" autoComplete="off" value={secret} disabled={m.calling} onChange={(e) => { setSecret(e.target.value);setPublicKey(''); }} onBlur={() => { if(secret) void run(() => setSigner(secret)); }} /></label>
          {publicKey && <label className="form-field"><span>Your public signer key (safe to share)</span><input readOnly value={publicKey} /></label>}
          <button className="secondary-button" disabled={m.calling} onClick={() => { setSecret('');setPublicKey('');setNonce(''); }}>Clear private inputs</button>
        </div>
        {m.ledgerState.signerKeys.length > 0 && <div className="ns-form"><h3>Registered signers</h3>{m.ledgerState.signerKeys.map((key) => <p className="ns-code" key={key}>{key}{key === publicKey ? ' (you)' : ''}</p>)}</div>}
      </section>
      <section className="transactions-card"><div className="section-heading"><div><h2>Execution policy</h2><p>Enter the policy opening shared by the treasury creator. The contract checks it against the immutable commitment.</p></div></div><div className="form-section ns-form">
        <label className="form-field"><span>Required approvals</span><select value={threshold} disabled={m.calling} onChange={(e) => setThreshold(e.target.value)}><option value="2">2 of 3</option><option value="3">3 of 3</option></select></label>
        <label className="form-field"><span>Private policy opening (64 hex characters)</span><input type="password" autoComplete="off" value={nonce} disabled={m.calling} onChange={(e) => setNonce(e.target.value)} /></label>
        {m.ledgerState.policyCommitment && <p className="ns-code">Public policy commitment: {m.ledgerState.policyCommitment}</p>}
      </div></section>
      <section className="transactions-card"><div className="section-heading"><div><h2>Fund the treasury</h2><p>Deposit test unshielded tokens into contract custody. Amounts use base units. DUST is for fees.</p></div></div><div className="form-section ns-form">
        <label className="form-field"><span>Token color (all zeroes for native test NIGHT)</span><input value={depositColor} disabled={m.calling} onChange={(e) => setDepositColor(e.target.value)} /></label>
        <label className="form-field"><span>Amount in base units</span><input inputMode="numeric" value={depositAmount} disabled={m.calling} onChange={(e) => setDepositAmount(e.target.value)} /></label>
        <button className="primary-button" disabled={!m.session || m.calling} onClick={() => void run(() => m.deposit(parseBytes32(depositColor, 'Token color'), parseAmount(depositAmount), privateState()))}>Deposit test tokens</button>
      </div></section>
      <section className="transactions-card"><div className="section-heading"><div><h2>Payment proposals</h2><p>Recipient, amount and signer participation are public. Notes use a hash with fresh salt.</p></div><button className="secondary-button" disabled={!m.session || m.calling} onClick={() => void run(m.refresh)}><RefreshCw size={16} />Refresh</button></div>
        {m.ledgerState.proposals.length === 0 ? <div className="table-empty"><h3>No proposals loaded</h3><p>Connect a wallet to the deployed V2 treasury, then create a payment proposal.</p></div> : m.ledgerState.proposals.map((p) => <article className="ns-proposal" key={p.id}>
          <h3>Proposal #{p.id} · {p.executed ? 'Executed' : `${p.approvals} independent approvals`}</h3><p>{p.amount} token base units</p><p className="ns-code">To: {p.recipient}</p><p className="ns-code">Token: {p.color}</p><p className="ns-code">Memo commitment: {p.memoCommitment}</p>
          <div className="ns-actions"><button className="secondary-button" disabled={p.executed || m.calling || !secret} onClick={() => void run(() => m.approve(BigInt(p.id), privateState()))}>Approve with my signer key</button><button className="primary-button" disabled={p.executed || m.calling || !nonce} onClick={() => void run(() => m.execute(BigInt(p.id), privateState()))}>Execute approved payment</button></div>
        </article>)}
      </section>
      {m.calling && <p role="status" className="success-banner">Generating proof and waiting for network confirmation…</p>}
      {(localError || m.error) && <p role="alert" className="error-banner">{localError || m.error}</p>}
      {notice && <p role="status" className="success-banner">{notice}</p>}
      {m.lastCall && <p className="success-banner ns-code">Confirmed {m.lastCall.action}: {m.lastCall.txHash}</p>}
      <section className="security-banner"><ShieldCheck /><div><strong>Test-network treasury</strong><p>Signer secrets and the policy opening are private witnesses. Payment details and approval participation are public. This implementation has not received an independent security audit.</p></div></section>
      <p className="ns-code">Contract: {CONTRACT_ADDRESS || 'Deployment required'}</p>
    </div></main>
    <CoreFeature open={proposalOpen} calling={m.calling} onClose={() => setProposalOpen(false)} onPropose={(transfer) => m.propose(transfer, privateState())} />
    <WalletConnect open={walletOpen} wallets={m.wallets} selectedWalletId={m.selectedWallet?.id ?? null} isConnected={Boolean(m.session)} connecting={m.connecting} address={m.session?.address ?? null} networkId={TARGET_NETWORK} error={m.error} onClose={() => setWalletOpen(false)} onSelectWallet={m.selectWallet} onConnect={m.connectWallet} onDisconnect={m.disconnectWallet} />
  </div>;
}
