import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses } from '../contracts/managed/nightsafe/contract/index.js';

export type NightSafePrivateState = {
  readonly threshold: bigint;
  readonly secret: Uint8Array | null;
  readonly nonce: Uint8Array | null;
};

export function createNightSafePrivateState(
  threshold = 2n,
  secret: Uint8Array | null = null,
  nonce: Uint8Array | null = null,
): NightSafePrivateState {
  if (threshold < 2n || threshold > 3n) throw new Error('Threshold must be two or three.');
  for (const value of [secret, nonce]) {
    if (value && (value.length !== 32 || value.every((byte) => byte === 0))) {
      throw new Error('Signer secret and policy nonce must be nonzero 32-byte values.');
    }
  }
  return { threshold, secret: secret?.slice() ?? null, nonce: nonce?.slice() ?? null };
}

export const witnesses: Witnesses<NightSafePrivateState> = {
  signerSecret: ({ privateState }) => {
    if (!privateState.secret) throw new Error('Load your signer key before proposing or approving.');
    return [privateState, privateState.secret];
  },
  approvalThreshold: ({ privateState }) => [privateState, privateState.threshold],
  policyNonce: ({ privateState }) => {
    if (!privateState.nonce) throw new Error('Load the treasury policy opening before deployment or execution.');
    return [privateState, privateState.nonce];
  },
};

// Old command entry points may read state without a signing identity.
export const createCounterPrivateState = createNightSafePrivateState;
export type CounterPrivateState = NightSafePrivateState;
