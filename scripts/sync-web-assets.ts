import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'contracts', 'managed', 'nightsafe');
const target = path.join(root, 'public', 'contracts', 'managed', 'nightsafe');
const browserAssetDirectories = ['compiler', 'contract', 'keys', 'zkir'] as const;

function copyRecursive(src: string, dst: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

if (!fs.existsSync(source)) {
  if (!fs.existsSync(target)) {
    throw new Error(`Missing generated contract assets at ${source}`);
  }
  console.log(`Using checked-in browser assets at ${path.relative(root, target)}`);
  process.exit(0);
}

fs.rmSync(target, { recursive: true, force: true });
for (const directory of browserAssetDirectories) {
  copyRecursive(path.join(source, directory), path.join(target, directory));
}

console.log(`Synced managed proof assets to ${path.relative(root, target)}`);
