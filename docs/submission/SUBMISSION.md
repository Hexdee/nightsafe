# NightSafe Wave 2 submission copy

## One-line description

A Midnight treasury with independently authenticated approvals, a private committed threshold and one-time execution of team payments.

## Problem and intended users

Small teams coordinating shared budgets need confidence that the agreed people approved an exact payment. NightSafe explores keeping policy secrets out of public state while retaining verifiable authorization and payment records. Small teams with recurring approvals are the initial customer hypothesis. User demand and willingness to pay have not yet been validated.

## What we built

NightSafe V2 fixes three distinct signer public keys and commits to a two-of-three or three-of-three threshold at deployment. Each signer approves a proposal by proving knowledge of their private NightSafe key. The contract rejects duplicate approvals, binds approvals to immutable proposal details, checks the original policy opening and prevents execution replay.

The treasury accepts unshielded deposits and executes the stored transfer from contract custody after quorum. The React frontend has separate propose, approve, deposit and execute flows, with real ledger proposals and no editable approval counter. Signer keys stay in browser memory and can be loaded from a private backup.

## What changed in Wave 2

The pre-existing August prototype only compared a self-reported count against a caller-supplied threshold. It did not authenticate signers or transfer tokens. On 19 October we replaced that contract with immutable signer registration, a committed private policy, independent approval transactions, replay protection and unshielded custody/payment operations. We rewired the browser and CLI, generated matching proof assets, and added a 25-check suite covering positive flows and attacks.

We did not enter Wave 1. These are new changes to an existing codebase, not a claim that the entire project was created this wave. The live AKINDO page shows a 19 October deadline, differing from the static October 17 schedule. The final commit and network evidence must accompany this description.

## Why Midnight

Compact verifies knowledge of a registered signer secret without publishing that secret and checks a threshold opening against a fixed commitment. The network verifies authorization and the resulting public transfer effects. This prevents callers from inventing approval counts or lowering the original threshold.

## Privacy boundary

Signer secrets and the threshold opening are private witnesses. Registered public keys, approval participation and unshielded recipient/amount/token are public. Counts may reveal bounds on the threshold. Notes use a hash with fresh random salt. The app neither encrypts nor persists the note, and it does not claim hidden payment amounts or anonymous signers.

## Verification and limitations

Full Compact compilation generates four circuits and matching proving assets. Twenty-two contract/input tests and three network-configuration tests cover unauthorized signers, duplicate approvals/keys, policy tampering, proposal isolation, replay, exact payout effects, insufficient custody and input handling. Local effects are not a substitute for a successful network transaction. Add the actual deployment/transaction evidence from VALIDATION.md when available.

V2 supports exactly three signer keys and a fixed policy. It has no key rotation, recovery or cancellation and has not received an independent security audit. It is intended for test assets. Distinct cryptographic keys do not prove distinct humans.

## Adoption and sustainability

The next product validation step is interviews and supervised trials with small teams managing recurring shared-budget approvals. Paid team administration or support around an open-source core is a business hypothesis. No customers, revenue or pricing are claimed.

## Links

- Repository: https://github.com/Hexdee/nightsafe
- Frontend: https://nightsafe.vercel.app (verify V2 deployment before submitting)
- Deck: https://nightsafe.vercel.app/submission/NightSafe-Wave2-Pitch.pptx (verify public availability before entry)
- Video pitch: https://nightsafe.vercel.app/submission/ (synthetic narration and real local circuit results; verify public availability before entry)
- Contract, final commit and live transaction evidence: pending verification
- Team: entrant confirms final members and individual registration

The entrant must personally submit through AKINDO and save the receipt. No entry has been submitted by this assistant.
