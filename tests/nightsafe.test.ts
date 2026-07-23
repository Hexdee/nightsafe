import assert from 'node:assert/strict';
import test from 'node:test';

import { createCircuitContext, createConstructorContext, dummyContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as NightSafe from '../contracts/managed/nightsafe/contract/index.js';
import { createNightSafePrivateState, witnesses } from '../src/witnesses.js';

const coinPublicKey = 'a'.repeat(64);

function makeBytes(seed: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.fill(seed);
  return bytes;
}

function makeContext(threshold: bigint) {
  const contract = new NightSafe.Contract(witnesses);
  const constructorContext = createConstructorContext(createNightSafePrivateState(threshold), coinPublicKey);
  const { currentContractState, currentPrivateState } = contract.initialState(constructorContext);
  return createCircuitContext(dummyContractAddress(), coinPublicKey, currentContractState, currentPrivateState);
}

test('authorizeMove updates the public proposal and execution counters', () => {
  const contract = new NightSafe.Contract(witnesses);
  const context = makeContext(3n);
  const { context: nextContext } = contract.circuits.authorizeMove(context, makeBytes(1), makeBytes(2), 3n);
  const ledgerState = NightSafe.ledger(nextContext.currentQueryContext.state);

  assert.equal(ledgerState.proposalCount, 1n);
  assert.equal(ledgerState.executedCount, 1n);
});

test('authorizeMove enforces the private approval threshold', () => {
  const contract = new NightSafe.Contract(witnesses);
  const context = makeContext(4n);

  assert.throws(
    () => contract.circuits.authorizeMove(context, makeBytes(3), makeBytes(4), 3n),
    /not enough approvals/,
  );
});

test('private threshold data is never exposed in the public transcript', () => {
  const contract = new NightSafe.Contract(witnesses);
  const secretThreshold = 7n;
  const context = makeContext(secretThreshold);
  const { proofData, context: nextContext } = contract.circuits.authorizeMove(context, makeBytes(5), makeBytes(6), 8n);

  const publicLedger = NightSafe.ledger(nextContext.currentQueryContext.state);
  assert.equal((publicLedger as { threshold?: unknown }).threshold, undefined);
  assert.ok(Object.keys((proofData as Record<string, unknown>) ?? {}).length > 0);
  assert.equal(nextContext.currentPrivateState.threshold, secretThreshold);
});
