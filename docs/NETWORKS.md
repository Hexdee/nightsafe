# Network configuration

V2 supports local development, Preview and Preprod. Mainnet operations are intentionally outside this release.

The Midnight-hosted Preprod indexer was retired on 9 October 2026 and returns HTTP 410. Preprod now uses Blockfrost endpoints with a network-specific project token. Add BLOCKFROST_PROJECT_ID to the ignored .env.local file; never use a VITE_ variable for that secret. Node commands load .env.local. Self-hosted endpoint overrides are supported through MIDNIGHT_INDEXER_URL, MIDNIGHT_INDEXER_WS_URL and MIDNIGHT_NODE_URL.

The browser gets its indexer endpoints from the connected wallet. Do not embed a private Blockfrost token in public browser code. The local proof server remains at port 6300.

Saved wallet sync state from the retired indexer is not portable to Blockfrost. Back up the ignored .midnight-wallet-state directory and use MIDNIGHT_WALLET_FRESH=1 for the first migrated sync. Preserve the wallet seed and deployment history. A first complete public-network sync can take over an hour.

Configure VITE_NIGHTSAFE_NETWORK and VITE_NIGHTSAFE_CONTRACT_ADDRESS with a new V2 deployment. An old V1 address is incompatible. The deployed code and all proving assets must come from the same compile.

Source: https://docs.midnight.network/guides/networks-and-environments
