import assert from 'node:assert/strict';
import test from 'node:test';
import { createCircuitContext, createConstructorContext, dummyContractAddress, type CircuitContext } from '@midnight-ntwrk/compact-runtime';
import * as NightSafe from '../contracts/managed/nightsafe/contract/index.js';
import { createNightSafePrivateState, witnesses, type NightSafePrivateState } from '../src/witnesses.js';

const bytes = (n: number) => new Uint8Array(32).fill(n);
const secrets = [bytes(1), bytes(2), bytes(3)];
const keys = secrets.map((secret) => NightSafe.pureCircuits.signerPublicKey(secret));
const nonce = bytes(9);
const color = bytes(0);
const state = (index = 0, threshold = 2n) => createNightSafePrivateState(threshold, secrets[index] ?? bytes(99), nonce);
const contract = new NightSafe.Contract(witnesses);
const payment: NightSafe.Transfer = { recipient: { bytes: bytes(7) }, color, amount: 100n, memoCommitment: bytes(8) };
function fresh(threshold = 2n, signers = keys) {
  const initial = contract.initialState(createConstructorContext(state(0, threshold), 'a'.repeat(64)), signers);
  initial.currentContractState.balance = new Map([[{ tag: 'unshielded' as const, raw: '00'.repeat(32) }, 1000n]]);
  return createCircuitContext(dummyContractAddress(), 'a'.repeat(64), initial.currentContractState, initial.currentPrivateState);
}
function asSigner(ctx: CircuitContext<NightSafePrivateState>, index: number, threshold = 2n) {
  return { ...ctx, currentPrivateState: state(index, threshold) };
}
function proposed(threshold = 2n) { return contract.circuits.propose(fresh(threshold), payment).context; }
function approved(threshold = 2n) {
  let ctx = proposed(threshold);
  ctx = contract.circuits.approve(ctx, 1n).context;
  ctx = contract.circuits.approve(asSigner(ctx, 1, threshold), 1n).context;
  return ctx;
}
const read = (ctx: CircuitContext) => NightSafe.ledger(ctx.currentQueryContext.state);

