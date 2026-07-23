import assert from 'node:assert/strict';
import test from 'node:test';

import { createCircuitContext, createConstructorContext, dummyContractAddress } from '@midnight-ntwrk/compact-runtime';
import * as Counter from '../contracts/managed/counter/contract/index.js';
import { createCounterPrivateState, witnesses } from '../src/witnesses.js';

const coinPublicKey = 'a'.repeat(64);

function makeContext(limit: bigint) {
  const contract = new Counter.Contract(witnesses);
  const constructorContext = createConstructorContext(createCounterPrivateState(limit), coinPublicKey);
  const { currentContractState, currentPrivateState } = contract.initialState(constructorContext);
  return createCircuitContext(dummyContractAddress(), coinPublicKey, currentContractState, currentPrivateState);
}

test('increment updates the public counter state', () => {
  const contract = new Counter.Contract(witnesses);
  const context = makeContext(10n);
  const { context: nextContext } = contract.circuits.increment(context, 3n);
  const ledgerState = Counter.ledger(nextContext.currentQueryContext.state);

  assert.equal(ledgerState.count, 3n);
});

test('increment enforces the private witness limit', () => {
  const contract = new Counter.Contract(witnesses);
  const context = makeContext(4n);

  assert.throws(() => contract.circuits.increment(context, 5n), /delta exceeds the private limit/);
});

test('private witness data is not present in the public transcript', () => {
  const contract = new Counter.Contract(witnesses);
  const secretLimit = 913579246813579n;
  const context = makeContext(secretLimit);
  const { proofData, context: nextContext } = contract.circuits.increment(context, 1n);

  const publicTranscript = JSON.stringify((proofData as { publicTranscript?: unknown }).publicTranscript ?? proofData);
  assert.ok(!publicTranscript.includes(secretLimit.toString()));
  assert.equal(nextContext.currentPrivateState.limit, secretLimit);
});
