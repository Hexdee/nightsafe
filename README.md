# NightSafe

A test-network treasury on Midnight with independently authenticated approvals and a private, immutable threshold policy. V2 replaces the original self-reported approval counter.

## What V2 implements

- Exactly three distinct signer public keys fixed at deployment.
- A two-of-three or three-of-three threshold bound to an immutable randomized commitment.
- Proposal creation by a registered signer, recording the exact recipient, token, amount and salted memo hash.
- Separate approvals proving knowledge of each registered signer's secret. A signer contributes at most once per proposal.
- Deposits of unshielded tokens into contract custody.
- Execution of the stored payment only after quorum and a valid policy opening. The executed proposal cannot be reused.

Signer authentication uses Compact proofs of secret-key knowledge. These are separate NightSafe keys, not Lace wallet seeds or wallet signatures. Distinct keys represent independent cryptographic identities; operators must ensure different people actually control them. A fee-paying wallet can sponsor multiple signers' calls without learning their secrets if each signer constructs their own proof locally.

## Privacy boundary

| Data | Visibility |
| --- | --- |
| Signer secrets | Private witness inputs, never deliberately written to ledger |
| Threshold and policy blinding nonce | Private witnesses, checked against a fixed public commitment |
| Registered signer public keys and approval participation | Public |
| Payment recipient, token and amount | Public unshielded transfer details |
| Optional note | Stays in the form; only its hash with fresh random salt reaches the ledger |
| Counters and executed proposal IDs | Public |

The configured proof server receives witness material; use a trusted local server. Approval counts can reveal an upper bound on the threshold. A two-or-three threshold has a small domain, so its blinding nonce must remain secret. The note is not encrypted or saved by the form. There is no claim that payment amounts or signer identities are hidden. Key rotation, policy changes, cancellation and recovery are not implemented. This release has not received an independent security audit and is intended for test assets.

## Setup and checks

Use Node.js 22 or later and Compact compiler 0.31.1 with runtime 0.16.0. The pinned stack targets ledger 8 public networks. Do not upgrade to a ledger-9 compiler without migrating the SDK and network together.

```sh
npm ci
npm run compile
npm test
npm run typecheck
npm run build
npm run dev
```

Full compilation generates matching prover/verifier keys and binary ZKIR for propose, approve, deposit and execute. The frontend bundles generated contract code through Vite and serves proof assets from public/contracts/managed/nightsafe. Do not combine a new ABI with keys from an older compile.

The 28-check test suite checks quorum authentication, duplicate keys/approvals, tampered policy openings, proposal isolation, replay rejection, exact payout effects, insufficient custody and parsing. Local runtime evaluations and transfer effects are not by themselves evidence of a successful network transaction.

## Deploy a treasury

Each signer independently generates a private key file:

```sh
npm run signer:new -- .nightsafe-private/alice.json
```

Share only the printed public key. Repeat independently for the other two signers. Create a policy with those three public keys:

```sh
npm run policy:new -- .nightsafe-private/policy.json 2 PUBLIC_KEY_1 PUBLIC_KEY_2 PUBLIC_KEY_3
```

Use 3 for a three-of-three policy. The private policy file contains the threshold opening, not the signer secrets. Back it up and share its opening only with intended executors. The generated private directory is excluded from Git.

Start Docker and the proof server, then deploy:

```sh
docker compose up -d proof-server
NIGHTSAFE_POLICY_FILE=.nightsafe-private/policy.json npm run deploy -- --network preprod
```

Use a funded Preprod test wallet and enough generated DUST for fees. Persistent private state uses a generated password saved under .nightsafe-private, or a strong PRIVATE_STATE_PASSWORD override. Preprod additionally requires BLOCKFROST_PROJECT_ID in the ignored .env.local file; see docs/NETWORKS.md. Deployment writes its address to the ignored network state file. Configure VITE_NIGHTSAFE_CONTRACT_ADDRESS with the new V2 address and rebuild. V2 deliberately has no fallback to the incompatible V1 address.

## Demo and pitch

[Open the app](https://nightsafe.vercel.app) and choose Run local demonstration to evaluate the compiled contract without a wallet. This explicitly labeled simulation does not settle network transactions.

[Watch the video pitch](https://nightsafe.vercel.app/submission/) or [download the editable deck](https://nightsafe.vercel.app/submission/NightSafe-Wave2-Pitch.pptx). The video uses synthetic narration, slides and captured real local circuit results.

## Using the app

Connect compatible Lace on Preprod. Load your private NightSafe signer key for proposing and approving. Enter the correct policy threshold and blinding nonce to execute. Inspect the registered public keys and exact payment details before approval. Refresh to load other signers' approvals. Deposits fund the treasury in token base units. DUST pays fees and is not a transferable treasury asset. The native test NIGHT color is 32 zero bytes.

The browser keeps signer inputs in memory rather than localStorage. Downloaded signer files are sensitive, unencrypted backups. Clear private inputs when finished. See [judge guide](docs/submission/JUDGE_GUIDE.md) and [verification record](docs/submission/VALIDATION.md).

## Buildathon submission

[Requirements and status](docs/submission/CHECKLIST.md), [submission copy](docs/submission/SUBMISSION.md), and [demo script](docs/submission/DEMO_SCRIPT.md).

The live AKINDO page inspected on 19 October shows Wave 2 still building, a deadline label of 19 October 16:00, and an active countdown. This supersedes our earlier conclusion based on an October 17 date on the static Midnight page. Confirm the platform countdown before final entry. The original August implementation is the baseline; V2 changes were made on 19 October. No Wave 1 entry was made. Do not backdate work.

## License

[Apache License 2.0](LICENSE). Third-party dependencies retain their own licenses.

## Fixed deployment authority

The deployment command relinquishes its maintenance key and verifies an empty maintenance committee with threshold one before declaring success. Browser and CLI access reject a treasury that is still upgradable. This prevents a deployment administrator from replacing verifier keys to bypass quorum. If deployment succeeds but locking is interrupted, run `npm run treasury:lock -- --network undeployed` (or `preprod`) using the same private storage before funding. The lock is permanent; there is no upgrade or recovery key.
