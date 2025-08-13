import { http } from "wagmi";
import { mainnet, arbitrum, base, polygon, optimism } from "wagmi/chains";
import { createConfig } from "wagmi";

export const config = createConfig({
  chains: [mainnet, arbitrum, base, polygon, optimism],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
});

export const evmNetworks = [
  {
    blockExplorerUrls: ["https://etherscan.io/"],
    chainId: 1,
    chainName: "Ethereum Mainnet",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
    name: "Ethereum",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    networkId: 1,
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    vanityName: "ETH Mainnet",
  },
  {
    blockExplorerUrls: ["https://arbiscan.io/"],
    chainId: 42161,
    chainName: "Arbitrum One",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/arbitrum.svg"],
    name: "Arbitrum",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    networkId: 42161,
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    vanityName: "Arbitrum",
  },
  {
    blockExplorerUrls: ["https://basescan.org/"],
    chainId: 8453,
    chainName: "Base",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
    name: "Base",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    networkId: 8453,
    rpcUrls: ["https://mainnet.base.org/"],
    vanityName: "Base",
  },
  {
    blockExplorerUrls: ["https://polygonscan.com/"],
    chainId: 137,
    chainName: "Polygon Mainnet",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/polygon.svg"],
    name: "Polygon",
    nativeCurrency: {
      decimals: 18,
      name: "MATIC",
      symbol: "MATIC",
    },
    networkId: 137,
    rpcUrls: ["https://polygon-rpc.com/"],
    vanityName: "Polygon",
  },
  {
    blockExplorerUrls: ["https://optimistic.etherscan.io/"],
    chainId: 10,
    chainName: "OP Mainnet",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/optimism.svg"],
    name: "Optimism",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    networkId: 10,
    rpcUrls: ["https://mainnet.optimism.io/"],
    vanityName: "Optimism",
  },
];
