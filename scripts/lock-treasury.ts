import { WebSocket } from 'ws';
import { resolveNetwork, getDeployment, getOrCreateSeed } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { createProviders } from '../src/providers';
import { lockTreasury } from '../src/maintenance';
// @ts-expect-error Node wallet subscriptions require ws.
globalThis.WebSocket = WebSocket;
const { network, config } = resolveNetwork();
const deployment = getDeployment(network);
if (!deployment) throw new Error('No deployment on record for this network.');
const wallet = await createWallet({ network, networkConfig: config, seed: getOrCreateSeed(network) });
try {
  await wallet.wallet.waitForSyncedState();
  await lockTreasury(await createProviders(wallet, config), deployment.address);
  console.log('Treasury maintenance authority is permanently locked.');
} finally { await persistWalletState(network, wallet);await wallet.wallet.stop(); }
