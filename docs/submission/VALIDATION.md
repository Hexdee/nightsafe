# V2 verification record

Updated 19 October 2026, Africa/Lagos. August baseline e232902. V2 was implemented on 19 October. No Wave 1 entry was made.

## Passed locally

| Check | Result |
| --- | --- |
| Compact compiler 0.31.1, runtime 0.16.0 | Four circuits compile successfully, including matching prover/verifier keys and binary ZKIR |
| Local contract tests | 18 pass: authenticated signers, deployment policy, duplicate approvals, proposal isolation, tampered policy openings, quorum, exact payout effects, replay and custody checks |
| Input/private-state tests | 4 pass: strict bytes/amount parsing, random memo salt, secret copies and malformed credential rejection |
| Network configuration tests | 3 pass: retired endpoint replacement, explicit token requirement and self-hosted overrides |
| TypeScript | Pass |
| Production frontend build | Pass with upstream bundling warnings |
| Browser compiled-contract demo | Pass: pre-quorum rejection, independent test-key approvals, duplicate rejection, exact payout effect and execution replay rejection |
| Proof server | Running and reachable locally on port 6300 |
| Pitch deck | Seven slides visually inspected and structurally validated, including font/layout/import checks |
| Video pitch | 3 minutes 25 seconds, H.264/AAC, complete audio/video decode passed |
| Private-material publication scan | No generated signer secret or policy opening found in publishable changes |
| Repository metadata | midnightntwrk topic and accurate V2 description saved on GitHub |

The browser demo evaluates the actual compiled circuit with public test keys and an explicitly funded local fixture. It does not generate a proof, deposit funds or settle a transaction on a network. The video uses synthetic narration, pitch slides and a captured result of this real local evaluation. It makes no public-settlement claim.

## Deployment status

A Preprod attempt found that the old indexer returns HTTP 410 ENDPOINT_DECOMMISSIONED. The official migration guide confirms retirement on 9 October and requires a Blockfrost Midnight Preprod token. Configuration now uses Blockfrost and fails early with a clear message if access is missing. No V2 public contract address or successful public transfer is claimed yet.

The full local Docker node/indexer stack is being prepared for transaction-level verification. Keep local-network evidence separate from public Preprod evidence. Neither an HTTP response nor a local runtime payout effect establishes network settlement.

## Build and operational limits

The browser bundles a checked-in generated contract snapshot under src/generated through Vite. Compiler metadata, proving keys and ZKIR are copied to static proof assets, avoiding a raw public module that could not resolve its runtime dependency. A clean hosting build without the ignored contracts/managed directory also passes. Native WebSocket is passed explicitly to the browser indexer provider. The upstream package's unused default import still produces bundler warnings, alongside assert externalization and chunk-size warnings. Wallet transactions still need network-level verification.

The earlier dependency audit reported transitive nanoid and source-map-js high findings and postcss moderate findings. These were not upgraded in this change. This release has no independent security audit and is for test assets.

Exactly three signer keys and a fixed committed threshold are supported. There is no cancellation, key rotation or recovery. Distinct keys do not establish distinct humans. Unshielded payment details and signer participation are public. Approval counts reveal bounds on the policy. Downloaded signer backups are unencrypted; keep them private. Node private storage now uses a generated local secret or a supplied strong password, rather than a shared public default.

No AKINDO submission receipt exists yet. The platform prohibits automated entry and requires the entrant to submit personally.
