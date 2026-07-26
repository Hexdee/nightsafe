import { execFileSync } from 'node:child_process';

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

const nodeVersion = process.versions.node;
if (!nodeVersion.startsWith('22.')) {
  fail(`Node.js 22 is required, but found ${nodeVersion}`);
}

try {
  const dockerVersion = run('docker', ['--version']);
  console.log(`✓ ${dockerVersion}`);
} catch (err) {
  fail('Docker is not available or not running');
}

console.log(`✓ Node.js ${nodeVersion}`);
console.log('✓ Preflight checks passed');
