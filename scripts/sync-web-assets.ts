import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'contracts', 'managed', 'nightsafe');
const target = path.join(root, 'public', 'contracts', 'managed', 'nightsafe');

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

fs.rmSync(target, { recursive: true, force: true });
copyRecursive(source, target);

console.log(`Synced managed contract assets to ${path.relative(root, target)}`);
