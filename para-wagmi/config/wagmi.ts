"use client";

import { paraConnector } from "@getpara/wagmi-v2-integration";
import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";
import { para } from "./para";
import { queryClient } from "./queryClient";

// Define the chains we want to support
const chains = [arbitrum, base, mainnet, optimism, polygon] as const;

// Get RPC URLs from environment or use defaults
const RPC_URLS = {
  [arbitrum.id]: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
  [base.id]: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com",
  [optimism.id]: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
};

// Create the Para connector with para client instance
const connector = para ? paraConnector({
  appName: "Global Wallet Demo",
  authLayout: ["AUTH:FULL"],
  chains: chains as any,
  disableEmailLogin: false,
  disablePhoneLogin: true,
  logo: undefined,
  oAuthMethods: [],
  onRampTestMode: true,
  options: {},
  para,
  queryClient,
  recoverySecretStepEnabled: true,
  theme: {
    accentColor: "#0066CC",
    backgroundColor: "#FFFFFF",
    borderRadius: "lg",
    darkAccentColor: "#4D9FFF",
    darkBackgroundColor: "#1A1F2B",
    darkForegroundColor: "#E8EBF2",
    font: "Inter",
    foregroundColor: "#2D3648",
    mode: "light",
  },
  twoFactorAuthEnabled: false,
}) : null;

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: chains as any,
  connectors: connector ? [connector] : [],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [arbitrum.id]: http(RPC_URLS[arbitrum.id]),
    [base.id]: http(RPC_URLS[base.id]),
    [mainnet.id]: http(RPC_URLS[mainnet.id]),
    [optimism.id]: http(RPC_URLS[optimism.id]),
    [polygon.id]: http(RPC_URLS[polygon.id]),
  },
});

