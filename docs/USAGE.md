# How to Use NightSafe

## What You Need
- Lace wallet installed in your browser
- A funded Preprod wallet
- Node.js 22
- Docker running locally
- The NightSafe frontend open in your browser

## Step-by-Step Guide
1. Open the NightSafe app in your browser.
2. Connect your Lace wallet.
3. Fill in the treasury proposal details, including the recipient label, amount, approval count, and memo.
4. Review the summary on the right side of the screen.
5. Click `Authorize treasury move`.
6. Wait for the private proof to generate and the transaction to submit.
7. Read the updated public audit trail after the call completes.

## What Gets Proved (and What Stays Private)
- The app proves that a treasury action has enough approvals.
- The approval threshold stays private as a witness.
- The sensitive treasury details stay private in the browser and are not written to the public ledger.
- The on-chain state only shows the public audit trail.

## Troubleshooting
- If no wallet appears, install or unlock Lace and refresh the page.
- If the app says the wallet is on the wrong network, switch Lace to Preprod.
- If proof generation fails, make sure Docker is running and the local proof server is available at `http://127.0.0.1:6300`.
- If the contract is not found, deploy the contract to Preprod and set `VITE_NIGHTSAFE_CONTRACT_ADDRESS`.
