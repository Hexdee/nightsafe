import { useMemo } from 'react';
import { CoreFeature } from './components/CoreFeature';
import { Layout } from './components/Layout';
import { WalletConnect } from './components/WalletConnect';
import { TARGET_NETWORK } from './lib/config';
import { useMidnight } from './hooks/useMidnight';

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

  const connectionAddress = session?.address ?? null;
  const networkId = session?.networkId ?? TARGET_NETWORK;

  const subtitle = useMemo(
    () =>
      session
        ? 'Lace is connected and NightSafe can prove a treasury action privately.'
        : 'Connect Lace to prove a multisig treasury move without exposing the sensitive details on-chain.',
    [session],
  );

  return (
    <Layout>
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Midnight Builder Challenge · Level 4</p>
          <h1>NightSafe</h1>
          <p className="hero__lede">
            A confidential multisig treasury app for teams that need Safe-style coordination on Midnight.
          </p>
          <p className="hero__subcopy">{subtitle}</p>
        </div>

        <div className="hero__metrics">
          <div className="metric">
            <span className="field-label">Target network</span>
            <strong>{TARGET_NETWORK}</strong>
          </div>
          <div className="metric">
            <span className="field-label">Wallet status</span>
            <strong>{session ? 'Ready' : 'Waiting'}</strong>
          </div>
          <div className="metric">
            <span className="field-label">Public proposals</span>
            <strong>{ledgerState.proposalCount}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard">
        <WalletConnect
          wallets={wallets}
          selectedWalletId={selectedWallet?.id ?? null}
          isConnected={Boolean(session)}
          connecting={connecting}
          address={connectionAddress}
          networkId={networkId}
          error={error}
          onSelectWallet={selectWallet}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />

        <CoreFeature
          connected={Boolean(session)}
          calling={calling}
          ledgerState={ledgerState}
          lastCall={lastCall}
          error={error}
          onAuthorize={authorizeTreasuryMove}
        />
      </section>

      <section className="footer-panel">
        <div>
          <span className="field-label">Privacy claim</span>
          <p>
            An observer can verify that a treasury action was authorized and executed, but cannot see the approval
            threshold or the raw treasury details that were committed privately in the browser.
          </p>
        </div>
        <div>
          <span className="field-label">Local proof server</span>
          <p>Proof generation happens through the local Midnight proof server at `http://127.0.0.1:6300`.</p>
        </div>
      </section>
    </Layout>
  );
}
