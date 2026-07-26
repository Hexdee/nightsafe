# Troubleshooting

## Wallet Sync Takes Too Long
- Keep the proof server running on port `6300`.
- Use a fresh wallet state when retrying Preprod.
- Allow several minutes for wallet sync on public networks.

## `Custom error: 171`
- This is the `OutOfDustValidityWindow` rejection.
- It usually means the DUST timing window has gone stale.
- Recreate the wallet state and retry the deploy.

## Proof Server Issues
- If the deploy says the proof server is unavailable, restart Docker and confirm the container is healthy.
- The local proof server should answer on `http://127.0.0.1:6300`.
