import { useState } from 'react';

export function LocalDemo() {
  const [running, setRunning] = useState(false);const [lines, setLines] = useState<string[]>([]);
  async function run() {
    setRunning(true);setLines([]);
    const add = (line: string) => setLines((old) => [...old, line]);
    try {
      const [runtime, NightSafe, { witnesses, createNightSafePrivateState }] = await Promise.all([
        import('@midnight-ntwrk/compact-runtime'), import('../generated/nightsafe/index.js'), import('../witnesses'),
      ]);
      const bytes = (n: number) => new Uint8Array(32).fill(n);
      const secrets = [bytes(1), bytes(2), bytes(3)];
      const nonce = crypto.getRandomValues(new Uint8Array(32));
      const privateState = (i: number) => createNightSafePrivateState(2n, secrets[i], nonce);
      const contract = new NightSafe.Contract(witnesses);
      const initial = contract.initialState(runtime.createConstructorContext(privateState(0), 'a'.repeat(64)), secrets.map((secret) => NightSafe.pureCircuits.signerPublicKey(secret)));
      // Explicit local test fixture. This is not a deposit or a network balance.
      initial.currentContractState.balance = new Map([[{ tag: 'unshielded', raw: '00'.repeat(32) }, 1000n]]);
      let ctx = runtime.createCircuitContext(runtime.dummyContractAddress(), 'a'.repeat(64), initial.currentContractState, initial.currentPrivateState);
      add('Local test treasury created: three test keys, threshold 2, fixture balance 1000 units.');
      ctx = contract.circuits.propose(ctx, { recipient: { bytes: bytes(7) }, color: bytes(0), amount: 100n, memoCommitment: bytes(8) }).context;
      add('Proposal #1 created for recipient 0707…0707 and 100 units. Approvals: 0.');
      try { contract.circuits.execute(ctx, 1n);throw new Error('Quorum check unexpectedly accepted.'); } catch (e) {
        if (!(e instanceof Error) || !e.message.includes('not enough approvals')) throw e;
        add('Execution before quorum: rejected by the compiled contract.');
      }
      ctx = contract.circuits.approve(ctx, 1n).context;add('Test key A approved. Approvals: 1.');
      try { contract.circuits.approve(ctx, 1n);throw new Error('Duplicate unexpectedly accepted.'); } catch (e) {
        if (!(e instanceof Error) || !e.message.includes('already approved')) throw e;
        add('Duplicate approval from key A: rejected by the compiled contract.');
      }
      ctx = contract.circuits.approve({ ...ctx, currentPrivateState: privateState(1) }, 1n).context;add('Different test key B approved. Approvals: 2.');
      ctx = contract.circuits.execute(ctx, 1n).context;
      const amounts = [...ctx.currentQueryContext.effects.claimedUnshieldedSpends.values()];
      if (amounts.length !== 1 || amounts[0] !== 100n) throw new Error('Unexpected payout effect.');
      add('Execution emits an unshielded payout effect of 100 units. Proposal #1 is consumed.');
      try { contract.circuits.execute(ctx, 1n);throw new Error('Replay unexpectedly accepted.'); } catch (e) {
        if (!(e instanceof Error) || !e.message.includes('already executed')) throw e;
        add('Second execution: rejected by the compiled contract.');
      }
      add('Simulation complete. No proof, wallet transaction or network settlement occurred.');
    } catch (e) { add(`Demo failed: ${e instanceof Error ? e.message : 'Unknown error'}`); }
    finally { setRunning(false); }
  }
  return <section className="transactions-card"><div className="section-heading"><div><h2>Try the local circuit demo</h2><p>Runs the real compiled contract in your browser with public test keys and a funded local fixture. No wallet required.</p></div><button className="primary-button" disabled={running} onClick={() => void run()}>{running ? 'Evaluating contract…' : 'Run local demonstration'}</button></div>
    <div className="ns-form"><p>This simulation tests separate keys under one operator. It does not generate a zero-knowledge proof or submit a transaction. Production usage needs independently controlled private keys and a deployed contract.</p>{lines.length > 0 && <ol role="log" aria-live="polite" className="ns-demo-log">{lines.map((line, i) => <li key={i}>{line}</li>)}</ol>}</div>
  </section>;
}
