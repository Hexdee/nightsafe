import { readFileSync } from 'node:fs';
import { createNightSafePrivateState } from './witnesses';
import { parseBytes32 } from './lib/treasury';
export function loadTreasuryPolicy() {
  const path = process.env.NIGHTSAFE_POLICY_FILE;
  if (!path) throw new Error('Set NIGHTSAFE_POLICY_FILE to a private V2 policy file before deployment.');
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (data.version !== 2 || !Array.isArray(data.signerKeys) || data.signerKeys.length !== 3) throw new Error('Invalid V2 policy file.');
  const keys = data.signerKeys.map((key: string) => parseBytes32(key, 'Signer public key'));
  const privateState = createNightSafePrivateState(BigInt(data.threshold), null, parseBytes32(data.nonce, 'Policy opening'));
  return { keys, privateState };
}
