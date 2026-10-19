# NightSafe Wave 2 checklist

Updated 19 October 2026, Africa/Lagos. Entry has not been submitted.

## Deadline correction

The live signed-in [AKINDO event page](https://app.akindo.io/wave-hacks/jaMZjqPOBsLXvjdG) was inspected directly on 19 October. It showed Wave 2 Building, a deadline label of 10/19 16:00, and about 4.5 hours remaining at first inspection. The static [Midnight page](https://midnight.network/hackathon/buildathon) still lists October 17. Use the live platform deadline and countdown, and retain the actual submission receipt.

Our earlier assessment that the wave was closed came from the static schedule and was incomplete. The new V2 functionality is dated 19 October, not September or August. Organizers make the final eligibility determination.

## Required materials

| Requirement | Current status | Remaining work |
| --- | --- | --- |
| Submit before live deadline | Open at inspection | Human entrant must complete entry and save receipt |
| Material Midnight progress during applicable wave | V2 implemented on 19 October | Publish exact commit, describe August baseline separately; no backdating |
| Public GitHub repository | Existing public repo | V2 published on main; final hardening/evidence follow-up prepared |
| GitHub midnightntwrk label | Done | Repository topic saved and verified on GitHub |
| Apache 2.0 | Done | LICENSE and metadata published |
| README covering setup, architecture and judging | Updated for V2 | Add live evidence once verified |
| Pitch deck | V2 ready | Seven-slide deck and public hosting copy prepared |
| Demo/video pitch | Published | Narrated 3:25 pitch and public media links respond successfully |
| Wave progress description | Prepared in SUBMISSION.md | Attach final commit and actual verification results |
| Prior-wave change explanation | No prior entry | Clearly identify pre-existing August work |
| Team, maximum five, individual registration | Hexdee appeared among registered builders | Confirm final team/entry details personally |
| Eligibility/rules acceptance | Entrant action | Read binding rules and confirm required eligibility |
| Live presentation/interview if requested | Conditional | Be available if organizers request it |

## Implementation and verification

- [x] Immutable three-signer policy and private committed threshold.
- [x] Registered-key authentication and separate per-proposal approvals.
- [x] Duplicate approval prevention and one-time execution.
- [x] Maintenance authority lock workflow and client rejection of unlocked deployments.
- [x] Real unshielded deposit and payout operations in Compact.
- [x] Browser controls for proposing, approving, funding and execution.
- [x] Randomized memo commitments and explicit public-payment boundary.
- [x] Full compile including keys, 28 passing local tests, TypeScript check and build.
- [ ] New Preprod deployment and recorded address.
- [x] Local-network deposit, two distinct-key approvals and payout evidence recorded.
- [ ] Equivalent public Preprod evidence (requires token).
- [x] Public app updated to V2; production compiled-contract demo verified.
- [x] V2 deck and video published; all three public asset/page URLs return HTTP 200.
- [ ] Human AKINDO submission and receipt.

The published rules summary says entries must be submitted personally and prohibits automated entry tools. Code, assets and copy can be prepared here; the entrant must perform final entry. No X account or minimum commit count was found among this Buildathon's requirements. No official video duration limit was verified.

## Security and product limits

Exactly three signers, fixed policy, no key rotation or recovery. Signer participation, recipients and amounts are public. The threshold opening must remain private. Distinct keys are not proof of distinct humans. Tests inspect local contract execution and payout effects; live evidence is separate. See VALIDATION.md for current results and open issues.
