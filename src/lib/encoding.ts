export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(value: string): Uint8Array {
  const compact = value.trim().replace(/^0x/, '');
  if (compact.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const bytes = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) {
    bytes[i / 2] = Number.parseInt(compact.slice(i, i + 2), 16);
  }
  return bytes;
}

export function decodeTransactionPayload(value: string): Uint8Array {
  const trimmed = value.trim();
  if (/^(?:0x)?[0-9a-fA-F]+$/.test(trimmed) && trimmed.replace(/^0x/, '').length % 2 === 0) {
    return hexToBytes(trimmed);
  }
  return base64ToBytes(trimmed);
}

export function encodeTransactionPayload(bytes: Uint8Array): string {
  return bytesToBase64(bytes);
}
