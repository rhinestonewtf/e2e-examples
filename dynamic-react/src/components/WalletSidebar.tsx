import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useGlobalWallet } from "@/hooks/useGlobalWallet";
import { ClientOnly } from "./ClientOnly";

export function WalletSidebar() {
  const { portfolio, accountAddress, isLoading, error } = useGlobalWallet();

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Connect Wallet
        </h2>
        <ClientOnly
          delay={1500}
          fallback={
            <div className="p-4 bg-slate-100 rounded-lg text-center border-2 border-dashed border-slate-300">
              <div className="animate-pulse">
                <div className="w-full h-10 bg-slate-200 rounded mb-2"></div>
                <p className="text-sm text-slate-500 font-medium">
                  🖥️ SSR: Loading wallet...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  This fallback is rendered on the server
                </p>
              </div>
            </div>
          }
        >
          <div className="relative">
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              client loaded
            </div>
            <DynamicWidget />
          </div>
        </ClientOnly>
      </div>

      {accountAddress && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Global Address
          </h3>
          <div className="p-3 bg-slate-100 rounded-lg">
            <p className="text-xs font-mono text-slate-600 break-all">
              {accountAddress}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Portfolio</h3>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {!isLoading && !error && portfolio.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No tokens found</p>
            <p className="text-xs text-slate-400 mt-1">
              Deposit tokens to see your portfolio
            </p>
          </div>
        )}

        {portfolio.length > 0 && (
          <div className="space-y-3">
            {portfolio.map((token) => (
              <div key={token.symbol} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-slate-900">
                    {token.symbol}
                  </h4>
                  <span className="text-sm font-medium text-slate-900">
                    {parseFloat(token.totalBalance).toFixed(4)}
                  </span>
                </div>

                {token.chains.length > 0 && (
                  <div className="space-y-1">
                    {token.chains.map((chain) => (
                      <div
                        key={chain.chainId}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-slate-600">
                          {chain.chainName}
                        </span>
                        <span className="text-slate-900 font-medium">
                          {parseFloat(chain.formattedBalance).toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
