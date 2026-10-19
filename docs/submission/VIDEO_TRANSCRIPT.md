# NightSafe video pitch transcript

Synthetic narration over pitch slides and a captured result of the actual browser circuit demonstration. The browser demonstration uses a local fixture. A separate evidence frame documents confirmed transactions and custody on a local Docker network. Public Preprod settlement is not claimed.

This is NightSafe for the Midnight Buildathon, Wave two. NightSafe explores team treasury payments with independently authenticated approvals and a private, fixed threshold policy. This pitch shows the implementation and a local demonstration of the compiled contract. It does not claim that a public network payment has settled.

Teams managing a shared budget need assurance that the right people approved an exact payment. Our starting point was an August prototype that accepted a typed approval count. On October nineteenth, we replaced that count with registered key authentication, separate proposal approvals, and contract custody operations. Our initial users are small teams. Customer demand remains a hypothesis.

At deployment, the treasury fixes three distinct signer public keys and a commitment to a two of three or three of three policy. Each signer proves knowledge of their own NightSafe secret. The contract records each approval against a specific immutable proposal. It rejects unknown keys, repeated approvals, and an attempt to lower the original threshold.

A deposit requests real unshielded token inputs into treasury custody. After quorum, execution sends the exact stored recipient, token and amount. It records that the proposal is consumed, so it cannot execute again. The contract checks its actual custody balance. These are compiled ledger operations, rather than a transfer callback or a fake balance counter.

Here are the actual results from the compiled contract running in the browser. The local fixture holds one thousand test units. A proposal requests one hundred. Execution before quorum fails. Key A approves, and a duplicate from A fails. A different key B supplies the second approval. Execution produces the expected one hundred unit payout effect. A second execution fails. All test keys are controlled in this one browser. This simulation creates no zero knowledge proof and no network transaction.

In addition to that browser simulation, we verified real transactions on a local Midnight Docker network. One million base units were deposited. Two distinct signer keys approved proposal one. Execution paid one hundred thousand units, leaving nine hundred thousand in custody. The deployment maintenance authority was permanently locked. The test rejected early execution, duplicate approval and replay. The exact transaction hashes and block heights are published. Both test keys and the fee wallet were controlled by one operator. This local network evidence is separate from public Preprod verification.

The privacy boundary is explicit. Signer secrets and the threshold opening are private witnesses. Registered public keys, participation, recipients and amounts remain public. Approval counts reveal bounds on the threshold. Optional notes use a hash with fresh random salt. The form does not encrypt or save the note, and we do not claim hidden payment amounts or anonymous signers.

Four circuits compile with full matching proving assets. Twenty two contract and input tests cover normal behavior and attack cases, with additional network configuration checks. The browser separates proposing, approving, funding and execution. The old Preprod indexer has been retired, so a public deployment requires Blockfrost access. Local evaluations are separate from public settlement evidence.

The next milestones are quorum controlled key rotation and recovery, an independent security review, and trials with small teams. This release supports exactly three keys with a fixed policy, and is intended for test assets. The source and setup instructions are public at github dot com slash Hexdee slash nightsafe. Thank you for reviewing NightSafe.
