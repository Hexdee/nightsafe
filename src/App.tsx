import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  LayoutDashboard,
  Menu,
  MoonStar,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { CoreFeature } from './components/CoreFeature';
import { WalletConnect } from './components/WalletConnect';
import { useMidnight } from './hooks/useMidnight';
import { CONTRACT_ADDRESS, CONTRACT_INITIAL_PRIVATE_LIMIT, TARGET_NETWORK } from './lib/config';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Transactions', icon: Activity },
  { label: 'Assets', icon: WalletCards },
  { label: 'Members', icon: Users },
] as const;

function shortAddress(address: string | null | undefined) {
  if (!address) return 'Not configured';
  if (address.length < 16) return address;
  return `${address.slice(0, 9)}…${address.slice(-5)}`;
}

export default function App() {
  const {
    wallets,
    selectedWallet,
    session,
    connecting,
    calling,
    error,
    lastCall,
    ledgerState,
    connectWallet,
    disconnectWallet,
    selectWallet,
    authorizeTreasuryMove,
  } = useMidnight();
  const [activeNav, setActiveNav] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = window.localStorage.getItem('nightsafe-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0c0f0e' : '#f5f7f3');
    window.localStorage.setItem('nightsafe-theme', theme);
  }, [theme]);

  const proposalCount = Number.parseInt(ledgerState.proposalCount, 10) || 0;
  const executedCount = Number.parseInt(ledgerState.executedCount, 10) || 0;
  const executionRate = proposalCount > 0 ? Math.min(100, (executedCount / proposalCount) * 100) : 0;
  const address = session?.address ?? null;
  const network = session?.networkId ?? TARGET_NETWORK;
  const shortContract = useMemo(() => shortAddress(CONTRACT_ADDRESS), []);

  async function copyAddress() {
    if (!CONTRACT_ADDRESS) return;
    await navigator.clipboard?.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function requestWallet() {
    setWalletOpen(true);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <a className="brand" href="#top" aria-label="NightSafe home">
            <span className="brand-mark"><MoonStar size={20} strokeWidth={2.2} /></span>
            <span>NightSafe</span>
          </a>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>

        <div className="safe-switcher safe-switcher--static">
          <span className="safe-avatar">NS</span>
          <span className="safe-switcher__copy"><small>CONTRACT STATUS</small><strong>{CONTRACT_ADDRESS ? 'NightSafe Treasury' : 'Deployment required'}</strong></span>
          <ShieldCheck size={16} />
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className={activeNav === item.label ? 'nav-item nav-item--active' : 'nav-item'} type="button" onClick={() => { setActiveNav(item.label); setMobileNav(false); }}>
                <Icon size={18} /><span>{item.label}</span>
                {item.label === 'Transactions' && proposalCount > 0 ? <em>{proposalCount}</em> : null}
              </button>
            );
          })}
        </nav>

        <div className="nav-divider" />
        <nav className="secondary-nav" aria-label="Secondary navigation">
          <button className="nav-item" type="button"><Settings size={18} /><span>Settings</span></button>
          <button className="nav-item" type="button"><CircleHelp size={18} /><span>Help & docs</span><ExternalLink size={14} className="nav-trail" /></button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="privacy-note"><span><Fingerprint size={18} /></span><div><strong>Private by default</strong><p>Approval details stay off-chain and are verified with zero-knowledge proofs.</p></div></div>
        <button className="wallet-pill" type="button" onClick={requestWallet}>
          <span className={session ? 'connection-dot connection-dot--live' : 'connection-dot'} />
          <span><strong>{session ? shortAddress(address) : 'Connect wallet'}</strong><small>{session ? network : 'Midnight Lace'}</small></span>
          <MoreHorizontal size={17} />
        </button>
      </aside>

      {mobileNav ? <button className="sidebar-scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" /> : null}

      <main className="main" id="top">
        <header className="topbar">
          <div className="topbar__left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Contracts</span><b>/</b><strong>NightSafe Treasury</strong></div></div>
          <div className="topbar__right">
            <label className="search-box"><Search size={16} /><input aria-label="Search" placeholder="Search transactions" /><kbd>⌘ K</kbd></label>
            <button className="icon-button theme-toggle" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={18} /> : <MoonStar size={18} />}</button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /></button>
            <div className="network-chip"><span />{TARGET_NETWORK}<ChevronDown size={14} /></div>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className={session ? 'live-dot' : 'live-dot live-dot--idle'} /> {session ? 'Wallet connected' : 'Wallet disconnected'}</div>
              <h1>Treasury overview</h1>
              <p>{session ? 'Live state from your NightSafe contract and this wallet session.' : 'Connect Lace to load your NightSafe contract state.'}</p>
            </div>
            <button className="primary-button" type="button" onClick={() => setTransactionOpen(true)}><Plus size={18} />New transaction</button>
          </section>

          <section className="overview-grid" aria-label="Treasury overview">
            <article className="balance-card">
              <div className="card-label"><span>Treasury assets</span><WalletCards size={17} /></div>
              <div className="card-empty card-empty--compact">
                <span className="empty-icon"><WalletCards size={21} /></span>
                <div>
                  <strong>{session ? 'No asset balance source connected' : 'Connect a wallet to view assets'}</strong>
                  <p>{session ? 'The current contract exposes authorization state, but no token balance feed.' : 'NightSafe will show wallet-backed treasury assets here once connected.'}</p>
                </div>
                {!session ? <button className="text-button" type="button" onClick={requestWallet}>Connect Lace <ArrowRight size={15} /></button> : null}
              </div>
            </article>

            <article className="quorum-card">
              <div className="card-title-row"><div><span className="card-kicker">PRIVATE SIGNING POLICY</span><h2>{CONTRACT_INITIAL_PRIVATE_LIMIT.toString()} approvals minimum</h2></div><span className="shield-badge"><ShieldCheck size={21} /></span></div>
              <div className="private-policy"><Fingerprint size={18} /><span>Threshold stored in private state</span></div>
              <p>Signer membership and individual approvals are intentionally not exposed by the current contract.</p>
              <button className="text-button" onClick={() => setActiveNav('Members')} type="button">View privacy model <ArrowRight size={15} /></button>
            </article>

            <article className="activity-card">
              <div className="card-label"><span>On-chain activity</span><Activity size={17} /></div>
              {session ? (
                <>
                  <div className="activity-stats"><div><strong>{proposalCount}</strong><span>Proposals</span></div><div><strong>{executedCount}</strong><span>Executed</span></div></div>
                  <div className="success-rate"><div><span>Execution rate</span><strong>{proposalCount > 0 ? `${executionRate.toFixed(1)}%` : 'No activity'}</strong></div><div className="progress"><span style={{ width: `${executionRate}%` }} /></div></div>
                </>
              ) : (
                <div className="activity-empty"><strong>Contract state not loaded</strong><p>Connect Lace to query the live proposal and execution counters.</p><button className="text-button" type="button" onClick={requestWallet}>Connect wallet <ArrowRight size={14} /></button></div>
              )}
              <div className="contract-line"><span>Contract</span>{CONTRACT_ADDRESS ? <button type="button" onClick={() => void copyAddress()}>{copied ? 'Copied' : shortContract}<Copy size={13} /></button> : <strong>Not configured</strong>}</div>
            </article>
          </section>

          <section className="transactions-section">
            <div className="section-heading"><div><h2>Recent transactions</h2><p>Verified activity available in this browser session.</p></div>{lastCall ? <button className="secondary-button" type="button" onClick={() => setActiveNav('Transactions')}>View activity <ArrowRight size={15} /></button> : null}</div>

            {lastCall ? (
              <div className="transaction-table" role="table" aria-label="Recent transactions">
                <div className="table-head" role="row"><span>Transaction</span><span>Amount</span><span>Approvals</span><span>Status</span><span>Created</span><span /></div>
                <div className="transaction-row" role="row">
                  <div className="transaction-name"><span className="tx-icon tx-icon--success"><FileCheck2 size={17} /></span><span><strong>Treasury authorization</strong><small>Commitment {shortAddress(lastCall.lastProposalCommitment)}</small></span></div>
                  <div className="transaction-amount"><strong>Private</strong><small>Not disclosed</small></div>
                  <div className="approvals"><span className="private-value"><Fingerprint size={14} /> Private</span></div>
                  <div><span className="status status--executed"><i />Executed</span></div>
                  <div className="transaction-time"><Clock3 size={14} />This session</div>
                  <button className="plain-icon row-menu" type="button" onClick={() => void navigator.clipboard?.writeText(lastCall.txHash)} aria-label="Copy transaction hash" title={lastCall.txHash}><Copy size={16} /></button>
                </div>
              </div>
            ) : (
              <div className="table-empty">
                <span className="empty-icon"><Activity size={22} /></span>
                <h3>No transaction activity yet</h3>
                <p>{session ? 'Transactions authorized during this session will appear here. Historical indexing is not connected yet.' : 'Connect Lace to read contract state and authorize a private treasury transaction.'}</p>
                <button className="secondary-button" type="button" onClick={session ? () => setTransactionOpen(true) : requestWallet}>{session ? <Plus size={15} /> : <WalletCards size={15} />}{session ? 'Create transaction' : 'Connect wallet'}</button>
              </div>
            )}
          </section>

          <section className="security-banner"><div className="security-icon"><ShieldCheck size={22} /></div><div><strong>Privacy guarantees are enforced by the contract.</strong><p>Public counters and commitments come from the ledger. Threshold and approval details remain in private state.</p></div><span className="verified-chip"><Check size={14} /> Compact circuit</span></section>
        </div>
      </main>

      <CoreFeature open={transactionOpen} connected={Boolean(session)} calling={calling} ledgerState={ledgerState} lastCall={lastCall} error={error} onClose={() => setTransactionOpen(false)} onConnectRequest={() => { setTransactionOpen(false); setWalletOpen(true); }} onAuthorize={authorizeTreasuryMove} />
      <WalletConnect open={walletOpen} wallets={wallets} selectedWalletId={selectedWallet?.id ?? null} isConnected={Boolean(session)} connecting={connecting} address={address} networkId={network} error={error} onClose={() => setWalletOpen(false)} onSelectWallet={selectWallet} onConnect={connectWallet} onDisconnect={disconnectWallet} />
    </div>
  );
}
