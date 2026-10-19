import assert from 'node:assert/strict';
import test from 'node:test';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { createLockUpdate, isTreasuryLocked } from '../src/maintenance';

test('the frozen authority cannot be satisfied by zero signatures', () => {
  assert.equal(isTreasuryLocked(new ledger.ContractMaintenanceAuthority([], 1)), true);
  assert.equal(isTreasuryLocked({ committee: [], threshold: 0 }), false);
});
test('locking signs the current counter and installs an empty one-of-zero committee', () => {
  const key = ledger.sampleSigningKey();
  const authority = new ledger.ContractMaintenanceAuthority([ledger.signatureVerifyingKey(key)], 1, 5n);
  const update = createLockUpdate('ab'.repeat(32), authority, key);
  assert.equal(update.counter, 5n);
  assert.equal(update.signatures.length, 1);
  assert.equal(ledger.verifySignature(ledger.signatureVerifyingKey(key), update.dataToSign, update.signatures[0][1]), true);
  const replacement = update.updates[0] as ledger.ReplaceAuthority;
  assert.equal(isTreasuryLocked(replacement.authority), true);
  assert.equal(replacement.authority.counter, 6n);
});
test('a mismatched maintenance key cannot produce a treasury lock update', () => {
  const key = ledger.sampleSigningKey();
  const authority = new ledger.ContractMaintenanceAuthority([ledger.signatureVerifyingKey(key)], 1);
  assert.throws(() => createLockUpdate('ab'.repeat(32), authority, ledger.sampleSigningKey()), /sole deployment/);
});
