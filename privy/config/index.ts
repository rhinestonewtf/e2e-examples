import { cookieStorage, createStorage, http } from "wagmi";
import { createConfig } from "wagmi";
import {
  mainnet,
  arbitrum,
  base,
  polygon,
  optimism,
} from "wagmi/chains";

// Supported chains for the app
export const supportedChains = [mainnet, arbitrum, base, polygon, optimism] as const;

// Create Wagmi config for Privy
export const wagmiConfig = createConfig({
  chains: supportedChains,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
});

// Export config for compatibility
export const config = wagmiConfig;