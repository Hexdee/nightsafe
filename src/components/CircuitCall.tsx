type CircuitCallProps = {
  connected: boolean;
  calling: boolean;
  contractCount: string;
  lastTxHash: string | null;
  lastTxId: string | null;
  error: string | null;
  onCall: (delta: bigint) => Promise<void>;
};

export function CircuitCall({
  connected,
  calling,
  contractCount,
  lastTxHash,
  lastTxId,
  error,
  onCall,
}: CircuitCallProps) {
  const delta = 1n;

  return (
    <section className="panel circuit-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Circuit</p>
          <h2>Prove an increment without revealing the limit</h2>
        </div>
        <span className="status-pill status-pill--quiet">Proved without revealing your input</span>
      </div>

      <p className="panel-copy">
        The browser asks Lace to prove the transaction locally, then submits the resulting on-chain update. The private
        witness stays hidden the whole time.
      </p>

      <div className="counter-display">
        <span className="field-label">Current public count</span>
        <strong>{contractCount}</strong>
      </div>

      <button className="button button--wide" type="button" onClick={() => void onCall(delta)} disabled={!connected || calling}>
        {calling ? 'Generating proof...' : 'Call increment(1)'}
      </button>

      <div className="circuit-stats">
        <div>
          <span className="field-label">Latest tx hash</span>
          <code>{lastTxHash ?? 'Pending'}</code>
        </div>
        <div>
          <span className="field-label">Latest tx id</span>
          <code>{lastTxId ?? 'Pending'}</code>
        </div>
      </div>

      {error ? <p className="error-banner">{error}</p> : null}
    </section>
  );
}
