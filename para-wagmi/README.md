# Global Wallet Demo - Para + Wagmi + Rhinestone

This demo showcases how users can deposit tokens on any supported chain and spend them on any other supported chain, all with a single account address. Users authenticate with Para Wallet through its Wagmi connector and leverage Rhinestone's global wallet functionality for seamless cross-chain transactions.

This is the Wagmi-connector counterpart to the `para-viem` example: here Para is wired in as a Wagmi connector, so wallet state is read through standard Wagmi hooks (`useAccount`, `useWalletClient`).

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Wallet**: Para Wallet SDK (`@getpara/react-sdk`)
- **Wallet Management**: Wagmi via the Para Wagmi connector (`@getpara/wagmi-v2-integration`)
- **Cross-Chain**: Rhinestone SDK
- **UI Components**: shadcn/ui with Tailwind CSS
- **Supported Chains**: Ethereum, Arbitrum, Base, Polygon, Optimism

## 🚀 Quick Start

### Prerequisites

1. **Para API Key**: Get one from [Para Dashboard](https://getpara.com)
2. **Rhinestone API Key**: Contact the Rhinestone team for access
3. **Node.js**: Version 22.13 or higher (required by the pinned pnpm)

### Installation

1. Install dependencies (run from the repo root — this is a pnpm workspace):

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Get your Para API key from https://getpara.com
NEXT_PUBLIC_PARA_API_KEY=""

# Get your API key from Rhinestone for orchestrator
# Kept server-side (no NEXT_PUBLIC_ prefix); requests are proxied through /api/orchestrator
RHINESTONE_API_KEY=your_rhinestone_api_key_here
```

3. Run the development server:

```bash
pnpm --filter @rhinestone-examples/para-wagmi dev
# or, from this directory:
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔌 How Para + Wagmi Connect

- Para is registered as a Wagmi connector via `paraConnector` from `@getpara/wagmi-v2-integration` (see `config/wagmi.ts`).
- The Para provider and styles wrap the app in `context/index.tsx`.
- Wallet state is read with standard Wagmi hooks — `useAccount()` for the connected address and `useWalletClient()` for the signer — which `useGlobalWallet` wraps for the Rhinestone SDK.

## 🎯 How It Works

### The Global Wallet Flow

1. **Authenticate**: Users connect via Para Wallet through the Wagmi connector
2. **Create Account**: Generate a Rhinestone account (works across all chains)
3. **User Deposits**: User sends tokens to the account on any chain
4. **Cross-Chain Spending**: Spend those tokens on any other chain

### Example Scenario

```typescript
// User deposits 10 USDC to the global wallet address on Arbitrum
// Later, user wants to send 5 USDC to someone on Base

const prepared = await rhinestoneAccount.prepareTransaction({
  sourceChains: [arbitrum], // Look for tokens on Arbitrum
  targetChain: base, // Execute transaction on Base
  calls: [
    /* USDC transfer on Base */
  ],
  tokenRequests: [{ address: usdcOnBase, amount: 5000000n }],
});
const signed = await rhinestoneAccount.signTransaction(prepared);
const transaction = await rhinestoneAccount.submitTransaction(signed);

// Rhinestone automatically:
// 1. Uses USDC from Arbitrum
// 2. Bridges it to Base
// 3. Executes the transfer
// All in a single transaction!
```

### Resources

- [Para Documentation](https://docs.getpara.com)
- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [Wagmi Documentation](https://wagmi.sh)
- [shadcn/ui Documentation](https://ui.shadcn.com)
