# Session keys

A minimal example of the one-click session-keys UX with the Rhinestone SDK
(v2): the user approves a scoped session once, then the app executes USDC
transfers on their behalf within a spending limit — no per-transaction prompt.

Smart Sessions are **experimental**; expect breaking changes.

> The owner and session keys in this demo are throwaway private keys generated
> and stored in `localStorage`. In production the owner is a real user wallet,
> and the session key belongs in a KMS / secrets manager.

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
   cd session-keys
   cp env.example .env.local
   ```

   Edit `.env.local` and set `RHINESTONE_API_KEY`.

4. Run the development server (from the `session-keys/` directory):

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), click **Approve
   session**, then **Execute with session key**.

## How it works

1. **Create with sessions enabled**: `createAccount` is called with
   `experimental_sessions: { enabled: true }`, deriving the smart account from a
   demo ECDSA owner.
2. **Define the session**: `toSession` (from `@rhinestone/sdk/smart-sessions`)
   scopes a generated session key to USDC `transfer` calls only, capped by a
   `spendingLimit`. The SDK expands that declarative field into the underlying
   spending-limits policy.
3. **Approve (one prompt)**: `experimental_getSessionDetails` →
   `experimental_signEnableSession` → `prepareTransaction([experimental_enableSession(...)])`
   → sign → submit → wait. This is the only time the owner signs.
4. **Execute (no prompt)**: `prepareTransaction` is called with
   `signers: { type: "experimental_session", session }`, so the **session key**
   signs the USDC transfer instead of the owner.

The SDK talks to the orchestrator through the server-side proxy at
`src/app/api/orchestrator/[...path]/route.ts`, which injects
`RHINESTONE_API_KEY` so the key never reaches the browser.

The v2 transaction flow is the same throughout:
`prepareTransaction` → `signTransaction` → `submitTransaction` → `waitForExecution`.
