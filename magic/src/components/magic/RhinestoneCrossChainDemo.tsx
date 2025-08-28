import { useState } from "react";
import { useRhinestoneWallet } from "@/hooks/useRhinestoneWallet";
import { Button } from "@/components/ui/button";
// Remove Card import since we're using div with card class
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Send, Loader2 } from "lucide-react";
import { encodeFunctionData, parseUnits } from "viem";
import { arbitrum, base, sepolia } from "viem/chains";

// Example chains and USDC addresses for demo
const DEMO_CHAINS = {
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  base: {
    id: 8453,
    name: "Base", 
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  sepolia: {
    id: 11155111,
    name: "Ethereum Sepolia",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Example USDC on Sepolia
  },
};

// Simple ERC20 ABI for transfer function
const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function RhinestoneCrossChainDemo() {
  const {
    sendCrossChainTransaction,
    portfolio,
    accountAddress,
    refreshPortfolio,
    isConnected,
  } = useRhinestoneWallet();

  const [isTransacting, setIsTransacting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("0.1");
  const [recipient, setRecipient] = useState("");

  // Find USDC token in portfolio
  const usdcToken = portfolio.find((token) => token.symbol === "USDC");
  const arbitrumBalance = usdcToken?.chains.find(
    (chain) => chain.chainId === 42161
  );

  // Check if user has available (unlocked) USDC on Arbitrum
  const hasAvailableUSDC =
    arbitrumBalance && parseFloat(arbitrumBalance.formattedUnlockedBalance) > 0;

  const handleTransfer = async () => {
    if (!accountAddress || !recipient || !amount) {
      setError("Please fill in all fields");
      return;
    }

    setIsTransacting(true);
    setError(null);
    setResult(null);
    setTransactionHash(null);

    try {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      
      // Define the transfer call on Base
      const calls = [
        {
          to: DEMO_CHAINS.base.usdcAddress as `0x${string}`,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [recipient as `0x${string}`, amountWei],
          }),
        },
      ];

      // Request USDC tokens on Base
      const tokenRequests = [
        {
          address: DEMO_CHAINS.base.usdcAddress as `0x${string}`,
          amount: amountWei,
        },
      ];

      // Define source and target chains using viem chain objects
      const sourceChains = [arbitrum];
      const targetChain = base;

      const transaction = await sendCrossChainTransaction(
        sourceChains,
        targetChain,
        calls,
        tokenRequests
      );

      // Set transaction hash if available
      if (transaction.fillTransactionHash) {
        setTransactionHash(transaction.fillTransactionHash);
        setResult(`Transfer successful! View transaction on BaseScan`);
      } else {
        setResult(
          `Transfer successful! Transaction ID: ${transaction.transaction.id}`
        );
      }
      setAmount("");
      setRecipient("");

      // Refresh portfolio to show updated balances
      setTimeout(() => {
        refreshPortfolio();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setIsTransacting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Welcome to Rhinestone Global Wallet
          </h2>
          <p className="text-slate-600">Login with Magic to access cross-chain features</p>
        </div>
      </div>
    );
  }

  if (!accountAddress) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your global wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Cross-Chain Transfer Demo
        </h2>
        <p className="text-slate-600 mb-8">
          Transfer tokens between chains using your Magic + Rhinestone global wallet
        </p>

        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Send className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Demo Transfer</h3>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="mb-6">
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-700">
                        {result}
                      </p>
                      {transactionHash && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">
                            Transaction Hash:
                          </span>
                          <a
                            href={`https://basescan.org/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono bg-slate-100 px-2 py-1 rounded border hover:bg-slate-200 transition-colors text-blue-600 hover:text-blue-800"
                          >
                            {transactionHash.slice(0, 10)}...
                            {transactionHash.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>
                    {recipient && (
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-sm font-medium text-green-700">
                          🎉 Transaction completed! Check the results:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {transactionHash && (
                            <a
                              href={`https://basescan.org/tx/${transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors font-mono"
                            >
                              🔗 View Transaction on BaseScan
                            </a>
                          )}
                          <a
                            href={`https://basescan.org/address/${recipient}#tokentxns`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          >
                            📊 View Recipient Balance on BaseScan
                          </a>
                          {accountAddress && (
                            <>
                              <a
                                href={`https://basescan.org/address/${accountAddress}#tokentxns`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                              >
                                🏦 View Your Global Wallet (Base)
                              </a>
                              <a
                                href={`https://arbiscan.io/address/${accountAddress}#tokentxns`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                              >
                                🌉 View Source (Arbitrum)
                              </a>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          It may take a few moments for the transaction to
                          appear on BaseScan
                        </p>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Transfer Route */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-6">
              <div className="text-center">
                <Badge variant="outline">Arbitrum</Badge>
                {arbitrumBalance ? (
                  <div className="mt-1 text-sm">
                    <p className="text-slate-800 font-medium">
                      {arbitrumBalance.formattedBalance} USDC
                    </p>
                    <p className="text-xs text-green-600">Available</p>
                    {parseFloat(arbitrumBalance.formattedLockedBalance) !==
                      0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Locked: {arbitrumBalance.formattedLockedBalance}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 mt-1">No USDC</p>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
              <div className="text-center">
                <Badge variant="outline">Base</Badge>
                <p className="text-sm text-slate-600 mt-1">Destination</p>
              </div>
            </div>

            {!hasAvailableUSDC ? (
              <Alert className="mb-6">
                <AlertDescription>
                  {arbitrumBalance &&
                  parseFloat(arbitrumBalance.formattedLockedBalance) > 0 ? (
                    <>
                      You have {arbitrumBalance.formattedLockedBalance} USDC
                      locked on Arbitrum, but need unlocked USDC to make
                      transfers.
                      {parseFloat(arbitrumBalance.formattedUnlockedBalance) ===
                        0 &&
                        " Send some additional USDC to your global wallet address: "}
                      {parseFloat(arbitrumBalance.formattedUnlockedBalance) ===
                        0 &&
                        `${accountAddress.slice(0, 8)}...${accountAddress.slice(
                          -6
                        )}`}
                    </>
                  ) : (
                    <>
                      You need unlocked USDC on Arbitrum to test cross-chain
                      transfers. Send some USDC to your global wallet address:{" "}
                      {accountAddress.slice(0, 8)}...{accountAddress.slice(-6)}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    disabled={isTransacting}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Available: {arbitrumBalance.formattedBalance} USDC on
                    Arbitrum
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md font-mono text-sm"
                    disabled={isTransacting}
                  />
                </div>

                <Button
                  onClick={handleTransfer}
                  disabled={isTransacting || !amount || !recipient}
                  className="w-full"
                >
                  {isTransacting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Transfer {amount} USDC</>
                  )}
                </Button>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-blue-900 mb-2">
                How it works:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>
                  1. Tokens on the source chain are used to sponsor an intent on the target chain
                </li>
                <li>
                  2. Rhinestone creates the intent and user signs with Magic wallet
                </li>
                <li>
                  3. Rhinestone Relayer Market supplies required tokens on the target chain and executes the transaction
                </li>
                <li>4. Relayer is repaid on the source chain!</li>
                <li>
                  All in one atomic transaction for the user. No bridging required
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
