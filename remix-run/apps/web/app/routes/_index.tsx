import type { MetaFunction } from "@remix-run/node";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { config } from "~/config/wagmi";
import { RhinestoneAccount } from "~/components/RhinestoneAccount";
import { NetworkSwitcher } from "~/components/NetworkSwitcher";

export const meta: MetaFunction = () => {
  return [
    { title: "Wagmi + Remix + Dynamic + Rhinestone" },
    {
      name: "description",
      content: "Rhinestone SDK integration with Dynamic and Wagmi!",
    },
  ];
};

function WagmiAccountInfo() {
  const { address, isConnected, chain } = useAccount();

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Wagmi Account Information</h2>
      <p>
        <strong>Wagmi connected:</strong> {isConnected ? "true" : "false"}
      </p>
      <p>
        <strong>Wagmi address:</strong> {address || "Not connected"}
      </p>
      <p>
        <strong>Wagmi network:</strong> {chain?.id || "N/A"}
      </p>
      <p>
        <strong>Network name:</strong> {chain?.name || "N/A"}
      </p>
    </div>
  );
}

export default function Index() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "f6ac2908-10ed-4d7e-b467-a446db13e28a",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <div
              style={{
                padding: "2rem",
                fontFamily: "system-ui, sans-serif",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              <h1>Rhinestone SDK + Dynamic + Wagmi</h1>
              <p style={{ marginBottom: "1rem", color: "#666" }}>
                Connect your wallet to create a Rhinestone smart account
              </p>

              <DynamicWidget />

              <NetworkSwitcher />

              <RhinestoneAccount />

              <WagmiAccountInfo />
            </div>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
