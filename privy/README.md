# Global Wallet Demo - Privy + Rhinestone

This demo showcases how users can deposit tokens on any supported chain and spend them on any other supported chain, all with a single account address. Users can authenticate with Privy and leverage Rhinestone's global wallet functionality for seamless cross-chain transactions.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Authentication**: Privy (replaces Reown)
- **Wallet Management**: Privy React SDK with Wagmi integration
- **Cross-Chain**: Rhinestone SDK
- **UI Components**: shadcn/ui with Tailwind CSS
- **Supported Chains**: Ethereum, Arbitrum, Base, Polygon, Optimism

## 🚀 Quick Start

### Prerequisites

1. **Privy App ID**: Get one from [Privy Dashboard](https://dashboard.privy.io)
2. **Rhinestone API Key**: Contact Rhinestone team for access
3. **Node.js**: Version 18 or higher

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd privy
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Get your app ID from https://dashboard.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Get your API key from Rhinestone for orchestrator
NEXT_PUBLIC_RHINESTONE_API_KEY=your_rhinestone_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.


### Authentication Flow
- **Before**: Reown AppKit components (`<appkit-button />`)
- **After**: Privy hooks (`usePrivy`, `useWallets`) with custom UI

### Wallet Detection
- **Before**: Direct Wagmi `useAccount()` hook
- **After**: Privy's wallet management through `useWallets()`

## 🎯 How It Works

### The Global Wallet Flow

1. **Authenticate**: Users connect via Privy (wallet, email, or embedded wallet)
2. **Create Account**: Generate a Rhinestone account (works across all chains)
3. **User Deposits**: User sends tokens to the account on any chain
4. **Cross-Chain Spending**: Spend those tokens on any other chain

### Example Scenario

```typescript
// User deposits 10 USDC to global wallet address on Arbitrum
// Later, user wants to send 5 USDC to someone on Base

const transaction = await rhinestoneAccount.sendTransaction({
  sourceChains: [arbitrum], // Look for tokens on Arbitrum
  targetChain: base, // Execute transaction on Base
  calls: [
    /* USDC transfer on Base */
  ],
  tokenRequests: [{ address: usdcOnBase, amount: 5000000n }],
});

// Rhinestone automatically:
// 1. Uses USDC from Arbitrum
// 2. Bridges it to Base
// 3. Executes the transfer
// All in a single transaction!
```

### Resources

- [Privy Documentation](https://docs.privy.io)
- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [Wagmi Documentation](https://wagmi.sh)
- [shadcn/ui Documentation](https://ui.shadcn.com)
---
