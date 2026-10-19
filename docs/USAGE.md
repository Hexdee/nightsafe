# NightSafe usage

See the [judge walkthrough](submission/JUDGE_GUIDE.md) for the complete V2 workflow and the [README](../README.md) for deployment commands.

Generate independent NightSafe signer keys, deploy a three-signer fixed policy, fund the treasury with unshielded test tokens, propose an exact payment, collect separate approvals, then execute once. Approvals use proof of a registered secret, not a typed count. The note uses a freshly salted hash. Recipients, amounts and participation are public.

Keep signer backup files and the policy opening private. DUST pays fees and cannot be transferred as the treasury asset. V2 requires a new contract deployment and matching proving assets.
