# Wave 2 demo recording plan

Editorial target: about three minutes. No official duration limit was verified. Use test assets and synthetic payment context. Never show signer secrets, policy openings, wallet seeds or private files in the recording.

## Opening

“This is NightSafe, a Midnight treasury with separate approvals for team payments. This wave we replaced a self-reported approval count with proofs from registered signer keys and a policy fixed at deployment.”

Show the app and the registered public keys. Explain that the demo uses independent test keys, and state whether different humans actually control them.

## Fund and propose

Show a real test-token deposit and its transaction hash if available. Create a proposal for a precise recipient, token and amount. Explain that payment details are public and that a fresh salted hash represents the optional note. Creating a proposal does not approve it.

## Approve independently

Show one approval from the first key and the updated ledger count. Attempt a duplicate and show rejection. Switch to a separate signer session and approve with a different registered key. Keep all secrets off screen.

## Execute once

With quorum and the original policy opening, execute the stored payment. Show the actual network transaction hash, indexed state and recipient credit. Attempt execution again and show rejection. If only local circuit evaluation is available, label it explicitly and show the real generated ledger effects, not a fabricated network success.

## Close

“Compact proves registered-key authorization and checks the private threshold against its deployment commitment. We support exactly three signers with a fixed policy. Payment details and participation are public. Recovery and key rotation are next. This release is for test assets and has not received an independent audit.”

End with repository and frontend links. Upload the actual recording, check signed-out playback and add its URL to SUBMISSION.md and the entry. Use only behavior verified on the final submitted commit.

## Prepared video

A narrated pitch is prepared at public/submission/NightSafe-Wave2-Pitch.mp4, with an accompanying playback page at /submission/. It uses synthetic narration, slides and a captured result of the actual compiled browser demo. Its full transcript is in VIDEO_TRANSCRIPT.md. It explicitly distinguishes simulation from network settlement.
