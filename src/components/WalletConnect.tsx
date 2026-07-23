import type { WalletEntry } from '../hooks/useMidnight';
import { TARGET_NETWORK } from '../lib/config';

type WalletConnectProps = {
  wallets: WalletEntry[];
  selectedWalletId: string | null;
  isConnected: boolean;
  connecting: boolean;
  address: string | null;
  networkId: string | null;
  error: string | null;
  onSelectWallet: (walletId: string) => void;
  onConnect: (walletId: string) => void;
  onDisconnect: () => void;
};

function walletTag(wallet: WalletEntry) {
  return /lace/i.test(wallet.api.name) || /lace/i.test(wallet.api.rdns) ? 'Lace' : 'Wallet';
}

export function WalletConnect({
  wallets,
  selectedWalletId,
  isConnected,
  connecting,
  address,
  networkId,
  error,
  onSelectWallet,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId) ?? null;

  return (
    <section className="panel wallet-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Wallet</p>
          <h2>Connect Lace on {TARGET_NETWORK}</h2>
        </div>
        <span className={`status-pill ${isConnected ? 'status-pill--live' : 'status-pill--idle'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {selectedWallet ? (
        <div className="wallet-card">
          <div className="wallet-card__meta">
            <div className="wallet-avatar">{walletTag(selectedWallet)}</div>
            <div>
              <strong>{selectedWallet.api.name}</strong>
              <p>{selectedWallet.api.rdns}</p>
            </div>
          </div>
          <div className="wallet-card__actions">
            <button className="button button--ghost" type="button" onClick={() => onSelectWallet(selectedWallet.id)}>
              {selectedWallet.api.apiVersion}
            </button>
            {isConnected ? (
              <button className="button" type="button" onClick={onDisconnect}>
                Disconnect
              </button>
            ) : (
              <button
                className="button"
                type="button"
                onClick={() => onConnect(selectedWallet.id)}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <strong>No Midnight wallet detected.</strong>
          <p>Install Lace, refresh the page, and connect from the wallet button.</p>
        </div>
      )}

      <div className="wallet-list">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            type="button"
            className={`wallet-list__item ${wallet.id === selectedWalletId ? 'wallet-list__item--active' : ''}`}
            onClick={() => onSelectWallet(wallet.id)}
          >
            <span>{wallet.api.name}</span>
            <small>{wallet.id}</small>
          </button>
        ))}
      </div>

      <div className="wallet-grid">
        <div>
          <span className="field-label">Address</span>
          <code>{address ?? 'Not connected'}</code>
        </div>
        <div>
          <span className="field-label">Network</span>
          <code>{networkId ?? 'Unknown'}</code>
        </div>
      </div>

      {error ? <p className="error-banner">{error}</p> : null}
    </section>
  );
}
