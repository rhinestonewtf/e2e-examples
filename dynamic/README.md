## Rhinestone Dynamic Integration Demo

This demo showcases how to integrate Dynamic Labs wallet connection with Rhinestone smart accounts for cross-chain transactions. Users can deposit tokens on any supported chain and spend them on any other supported chain, all with a single account address.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Wallet Connection**: Dynamic Labs with Ethereum connectors
- **Cross-Chain**: Rhinestone SDK
- **UI Components**: shadcn/ui with Tailwind CSS
- **Supported Chains**: Ethereum, Arbitrum, Base, Polygon, Optimism

## 🚀 Quick Start

### Prerequisites

1. **Dynamic Environment ID**: Get one from [Dynamic Dashboard](https://app.dynamic.xyz)
2. **Rhinestone API Key**: Contact Rhinestone team for access
3. **Node.js**: Version 18 or higher

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd dynamic-example
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
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
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

## 🔧 Integration Pattern

This example demonstrates the core pattern for integrating Dynamic with Rhinestone:

1. **Get the wallet client from Dynamic**
2. **Pass it to Rhinestone for account creation**
3. **Use Rhinestone account for cross-chain transactions**

```tsx
// Key hook implementation
const walletClient = await primaryWallet.getWalletClient();
const rhinestone = new RhinestoneSDK({
  apiKey: process.env.NEXT_PUBLIC_RHINESTONE_API_KEY,
});
const rhinestoneAccount = await rhinestone.createAccount({
  owners: {
    type: "ecdsa",
    accounts: [walletClient], // Dynamic wallet client
  },
});
```

## 📚 Learning Resources

- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [Dynamic Labs Documentation](https://docs.dynamic.xyz)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---
