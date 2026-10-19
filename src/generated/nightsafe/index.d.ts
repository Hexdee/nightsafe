import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Transfer = { recipient: { bytes: Uint8Array };
                         color: Uint8Array;
                         amount: bigint;
                         memoCommitment: Uint8Array
                       };

export type Witnesses<PS> = {
  signerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  approvalThreshold(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  policyNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  propose(context: __compactRuntime.CircuitContext<PS>, transfer_0: Transfer): __compactRuntime.CircuitResults<PS, []>;
  approve(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          color_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  execute(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  propose(context: __compactRuntime.CircuitContext<PS>, transfer_0: Transfer): __compactRuntime.CircuitResults<PS, []>;
  approve(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          color_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  execute(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  signerPublicKey(secret_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  signerPublicKey(context: __compactRuntime.CircuitContext<PS>,
                  secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  propose(context: __compactRuntime.CircuitContext<PS>, transfer_0: Transfer): __compactRuntime.CircuitResults<PS, []>;
  approve(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          color_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  execute(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly signerKeys: Uint8Array[];
  readonly policyCommitment: Uint8Array;
  readonly proposalCount: bigint;
  readonly executedCount: bigint;
  proposals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Transfer;
    [Symbol.iterator](): Iterator<[bigint, Transfer]>
  };
  approvalCounts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  approvals: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  executed: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: bigint): boolean;
    [Symbol.iterator](): Iterator<bigint>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               keys_0: Uint8Array[]): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
