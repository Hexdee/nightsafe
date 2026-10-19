import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseBytes32 } from '../src/lib/treasury';
const [path, thresholdInput, ...keys] = process.argv.slice(2);
if (!path || !['2', '3'].includes(thresholdInput) || keys.length !== 3) throw new Error('Usage: npm run policy:new -- .nightsafe-private/policy.json 2 PUBLIC_KEY_1 PUBLIC_KEY_2 PUBLIC_KEY_3');
for (const key of keys) { if (parseBytes32(key).every((b) => b === 0)) throw new Error('Empty signer key.'); }
if (new Set(keys.map((k) => k.toLowerCase())).size !== 3) throw new Error('Signer keys must be distinct.');
mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
writeFileSync(path, JSON.stringify({ version: 2, threshold: thresholdInput, nonce: randomBytes(32).toString('hex'), signerKeys: keys }, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
console.log(`Policy saved privately at ${path}. Share only the signer keys publicly; share the policy opening only with intended executors.`);
