import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAmount, parseBytes32, parseProposalId, commitMemo } from '../src/lib/treasury';
import { createNightSafePrivateState } from '../src/witnesses';

test('reject malformed or partial bytes instead of silently coercing them', () => {
  for (const v of ['gg'.repeat(32), 'a'.repeat(63), 'a'.repeat(66), '']) assert.throws(() => parseBytes32(v));
  assert.equal(parseBytes32('ab'.repeat(32)).length, 32);
});
test('amounts cannot truncate decimals, signs or overflowing integers', () => {
  for (const v of ['1.5', '-1', '0', '1e3', '100junk', (1n << 128n).toString()]) assert.throws(() => parseAmount(v));
  assert.equal(parseAmount('100000000000000000000'), 100000000000000000000n);
  assert.throws(() => parseProposalId((1n << 64n).toString()));
});
test('same private note gets different commitments with fresh randomness', async () => {
  const a = await commitMemo('invoice');const b = await commitMemo('invoice');
  assert.notDeepEqual(a.commitment, b.commitment);assert.notEqual(a.nonce, b.nonce);
});
test('private state rejects malformed keys and copies supplied secret arrays', () => {
  assert.throws(() => createNightSafePrivateState(2n, new Uint8Array(1)));
  assert.throws(() => createNightSafePrivateState(2n, new Uint8Array(32)));
  const source = new Uint8Array(32).fill(1);const ps = createNightSafePrivateState(2n, source);source.fill(0);
  assert.equal(ps.secret?.[0], 1);
});
