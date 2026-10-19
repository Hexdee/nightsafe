import { bytesToHex, hexToBytes } from './encoding';

export const MAX_AMOUNT = (1n << 128n) - 1n;
export function parseBytes32(value: string, label = 'Value'): Uint8Array {
  const hex = value.trim().replace(/^0x/, '');
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) throw new Error(`${label} must contain exactly 64 hexadecimal characters.`);
  return hexToBytes(hex);
}
export function parseAmount(value: string): bigint {
  if (!/^[1-9][0-9]*$/.test(value.trim())) throw new Error('Enter a positive whole number of token base units.');
  const amount = BigInt(value.trim());
  if (amount > MAX_AMOUNT) throw new Error('Amount exceeds the supported token range.');
  return amount;
}
export function parseProposalId(value: string): bigint {
  const id = parseAmount(value);
  if (id > (1n << 64n) - 1n) throw new Error('Proposal ID exceeds the supported range.');
  return id;
}
export async function commitMemo(note: string): Promise<{ commitment: Uint8Array; nonce: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const payload = new TextEncoder().encode(JSON.stringify(['nightsafe:memo:v2', bytesToHex(salt), note]));
  return { commitment: new Uint8Array(await crypto.subtle.digest('SHA-256', payload)), nonce: bytesToHex(salt) };
}
