# Passkey

A minimal example showing how to create a Rhinestone smart account owned by a
[WebAuthn](https://www.w3.org/TR/webauthn-2/) passkey — Face ID, Touch ID, or
Windows Hello. No seed phrases, no browser extension, and no third-party auth or
embedded-wallet provider. The passkey itself is the account owner.

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
   cd passkey
   cp env.example .env.local
   ```

   Edit `.env.local` and set `RHINESTONE_API_KEY`.

4. Run the development server (from the `passkey/` directory):

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and create your passkey
   account.

## How it works

1. **Create credential**: `createWebAuthnCredential` prompts the browser to
   generate a passkey in the device secure enclave;
   `toWebAuthnAccount({ credential })` wraps it as an SDK signer.
2. **Create**: `rhinestone.createAccount({ owners: { type: "passkey", accounts: [passkeyAccount] } })`
   derives the smart account; `account.getAddress()` is shown in the UI.
3. **Persist**: only the credential `id` and `publicKey` are stored in
   `localStorage` (the private key never leaves the secure enclave). On reload
   the account is rebuilt from the stored credential via `toWebAuthnAccount`
   rather than minting a new passkey.

The SDK talks to the orchestrator through the server-side proxy at
`src/app/api/orchestrator/[...path]/route.ts`, which injects
`RHINESTONE_API_KEY` so the key never reaches the browser.

A sample cross-chain transaction would follow the v2 flow:
`prepareTransaction` → `signTransaction` → `submitTransaction` → `waitForExecution`.