test('constructor fixes distinct signer keys and a policy commitment', () => {
  const ledger = read(fresh());
  assert.deepEqual(ledger.signerKeys, keys);
  assert.notDeepEqual(ledger.policyCommitment, bytes(0));
  assert.equal((ledger as any).threshold, undefined);
});
test('duplicate and empty signer keys fail deployment', () => {
  assert.throws(() => fresh(2n, [keys[0], keys[0], keys[2]]), /duplicate signer/);
  assert.throws(() => fresh(2n, [bytes(0), keys[1], keys[2]]), /empty signer/);
});
test('contract rejects thresholds outside two or three even with malicious witnesses', () => {
  for (const threshold of [0n, 1n, 4n, 255n]) {
    const malicious = { ...state(), threshold };
    assert.throws(() => contract.initialState(createConstructorContext(malicious, 'a'.repeat(64)), keys), /threshold/);
  }
});
test('unauthorized key cannot propose or approve', () => {
  assert.throws(() => contract.circuits.propose(asSigner(fresh(), 99), payment), /unauthorized signer/);
  assert.throws(() => contract.circuits.approve(asSigner(proposed(), 99), 1n), /unauthorized signer/);
});
test('new proposal stores exact payout without inventing approvals', () => {
  const ctx = proposed(); const l = read(ctx);
  assert.deepEqual(l.proposals.lookup(1n), payment);
  assert.equal(l.approvalCounts.lookup(1n), 0n);
  assert.equal(l.proposalCount, 1n); assert.equal(l.executedCount, 0n);
});
test('zero amount and empty recipient cannot create proposals', () => {
  assert.throws(() => contract.circuits.propose(fresh(), { ...payment, amount: 0n }), /positive/);
  assert.throws(() => contract.circuits.propose(fresh(), { ...payment, recipient: { bytes: bytes(0) } }), /empty recipient/);
});
test('one signer cannot approve the same proposal twice', () => {
  const ctx = contract.circuits.approve(proposed(), 1n).context;
  assert.equal(read(ctx).approvalCounts.lookup(1n), 1n);
  assert.throws(() => contract.circuits.approve(ctx, 1n), /already approved/);
});
test('different registered signers contribute separate approvals', () => {
  assert.equal(read(approved()).approvalCounts.lookup(1n), 2n);
});
test('approvals are bound to their proposal, not copied to a second payment', () => {
  const ctx = contract.circuits.propose(approved(), { ...payment, amount: 200n }).context;
  assert.equal(read(ctx).approvalCounts.lookup(2n), 0n);
  assert.throws(() => contract.circuits.execute(ctx, 2n), /not enough approvals/);
});
test('execute rejects missing and insufficient approvals', () => {
  assert.throws(() => contract.circuits.execute(fresh(), 1n), /unknown proposal/);
  assert.throws(() => contract.circuits.execute(proposed(), 1n), /not enough approvals/);
  assert.throws(() => contract.circuits.execute(approved(3n), 1n), /not enough approvals/);
});
test('caller cannot lower a deployed three-of-three threshold', () => {
  const ctx = approved(3n);
  assert.throws(() => contract.circuits.execute({ ...ctx, currentPrivateState: state(0, 2n) }, 1n), /invalid treasury policy/);
});
test('wrong policy blinding nonce cannot authorize execution', () => {
  const ctx = approved();
  assert.throws(() => contract.circuits.execute({ ...ctx, currentPrivateState: { ...state(), nonce: bytes(10) } }, 1n), /invalid treasury policy/);
});
test('quorum executes exactly the stored transfer and records its consumption', () => {
  const ctx = contract.circuits.execute(approved(), 1n).context;
  assert.equal(read(ctx).executedCount, 1n);
  assert.equal(read(ctx).executed.member(1n), true);
  const effects = ctx.currentQueryContext.effects;
  assert.equal([...effects.unshieldedOutputs.values()].reduce((a, b) => a + b, 0n), 100n);
  assert.equal(effects.claimedUnshieldedSpends.size, 1);
  const [[[, recipient], amount]] = [...effects.claimedUnshieldedSpends];
  assert.deepEqual(recipient, { tag: "user", address: "07".repeat(32) });
  assert.equal(amount, payment.amount);
});
test('execution replay and approval after execution are rejected', () => {
  const ctx = contract.circuits.execute(approved(), 1n).context;
  assert.throws(() => contract.circuits.execute(ctx, 1n), /already executed/);
  assert.throws(() => contract.circuits.approve(asSigner(ctx, 2), 1n), /already executed/);
});
test('three-of-three requires the third independent approval', () => {
  const ctx = contract.circuits.approve(asSigner(approved(3n), 2, 3n), 1n).context;
  assert.equal(read(contract.circuits.execute(ctx, 1n).context).executedCount, 1n);
});
test('insufficient contract custody rejects payout', () => {
  const ctx = approved();ctx.currentQueryContext.block = { ...ctx.currentQueryContext.block, balance: new Map() };
  assert.throws(() => contract.circuits.execute(ctx, 1n), /insufficient treasury balance/);
  assert.equal(read(ctx).executedCount, 0n);
});
test('deposit claims actual unshielded input rather than increasing a fake balance', () => {
  const ctx = contract.circuits.deposit(fresh(), color, 50n).context;
  assert.equal([...ctx.currentQueryContext.effects.unshieldedInputs.values()].reduce((a, b) => a + b, 0n), 50n);
  assert.throws(() => contract.circuits.deposit(fresh(), color, 0n), /positive/);
});
test('unknown proposals cannot receive approvals', () => {
  assert.throws(() => contract.circuits.approve(fresh(), 99n), /unknown proposal/);
});
