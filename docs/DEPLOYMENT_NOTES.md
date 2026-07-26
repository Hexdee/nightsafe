# Deployment Notes

## Current Target
- Network: `preprod`
- Proof server: `http://127.0.0.1:6300`

## What I Observed
- Wallet sync can take several minutes before DUST becomes available.
- A previous Preprod deploy was rejected with `1010 Invalid Transaction: Custom error: 171`.
- That failure matched `OutOfDustValidityWindow`, which points to stale DUST timing rather than a contract compile problem.

## Practical Takeaway
- Use a fresh wallet state when retrying Preprod.
- Keep the proof server running before starting deploys.
- If the chain keeps rejecting the tx, the issue is in the network-side timing window, not the contract source itself.
