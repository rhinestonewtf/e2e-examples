# Standalone wagmi

A minimal example showing how to create a Rhinestone smart account from a plain
[wagmi](https://wagmi.sh) integration — no third-party auth or embedded-wallet
provider. It uses the `injected()` connector (MetaMask, Rabby, etc.), wraps the
wallet client with the Rhinestone SDK, and displays the resulting smart-account
address.

This is the reference scaffold the other examples are built on.

## Prerequisites

- **Node.js**: Version 22.13 or higher (required by the pinned pnpm).
- **Rhinestone API Key**: Contact the Rhinestone team for access.

## Getting started

1. Clone the repository and enter it:

   ```bash
   git clone git@github.com:rhinestonewtf/e2e-examples.git
   cd e2e-examples
   ```

2. Install dependencies once from the root (this is a pnpm workspace):

   ```bash
   pnpm install
   ```

3. Configure this app's environment:

   ```bash
   cd standalone-wagmi
   cp env.example .env.local
   ```

   Edit `.env.local` and set `RHINESTONE_API_KEY`.

4. Run the development server (from the `standalone-wagmi/` directory):

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), connect an injected
   wallet, and create your smart account.

## How it works

1. **Connect**: wagmi's `injected()` connector connects the browser wallet
   (`useConnect` / `useAccount`).
2. **Adapt**: the wagmi wallet client (`useWalletClient`) is wrapped with
   `walletClientToAccount` from `@rhinestone/sdk/utils` into an ECDSA signer.
3. **Create**: `rhinestone.createAccount({ owners: { type: "ecdsa", accounts: [owner] } })`
   derives the smart account; `account.getAddress()` is shown in the UI.

The SDK talks to the orchestrator through the server-side proxy at
`src/app/api/orchestrator/[...path]/route.ts`, which injects
`RHINESTONE_API_KEY` so the key never reaches the browser.

Cross-chain transactions follow the v2 flow:
`prepareTransaction` → `signTransaction` → `submitTransaction` → `waitForExecution`.
