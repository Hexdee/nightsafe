# V2 verification record

Updated 19 October 2026, Africa/Lagos. August baseline e232902. V2 was implemented on 19 October. No Wave 1 entry was made.

## Passed locally

| Check | Result |
| --- | --- |
| Compact compiler 0.31.1, runtime 0.16.0 | Four circuits compile successfully, including matching prover/verifier keys and binary ZKIR |
| Local contract tests | 18 pass: authenticated signers, deployment policy, duplicate approvals, proposal isolation, tampered policy openings, quorum, exact payout effects, replay and custody checks |
| Input/private-state tests | 4 pass: strict bytes/amount parsing, random memo salt, secret copies and malformed credential rejection |
| Network configuration tests | 3 pass: retired endpoint replacement, explicit token requirement and self-hosted overrides |
| Maintenance authority tests | 3 pass: locked-state recognition, authenticated lock update and rejection of a mismatched deployment key |
| TypeScript | Pass |
| Production frontend build | Pass with upstream bundling warnings |
| Browser compiled-contract demo | Pass on local development server and published Vercel build: pre-quorum rejection, independent test-key approvals, duplicate rejection, exact payout effect and execution replay rejection |
| Proof server | Running and reachable locally on port 6300 |
| Pitch deck | Seven slides visually inspected and structurally validated, including font/layout/import checks |
| Video pitch | 3 minutes 25 seconds, H.264/AAC, complete audio/video decode passed |
| Private-material publication scan | No generated signer secret or policy opening found in publishable changes |
| Repository metadata | midnightntwrk topic and accurate V2 description saved on GitHub |

The browser demo evaluates the actual compiled circuit with public test keys and an explicitly funded local fixture. It does not generate a proof, deposit funds or settle a transaction on a network. The video uses synthetic narration, pitch slides and a captured result of this real local evaluation. It makes no public-settlement claim.

## Deployment status

A Preprod attempt found that the old indexer returns HTTP 410 ENDPOINT_DECOMMISSIONED. The official migration guide confirms retirement on 9 October and requires a Blockfrost Midnight Preprod token. Configuration now uses Blockfrost and fails early with a clear message if access is missing. No V2 public contract address or successful public transfer is claimed yet.

The local Docker stack is running. Initial deployment was rejected for fee underfunding (138), followed by an invalid DUST spend proof (170). The fee configuration now follows the official local-network example. Investigation found a retained indexer serving August chain data against a fresh October node; a separate fresh indexer is syncing for another attempt. A subsequent attempt successfully deployed V2 at local address e75f23aad2c86f3f0c17523c79e94fb6b4957006c63a2327bac79cbcb749778c and verified its permanent maintenance lock. The full deposit-to-payout sequence passed with real proofs and confirmed transactions on the local Docker network. See [LOCAL_NETWORK_EVIDENCE.json](LOCAL_NETWORK_EVIDENCE.json) for five transaction hashes and block heights. Deposit: 1,000,000 native test-token base units. Executed payment: 100,000 base units after two distinct signer approvals. Early execution, duplicate approval and replay were rejected with their expected contract assertions. One operator controlled both test signer files and the fee wallet. This is local-network settlement, not public Preprod settlement. Keep local-network evidence separate from public Preprod evidence. Neither an HTTP response nor a local runtime payout effect establishes network settlement.

## Build and operational limits

The browser bundles a checked-in generated contract snapshot under src/generated through Vite. Compiler metadata, proving keys and ZKIR are copied to static proof assets, avoiding a raw public module that could not resolve its runtime dependency. A clean hosting build without the ignored contracts/managed directory also passes. Native WebSocket is passed explicitly to the browser indexer provider. The upstream package's unused default import still produces bundler warnings, alongside assert externalization and chunk-size warnings. Wallet transactions still need network-level verification.

The earlier dependency audit reported transitive nanoid and source-map-js high findings and postcss moderate findings. These were not upgraded in this change. This release has no independent security audit and is for test assets.

Exactly three signer keys and a fixed committed threshold are supported. There is no cancellation, key rotation or recovery. Distinct keys do not establish distinct humans. Unshielded payment details and signer participation are public. Approval counts reveal bounds on the policy. Downloaded signer backups are unencrypted; keep them private. Node private storage now uses a generated local secret or a supplied strong password, rather than a shared public default.

No AKINDO submission receipt exists yet. The platform prohibits automated entry and requires the entrant to submit personally.

The deployment workflow also removes its maintenance authority and verifies the permanent lock. Wallet-facing clients reject an unlocked treasury. The local lock transaction is confirmed; wallet input signing, deposit and payout are also confirmed locally.

Production browser verification: the published Vercel build completed all nine compiled-contract demo steps. The pitch page loaded its 1280×720 video (204.85 seconds, readyState 4) without a media error. The initial GitHub CI run failed at clean install because npm 10 required four optional lockfile entries missing from the npm 11 lockfile. The lockfile was refreshed with npm 10.9.9 and its clean-install dry run now passes; the remote checks for implementation commit 92d4986 passed dependency installation, full Compact compilation, TypeScript, all 28 tests and production build. See [GitHub run](https://github.com/Hexdee/nightsafe/actions/runs/39248947375).

A separate read-only query confirmed the final local treasury balance is exactly 900,000 base units and its authority remains empty with threshold one. These details are appended to LOCAL_NETWORK_EVIDENCE.json. For this workstation, the stale mn-demo-indexer container is preserved stopped; the fresh running indexer is named nightsafe-v2-indexer. Avoid starting both on port 8088.
