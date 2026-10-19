import { readFileSync, writeFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk/address-format';
import * as NightSafe from '../contracts/managed/nightsafe/contract/index.js';
import { resolveNetwork, getOrCreateSeed, getDeployment } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { createProviders } from '../src/providers';
import { loadTreasuryPolicy } from '../src/policy';
import { isTreasuryLocked } from '../src/maintenance';
import { witnesses } from '../src/witnesses';
import { parseBytes32, commitMemo } from '../src/lib/treasury';
import { resolve } from 'node:path';

// @ts-expect-error Node wallet subscriptions use the ws implementation.
globalThis.WebSocket = WebSocket;
const { network, config } = resolveNetwork();
if (network !== 'preprod' && network !== 'undeployed') throw new Error('Demo runner is restricted to test networks.');
const deployment = getDeployment(network);
if (!deployment) throw new Error('Deploy V2 first.');
const policy = loadTreasuryPolicy();
const paths = process.argv.filter((arg) => arg.endsWith('.json') && !arg.includes('demo-preprod'));
if (paths.length !== 2) throw new Error('Pass two independent signer JSON paths after --network preprod.');
const signers = paths.map((path) => parseBytes32(JSON.parse(readFileSync(path, 'utf8')).secret, 'Signer secret'));
const keys = signers.map((secret) => Buffer.from(NightSafe.pureCircuits.signerPublicKey(secret)).toString('hex'));
if (keys[0] === keys[1]) throw new Error('Two distinct signer keys are required.');
const wallet = await createWallet({ network, networkConfig: config, seed: getOrCreateSeed(network) });
try {
  await wallet.wallet.waitForSyncedState();
  const providers = await createProviders(wallet, config);
  const privateStateId = 'nightsafeV2PrivateState';
  const compiledContract = CompiledContract.make('nightsafe', NightSafe.Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(resolve('contracts/managed/nightsafe')),
  );
  const contract: any = await findDeployedContract(providers as any, { compiledContract, contractAddress: deployment.address, privateStateId, initialPrivateState: policy.privateState } as any);
  const state = async () => {
    const current = await providers.publicDataProvider.queryContractState(deployment.address);
    if (!current) throw new Error('Contract state unavailable.');
    if (!isTreasuryLocked(current.maintenanceAuthority)) throw new Error('Do not fund a treasury with an active maintenance authority.');
    return NightSafe.ledger(current.data);
  };
  const start = await state();
  if (start.proposalCount !== 0n) throw new Error('Runner expects a fresh demonstration treasury to avoid changing existing proposals.');
  const recipient = MidnightBech32m.parse(wallet.unshieldedKeystore.getBech32Address().toString()).decode(UnshieldedAddress, config.networkId).hexString;
  const evidence: any = { version: 2, network, contract: deployment.address, recordedAt: new Date().toISOString(), signerKeys: keys, recipient, transactions: [], rejected: [], baseline: 'August prototype; V2 implemented 19 October 2026' };
  const call = async (action: string, args: unknown[], secret: Uint8Array | null) => {
    await providers.privateStateProvider.set(privateStateId, { ...policy.privateState, secret });
    const tx = await contract.callTx[action](...args);
    evidence.transactions.push({ action, hash: tx.public.txHash, id: tx.public.txId, blockHeight: tx.public.blockHeight });
    console.log(`${action} confirmed: ${tx.public.txHash}`);
  };
  const reject = async (label: string, action: string, args: unknown[], secret: Uint8Array, expected: string) => {
    let rejected = false;
    try { await call(action, args, secret); } catch (error) {
      if (!String(error).includes(expected)) throw error;
      rejected = true;
    }
    if (!rejected) throw new Error(`${label} unexpectedly succeeded`);
    evidence.rejected.push(label);console.log(`${label}: rejected`);
  };
  const color = new Uint8Array(32);
  await call('deposit', [color, 1000000n], null);
  const memo = await commitMemo('NightSafe test-network payout');
  await call('propose', [{ recipient: { bytes: parseBytes32(recipient) }, color, amount: 100000n, memoCommitment: memo.commitment }], signers[0]);
  await reject('Execution before quorum', 'execute', [1n], signers[0], 'not enough approvals');
  await call('approve', [1n], signers[0]);
  await reject('Duplicate signer approval', 'approve', [1n], signers[0], 'signer already approved');
  await call('approve', [1n], signers[1]);
  await call('execute', [1n], null);
  await reject('Second execution', 'execute', [1n], signers[1], 'proposal already executed');
  const end = await state();
  if (!end.executed.member(1n) || end.executedCount !== 1n || end.approvalCounts.lookup(1n) !== 2n) throw new Error('Final indexed state mismatch.');
  evidence.final = { proposalCount: end.proposalCount.toString(), executedCount: end.executedCount.toString(), approvals: end.approvalCounts.lookup(1n).toString(), amount: '100000', executed: end.executed.member(1n) };
  const finalContract = await providers.publicDataProvider.queryContractState(deployment.address);
  if (!finalContract || !isTreasuryLocked(finalContract.maintenanceAuthority)) throw new Error('Final maintenance authority mismatch.');
  const balances = [...finalContract.balance].map(([token, amount]) => ({ token, amount: amount.toString() }));
  if (balances.length !== 1 || balances[0].amount !== '900000') throw new Error('Treasury custody must decrease by the exact payout.');
  evidence.final.balances = balances;
  evidence.verifiedAt = new Date().toISOString();
  evidence.maintenanceAuthority = { committee: [], threshold: 1, counter: finalContract.maintenanceAuthority.counter.toString() };
  writeFileSync(network === 'preprod' ? 'docs/submission/PREPROD_EVIDENCE.json' : 'docs/submission/LOCAL_NETWORK_EVIDENCE.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log('Public network evidence saved.');
} finally { await persistWalletState(network, wallet);await wallet.wallet.stop(); }
