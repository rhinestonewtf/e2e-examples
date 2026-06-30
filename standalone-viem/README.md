# Standalone viem

A minimal, runnable Node script showing how to create a Rhinestone smart account
from a plain [viem](https://viem.sh) `LocalAccount` — no UI, no proxy server, no
third-party auth provider. A `privateKeyToAccount` signer is a valid ECDSA owner
on its own, so the SDK talks to the orchestrator directly with your API key.

This is the reference for server-side / scripting integrations.

## Prerequisites

- **Node.js**: Version 22.13 or higher.
- **Private key**: A funded EOA private key (used as the smart-account owner).
- **Rhinestone API key**: Contact the Rhinestone team for access.

## Getting started

1. Install dependencies once from the repo root (this is a pnpm workspace):

   ```bash
   pnpm install
   ```

2. Configure this example's environment:

   ```bash
   cd standalone-viem
   cp env.example .env
   ```

   Edit `.env` and set `RHINESTONE_API_KEY` and `PRIVATE_KEY`.

3. Run the script (from the `standalone-viem/` directory):

   ```bash
   pnpm start
   ```

It logs the owner EOA, the derived smart-account address, and a portfolio
snapshot. The optional cross-chain USDC transfer is commented out in
`src/index.ts`.
