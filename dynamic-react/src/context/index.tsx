import { config, evmNetworks } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { ClientOnly } from "../components/ClientOnly";
import { isServer } from "../utils/isServer";

// Set up queryClient
const queryClient = new QueryClient();

function SSRFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg border max-w-md">
        <div className="animate-pulse mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4 animate-bounce"></div>
          <div className="w-32 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="w-24 h-3 bg-gray-200 rounded mx-auto"></div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🖥️ Server-Side Rendering
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            This is rendered on the server. Wallet will load after JavaScript
            hydrates...
          </p>
          <div className="text-xs text-gray-500 space-y-1 text-left">
            <p>Waiting for client-side JavaScript</p>
            <p>Wallet providers will initialize after hydration</p>
            <p>This ensures SEO compatibility</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client-side wallet providers wrapped in ClientOnly
function ClientWalletProviders({ children }: { children: ReactNode }) {
  // Additional safety check for client-side rendering
  if (isServer) {
    return <SSRFallback />;
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "4bfce723-e806-412d-ac9b-3e5c22178689",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks,
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<SSRFallback />}>
      <ClientWalletProviders>{children}</ClientWalletProviders>
    </ClientOnly>
  );
}

export default ContextProvider;
