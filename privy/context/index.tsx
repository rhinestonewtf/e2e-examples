"use client";

import { wagmiConfig } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import React, { type ReactNode } from "react";
import { arbitrum } from "viem/chains";

// Set up queryClient
const queryClient = new QueryClient();

// Get Privy App ID
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

if (!privyAppId) {
  throw new Error(
    "Privy App ID is not defined. Please set NEXT_PUBLIC_PRIVY_APP_ID"
  );
}

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  return (
    <PrivyProvider
      appId={privyAppId!}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        // Configure login methods
        loginMethods: ["wallet", "email"],
        // Customize appearance
        appearance: {
          theme: "light",
          accentColor: "#3b82f6",
        },
        // Default chain
        defaultChain: arbitrum,
        // Supported chains
        supportedChains: [arbitrum],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default ContextProvider;
