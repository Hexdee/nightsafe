# NightSafe
![CI](https://github.com/OWNER/nightsafe/actions/workflows/ci.yml/badge.svg)
> A private multisig treasury app for teams that need Safe-style coordination on Midnight.

## Live Demo
[Preprod demo URL - I will paste after deploying frontend]

## Contract Address
| Network | Address |
|----------|--------------------------------------|
| Preprod  | [ADDRESS - I will paste after deploy] |

## What This Product Does
NightSafe is a confidential treasury app for teams that manage shared funds together. It lets multiple people approve an important treasury action without exposing the full treasury intent, approval threshold, or sensitive metadata to the public chain.

The goal is to give teams the coordination model of a multisig treasury while keeping the private details private. Midnight is a good fit because Compact witnesses let the app prove that a quorum exists without putting those details on-chain.

NightSafe is designed for teams that want shared custody, safer operations, and a cleaner public audit trail.

## Privacy Model
- What is PUBLIC (on-chain, anyone can see): the contract address, the public audit trail, and transaction metadata.
- What is PRIVATE (private witness, never on-chain): the approval threshold and the sensitive treasury details used to authorize a move.
- What the user PROVES without revealing: that a treasury action had enough approvals to be authorized.

## Tech Stack
- Midnight network
- Compact language
- Node.js v22
- Docker
- React
- Vite

## Prerequisites
- Lace wallet installed
- Node.js 22
- Docker running locally
- Compact compiler installed globally
- A funded Preprod wallet

## Setup & Run Locally
1. Clone the repository.
2. Install dependencies with `npm install`.
3. Compile the Compact contract with `npm run compile`.
4. Make sure the proof server is running locally with Docker.
5. Start the frontend with `npm run dev`.

## Run Tests
Run `npm test` to execute the Compact contract tests.

## CI/CD
GitHub Actions runs `npm run compile`, `npm test`, and `npm run build` on every push to `main`.

## Usage Guide
See [docs/USAGE.md](./docs/USAGE.md).

## Product X Profile
[PLACEHOLDER - I will add after creating the account]
