import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  approvalThreshold(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  authorizeMove(context: __compactRuntime.CircuitContext<PS>,
                proposalCommitment_0: Uint8Array,
                approvalCommitment_0: Uint8Array,
                approvalCount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  authorizeMove(context: __compactRuntime.CircuitContext<PS>,
                proposalCommitment_0: Uint8Array,
                approvalCommitment_0: Uint8Array,
                approvalCount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  authorizeMove(context: __compactRuntime.CircuitContext<PS>,
                proposalCommitment_0: Uint8Array,
                approvalCommitment_0: Uint8Array,
                approvalCount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly proposalCount: bigint;
  readonly executedCount: bigint;
  readonly lastProposalCommitment: Uint8Array;
  readonly lastApprovalCommitment: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
