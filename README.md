# Rhinestone Global Wallet Examples

This repository contains example implementations demonstrating Rhinestone's global wallet functionality with different wallet connection providers. Each example showcases how users can deposit tokens on any supported chain and spend them seamlessly on any other supported chain using a single account address.

All examples are built on **`@rhinestone/sdk` v2** and pinned to a single SDK version through a pnpm workspace, so the whole repo builds as one unit.

## Examples

- **`dynamic/`** - Integration with Dynamic wallet connection
- **`privy/`** - Integration with Privy authentication and embedded wallets
- **`reown/`** - Integration with Reown (formerly WalletConnect) AppKit
- **`para-viem/`** - Integration with Para using the Para viem SDK
- **`para-wagmi/`** - Integration with Para using the Para wagmi SDK
- **`magic/`** - Integration with Magic authentication
- **`backend/`** - CLI bundle generator for testing Rhinestone Orchestrator intents (git submodule)

Each frontend example is a complete Next.js application demonstrating cross-chain token management powered by the Rhinestone SDK. The backend provides a CLI tool for generating and testing transaction bundles.

## Setup

This is a [pnpm workspace](https://pnpm.io/workspaces). Install pnpm if you don't have it (`corepack enable`), then:

```bash
# Clone with the backend submodule, or initialize it after cloning:
git submodule update --init --recursive

# Install all examples in one go
pnpm install
```

Shared dependency versions (including `@rhinestone/sdk`) live in the `catalog` in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) — bumping the SDK across every example is a one-line change there.

## Running an example

Each app is a standalone Next.js project. Copy its `env.example` to `.env` and fill in the required keys, then:

```bash
pnpm --filter @rhinestone-examples/dynamic dev
```

(substitute the app you want). Or `cd` into the app directory and run `pnpm dev`.

## Workspace scripts

```bash
pnpm typecheck   # typecheck every example
pnpm build       # build every example
pnpm check:sdk   # assert all examples pin the SDK via the catalog (no drift)
```

CI runs `check:sdk` and `typecheck` on every example, so an app can't silently fall behind the pinned SDK version.
