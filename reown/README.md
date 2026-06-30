## Global Wallet Demo

This demo showcases how users can deposit tokens on any supported chain and spend them on any other supported chain, all with a single account address. For this demo we deposits on Arb and make intent on base.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Wallet Connection**: Reown AppKit with Wagmi
- **Cross-Chain**: Rhinestone SDK
- **UI Components**: shadcn/ui with Tailwind CSS
- **Supported Chains**: Ethereum, Arbitrum, Base, Polygon, Optimism

## 🚀 Quick Start

### Prerequisites

1. **Reown Project ID**: Get one from [Reown Dashboard](https://dashboard.reown.com)
2. **Rhinestone API Key**: Contact Rhinestone team for access
3. **Node.js**: Version 22.13 or higher (required by the pinned pnpm)

### Installation

1. Clone the repository and enter it:

```bash
git clone git@github.com:rhinestonewtf/e2e-examples.git
cd e2e-examples
```

2. Install dependencies (this is a pnpm workspace, so install once from the root):

```bash
pnpm install
```

3. Configure this app's environment:

```bash
cd reown
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id_here
RHINESTONE_API_KEY=your_rhinestone_api_key_here
```

4. Run the development server (from the `reown/` directory):

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

### The Global Wallet Flow

1. **Create Account**: Generate a Rhinestone account (works across all chains)
2. **User Deposits**: User sends tokens to the account on any chain
3. **Cross-Chain Spending**: Spend those tokens on any other chain

### Example Scenario

```typescript
// User deposits 10 USDC to global wallet address on Arbitrum
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

## 📚 Learning Resources

- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [Reown AppKit Documentation](https://docs.reown.com/appkit)
- [Wagmi Documentation](https://wagmi.sh)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---
