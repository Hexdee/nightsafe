import * as fs from 'node:fs';
import * as path from 'node:path';

const statePath = path.resolve(process.cwd(), '.midnight-state.json');

if (!fs.existsSync(statePath)) {
  console.log('No .midnight-state.json file found.');
  process.exit(0);
}

const raw = fs.readFileSync(statePath, 'utf8');
const state = JSON.parse(raw) as {
  activeNetwork?: string;
  wallets?: Record<string, { createdAt?: string }>;
  deployments?: Record<string, { address?: string; deployedAt?: string }>;
};

console.log(`Active network: ${state.activeNetwork ?? 'unknown'}`);
console.log('Wallets:');
for (const [network, wallet] of Object.entries(state.wallets ?? {})) {
  console.log(`  - ${network}: created ${wallet.createdAt ?? 'unknown'}`);
}
console.log('Deployments:');
for (const [network, deployment] of Object.entries(state.deployments ?? {})) {
  console.log(`  - ${network}: ${deployment.address ?? 'unknown'} (${deployment.deployedAt ?? 'unknown'})`);
}
