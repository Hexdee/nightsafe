import { Check, ExternalLink, PlugZap, ShieldCheck, Unplug, X } from 'lucide-react';
import type { WalletEntry } from '../hooks/useMidnight';
import { TARGET_NETWORK } from '../lib/config';

type WalletConnectProps = {
  open: boolean;
  wallets: WalletEntry[];
  selectedWalletId: string | null;
  isConnected: boolean;
  connecting: boolean;
  address: string | null;
  networkId: string | null;
  error: string | null;
  onClose: () => void;
  onSelectWallet: (walletId: string) => void;
  onConnect: (walletId: string) => void;
  onDisconnect: () => void;
};

function shortAddress(address: string | null) {
  if (!address) return 'Not connected';
  return address.length > 20 ? `${address.slice(0, 12)}…${address.slice(-7)}` : address;
}

export function WalletConnect({ open, wallets, selectedWalletId, isConnected, connecting, address, networkId, error, onClose, onSelectWallet, onConnect, onDisconnect }: WalletConnectProps) {
  if (!open) return null;
  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId) ?? wallets[0] ?? null;

  return (
    <div className="modal-layer wallet-modal-layer" role="presentation">
      <button className="modal-scrim" onClick={onClose} aria-label="Close wallet dialog" />
      <section className="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-title">
        <header className="wallet-modal__header"><span className="wallet-modal__icon"><ShieldCheck size={22} /></span><div><span>MIDNIGHT NETWORK</span><h2 id="wallet-title">{isConnected ? 'Wallet connected' : 'Connect your wallet'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></header>

        {isConnected ? (
          <div className="connected-wallet">
            <span className="lace-logo">L</span>
            <div><small>CONNECTED ACCOUNT</small><strong>{shortAddress(address)}</strong><span><i />{networkId ?? TARGET_NETWORK}</span></div>
            <Check className="connected-check" size={18} />
          </div>
        ) : wallets.length ? (
          <div className="wallet-options">
            {wallets.map((wallet) => (
              <button key={wallet.id} className={wallet.id === selectedWallet?.id ? 'wallet-option wallet-option--selected' : 'wallet-option'} onClick={() => onSelectWallet(wallet.id)} type="button">
                <span className="lace-logo">{wallet.api.name.slice(0, 1)}</span><span><strong>{wallet.api.name}</strong><small>{wallet.api.rdns}</small></span>{wallet.id === selectedWallet?.id ? <Check size={17} /> : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="no-wallet"><span><PlugZap size={24} /></span><h3>No Midnight wallet found</h3><p>Install Lace, then refresh NightSafe to connect securely.</p><a href="https://www.lace.io/" target="_blank" rel="noreferrer">Get Lace wallet <ExternalLink size={14} /></a></div>
        )}

        {error ? <p className="error-banner">{error}</p> : null}

        <footer className="wallet-modal__footer">
          <p><ShieldCheck size={14} /> NightSafe never sees your private keys.</p>
          {isConnected ? <button className="secondary-button danger-button" onClick={onDisconnect} type="button"><Unplug size={16} />Disconnect</button> : selectedWallet ? <button className="primary-button" disabled={connecting} onClick={() => onConnect(selectedWallet.id)} type="button">{connecting ? 'Connecting…' : `Connect ${selectedWallet.api.name}`}</button> : null}
        </footer>
      </section>
    </div>
  );
}
