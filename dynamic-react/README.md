# Global Wallet Demo - Rhinestone SDK

A React application demonstrating cross-chain wallet functionality using the Rhinestone SDK with Dynamic wallet integration.

## Features

- 🌐 **Global Wallet**: One address across all supported chains
- 🔄 **Cross-Chain Transactions**: Seamless transfers between different blockchains
- 💼 **Portfolio Management**: View token balances across multiple chains
- 🔗 **Dynamic Wallet Integration**: Easy wallet connection with multiple providers
- ⚡ **Modern Stack**: React 18.3, Vite 5.4, TypeScript, and Tailwind CSS

## Supported Chains

- Ethereum Mainnet
- Arbitrum
- Base
- Polygon
- Optimism
- Sepolia (Testnet)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- A Rhinestone API key

### Installation

1. Clone the repository and install dependencies:

```bash
yarn install
```

2. Set up your environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Rhinestone API key:

```
VITE_RHINESTONE_API_KEY=your_rhinestone_api_key_here
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/          # React components
│   ├── MainContent.tsx  # Main application content
│   └── WalletSidebar.tsx # Wallet connection and portfolio
├── context/             # React context providers
│   └── index.tsx        # Wagmi and Dynamic wallet providers
├── hooks/               # Custom React hooks
│   └── useGlobalWallet.ts # Rhinestone SDK integration
├── lib/                 # Utility functions
│   └── utils.ts         # Tailwind CSS utilities
├── config.ts            # Wagmi configuration
├── App.tsx              # Main app component
└── main.tsx             # App entry point
```

## Key Components

### useGlobalWallet Hook

The core hook that integrates with the Rhinestone SDK:

- Initializes Rhinestone account
- Manages portfolio state
- Handles cross-chain transactions
- Provides real-time balance updates

### WalletSidebar

- Dynamic wallet connection interface
- Portfolio overview with multi-chain balances
- Real-time balance updates

### MainContent

- Account overview and statistics
- Cross-chain transaction interface
- Portfolio summary and management

## Configuration

The app uses several key configurations:

- **Dynamic Wallet**: Environment ID and supported wallet connectors
- **Wagmi**: Chain configurations and RPC providers
- **Rhinestone SDK**: API key and account management

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

### Adding New Chains

To add support for new chains:

1. Update `src/config.ts` with new chain configuration
2. Add chain details to `evmNetworks` array
3. Update the `getChainName` function in `useGlobalWallet.ts`

## Technologies Used

- **React 18.3** - UI framework
- **Vite 5.4** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Wagmi** - Ethereum interactions
- **Rhinestone SDK** - Cross-chain account abstraction
- **Dynamic Labs** - Wallet connection
- **React Query** - Data fetching and caching

## License

This project is part of the Rhinestone examples and is intended for educational purposes.
