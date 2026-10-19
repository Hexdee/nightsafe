# Judge evaluation guide

## Local checks

Use Node.js 22+ and Compact 0.31.1, with runtime 0.16.0.

```sh
npm ci
npm run compile
npm test
npm run typecheck
npm run build
npm run dev
```

Twenty-two tests exercise the real compiled circuit locally, including attempts to forge signers, repeat approvals, lower the threshold, use a different policy opening, reuse an execution, and spend beyond custody. The payout test checks the emitted recipient and amount. These tests do not prove live network settlement.

## Independent signers and deployment

Each participant runs `npm run signer:new -- .nightsafe-private/MY_NAME.json` and gives only their public key to the treasury creator. The creator runs `npm run policy:new -- .nightsafe-private/policy.json 2 KEY1 KEY2 KEY3`, then deploys with NIGHTSAFE_POLICY_FILE set and a funded Preprod wallet. See README.md for commands. Use a new V2 deployment, never the V1 address.

## Browser path

1. Connect compatible Lace on Preprod to the configured V2 treasury.
2. Each signer loads their own NightSafe key in their own browser session. The key is separate from their wallet seed.
3. Deposit unshielded test tokens. DUST pays fees and is not the treasury asset. Native test NIGHT uses a zero token color.
4. A registered signer proposes an exact recipient public address, token color and amount in base units. A fresh salted hash represents the optional memo.
5. Separate signers inspect the proposal and approve using their own keys. Refresh to load current approvals. A duplicate approval must fail.
6. Supply the original policy opening to execute. A changed threshold or nonce must fail. With sufficient custody and quorum, execution sends the exact stored payment and marks the proposal consumed.
7. Attempt a second execution and confirm rejection. Record the real transaction hashes and indexed before/after state.

The policy is immutable. Approval participation and payment details are public. The threshold opening and signer secrets remain private witnesses. Downloaded signer backup files are unencrypted and must be protected.

## CLI path

Set NIGHTSAFE_POLICY_FILE and NIGHTSAFE_SIGNER_FILE, then run `npm run cli -- --network preprod`. Menu actions separately propose, approve, execute, deposit or read state. Use a separate signer file for each actual participant. The fee-paying wallet need not define the signer identity.

A local demo using multiple keys under one operator demonstrates independent cryptographic identities, not collaboration by independent people. The current implementation has no key rotation/recovery/cancellation and no independent audit.
