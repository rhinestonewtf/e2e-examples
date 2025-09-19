import { useState } from "react";
import { useGlobalWallet } from "@/hooks/useGlobalWallet";
import { base, arbitrum } from "wagmi/chains";
import { encodeFunctionData, erc20Abi } from "viem";
import { getTokenAddress } from "@rhinestone/sdk";

export function MainContent() {
  const { portfolio, accountAddress, sendCrossChainTransaction } =
    useGlobalWallet();
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState<string | null>(
    null
  );

  const handleTestTransaction = async () => {
    if (!accountAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setIsTransactionLoading(true);
    setTransactionResult(null);

    try {
      const usdcAmount = 1000n;
      const target = accountAddress as `0x${string}`;

      const arbitrumUsdcAddress = getTokenAddress("USDC", arbitrum.id);
      const result = await sendCrossChainTransaction({
        sourceChains: [base],
        targetChain: arbitrum,
        calls: [
          {
            to: arbitrumUsdcAddress,
            value: 0n,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [target, usdcAmount],
            }),
          },
        ],
        tokenRequests: [
          {
            address: arbitrumUsdcAddress,
            amount: usdcAmount.toString(),
          },
        ],
      });

      setTransactionResult(
        result.fillTransactionHash || "Transaction completed successfully"
      );
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionResult(
        error instanceof Error ? error.message : "Transaction failed"
      );
    } finally {
      setIsTransactionLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to Global Wallet
          </h1>
          <p className="text-lg text-slate-600">
            Experience seamless cross-chain transactions with Rhinestone SDK
          </p>
        </div>

        {!accountAddress ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <div className="mb-4">
              <svg
                className="w-12 h-12 text-slate-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-slate-600 mb-6">
              Connect your wallet to start using the global wallet features
            </p>
            <p className="text-sm text-slate-500">
              Use the wallet connection panel on the right to get started
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Account Info */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Account Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Global Address
                  </h3>
                  <p className="text-sm font-mono text-slate-900 bg-slate-50 p-3 rounded border break-all">
                    {accountAddress}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Portfolio Value
                  </h3>
                  <div className="text-2xl font-bold text-slate-900">
                    {portfolio.length} Token{portfolio.length !== 1 ? "s" : ""}
                  </div>
                  <p className="text-sm text-slate-500">
                    Across{" "}
                    {
                      new Set(
                        portfolio.flatMap((t) => t.chains.map((c) => c.chainId))
                      ).size
                    }{" "}
                    chains
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio Summary */}
            {portfolio.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Portfolio Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolio.map((token) => (
                    <div
                      key={token.symbol}
                      className="p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-900">
                          {token.symbol}
                        </h3>
                        <span className="text-lg font-bold text-slate-900">
                          {parseFloat(token.totalBalance).toFixed(4)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-600">
                          Available:{" "}
                          {parseFloat(token.unlockedBalance).toFixed(4)}
                        </div>
                        {parseFloat(token.lockedBalance) > 0 && (
                          <div className="text-xs text-slate-600">
                            Locked: {parseFloat(token.lockedBalance).toFixed(4)}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          On {token.chains.length} chain
                          {token.chains.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button
                  onClick={handleTestTransaction}
                  disabled={isTransactionLoading}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isTransactionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Transaction...
                    </>
                  ) : (
                    "Transfer 0.01 USDC: Base → Arbitrum"
                  )}
                </button>

                {transactionResult && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">
                      Transaction Result:
                    </h4>
                    <p className="text-sm text-slate-600 font-mono break-all">
                      {transactionResult}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
