import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger } from '../contracts/managed/nightsafe/contract/index.js';

export type NightSafePrivateState = {
  readonly threshold: bigint;
};

export const createNightSafePrivateState = (threshold: bigint): NightSafePrivateState => ({
  threshold,
});

export const createCounterPrivateState = createNightSafePrivateState;
export type CounterPrivateState = NightSafePrivateState;

export const witnesses = {
  approvalThreshold: ({ privateState }: WitnessContext<Ledger, NightSafePrivateState>): [NightSafePrivateState, bigint] => [
    privateState,
    privateState.threshold,
  ],
};
