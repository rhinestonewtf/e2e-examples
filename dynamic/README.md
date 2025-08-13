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
3. **Node.js**: Version 18 or higher

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd global-wallet-demo
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
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id_here
NEXT_PUBLIC_RHINESTONE_API_KEY=your_rhinestone_api_key_here
```

4. Run the development server:

```bash
npm run dev
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

## 📚 Learning Resources

- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [Reown AppKit Documentation](https://docs.reown.com/appkit)
- [Wagmi Documentation](https://wagmi.sh)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---
