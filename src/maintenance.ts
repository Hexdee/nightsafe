import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { submitTx } from '@midnight-ntwrk/midnight-js-contracts';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { createProviders } from './providers';

// Empty committee + threshold one is the ledger's non-upgradable authority.
export function isTreasuryLocked(authority: { committee: readonly unknown[]; threshold: number }): boolean {
  return authority.committee.length === 0 && authority.threshold === 1;
}
export function createLockUpdate(address: string, authority: ledger.ContractMaintenanceAuthority, signingKey: string) {
  const verifier = ledger.signatureVerifyingKey(signingKey);
  if (authority.threshold !== 1 || authority.committee.length !== 1 || authority.committee[0] !== verifier) {
    throw new Error('Expected the sole deployment maintenance key before locking the treasury.');
  }
  const frozen = new ledger.ContractMaintenanceAuthority([], 1, authority.counter + 1n);
  const update = new ledger.MaintenanceUpdate(address, [new ledger.ReplaceAuthority(frozen)], authority.counter);
  return update.addSignature(0n, ledger.signData(signingKey, update.dataToSign));
}
export async function lockTreasury(providers: Awaited<ReturnType<typeof createProviders>>, address: string) {
  const before = await providers.publicDataProvider.queryContractState(address);
  if (!before) throw new Error('Cannot lock a treasury whose deployed state is unavailable.');
  if (isTreasuryLocked(before.maintenanceAuthority)) return;
  const key = await providers.privateStateProvider.getSigningKey(address);
  if (!key) throw new Error('Deployment maintenance key is unavailable. Do not fund this treasury.');
  // Convert the SDK's onchain-runtime authority to the ledger transaction type.
  const authority = new ledger.ContractMaintenanceAuthority([...before.maintenanceAuthority.committee], before.maintenanceAuthority.threshold, before.maintenanceAuthority.counter);
  const update = createLockUpdate(address, authority, key);
  const intent = ledger.Intent.new(new Date(Date.now() + 30 * 60 * 1000)).addMaintenanceUpdate(update);
  const unprovenTx = ledger.Transaction.fromParts(getNetworkId(), undefined, undefined, intent);
  await submitTx(providers as never, { unprovenTx });
  const after = await providers.publicDataProvider.queryContractState(address);
  if (!after || !isTreasuryLocked(after.maintenanceAuthority)) throw new Error('Treasury maintenance lock has not been verified. Do not fund it.');
  await providers.privateStateProvider.removeSigningKey(address);
}
