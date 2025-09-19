import { useState, useEffect, useCallback } from "react";
import { createRhinestoneAccount, walletClientToAccount } from "@rhinestone/sdk";
import { formatUnits } from "viem";
import { useSSRSafeWallet } from "./useSSRSafeWallet";
import { isServer } from "../utils/isServer";

export interface TokenBalance {
  symbol: string;
  totalBalance: string;
  lockedBalance: string;
  unlockedBalance: string;
  decimals: number;
  chains: Array<{
    chainId: number;
    chainName: string;
    balance: string;
    formattedBalance: string;
    lockedBalance: string;
    unlockedBalance: string;
    formattedLockedBalance: string;
    formattedUnlockedBalance: string;
  }>;
}

export interface GlobalWalletState {
  rhinestoneAccount: any | null;
  accountAddress: string | null;
  portfolio: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export function useGlobalWallet() {
  // Use SSR-safe wallet hooks
  const { address, isConnected, walletClient, isHydrated } = useSSRSafeWallet();
  
  const [state, setState] = useState<GlobalWalletState>({
    rhinestoneAccount: null,
    accountAddress: null,
    portfolio: [],
    isLoading: false,
    error: null,
  });

  // Don't initialize anything on server
  if (isServer) {
    return {
      ...state,
      refreshPortfolio: () => Promise.resolve(),
      sendCrossChainTransaction: async () => {
        throw new Error("Transactions not available on server");
      },
    };
  }

  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: "Ethereum",
      42161: "Arbitrum",
      8453: "Base",
      137: "Polygon",
      10: "Optimism",
      1868: "Autonomys",
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const fetchPortfolio = useCallback(
    async (account?: any) => {
      const rhinestoneAccount = account || state.rhinestoneAccount;
      if (!rhinestoneAccount) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const portfolio = await rhinestoneAccount.getPortfolio();
        console.log("Raw portfolio data:", portfolio);

        const formattedPortfolio: TokenBalance[] = portfolio
          .map((token: any) => {
            // Handle actual API structure: token has symbol, decimals, balances, chains
            const totalLocked = BigInt(token.balances?.locked || 0);
            const totalUnlocked = BigInt(token.balances?.unlocked || 0);
            // Available balance is unlocked balance only
            const formattedAvailable = formatUnits(
              totalUnlocked,
              token.decimals
            );
            const formattedLocked = formatUnits(totalLocked, token.decimals);
            const formattedUnlocked = formatUnits(
              totalUnlocked,
              token.decimals
            );

            const chains = (token.chains || [])
              .map((chain: any) => {
                const chainLocked = BigInt(chain.locked || 0);
                const chainUnlocked = BigInt(chain.unlocked || 0);
                // Available balance per chain is unlocked balance only
                const formattedChainAvailable = formatUnits(
                  chainUnlocked,
                  token.decimals
                );
                const formattedChainLocked = formatUnits(
                  chainLocked,
                  token.decimals
                );
                const formattedChainUnlocked = formatUnits(
                  chainUnlocked,
                  token.decimals
                );

                return {
                  chainId: chain.chain,
                  chainName: getChainName(chain.chain),
                  balance: chainUnlocked.toString(), // Available balance
                  formattedBalance: formattedChainAvailable, // Available balance
                  lockedBalance: chainLocked.toString(),
                  unlockedBalance: chainUnlocked.toString(),
                  formattedLockedBalance: formattedChainLocked,
                  formattedUnlockedBalance: formattedChainUnlocked,
                };
              })
              .filter(
                (chain: any) =>
                  BigInt(chain.balance) > BigInt(0) ||
                  BigInt(chain.lockedBalance) > BigInt(0) ||
                  BigInt(chain.unlockedBalance) > BigInt(0)
              );

            const result = {
              symbol: token.symbol,
              totalBalance: formattedAvailable, // Show available balance as total
              lockedBalance: formattedLocked,
              unlockedBalance: formattedUnlocked,
              decimals: token.decimals,
              chains,
              _hasBalance:
                totalUnlocked > BigInt(0) ||
                totalLocked > BigInt(0) ||
                chains.length > 0,
            };

            console.log(
              `Token ${token.symbol}: locked=${totalLocked}, unlocked=${totalUnlocked}, available=${totalUnlocked}, chains=${chains.length}`
            );
            return result;
          })
          .filter((token: any) => {
            // Show tokens that have any balance (locked, unlocked, or on any chain)
            console.log(
              `Filtering ${token.symbol}: hasBalance=${token._hasBalance}`
            );
            return token._hasBalance;
          })
          .map(({ _hasBalance, ...token }: any) => token);

        setState((prev) => ({
          ...prev,
          portfolio: formattedPortfolio,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch portfolio",
        }));
      }
    },
    [state.rhinestoneAccount]
  );

  const initializeRhinestoneAccount = useCallback(async () => {
    // Don't initialize if not hydrated yet or missing wallet data
    if (!isHydrated || !isConnected || !address || !walletClient) {
      setState((prev) => ({
        ...prev,
        rhinestoneAccount: null,
        accountAddress: null,
        portfolio: [],
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const apiKey = import.meta.env.VITE_RHINESTONE_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Rhinestone API key not configured. Please set VITE_RHINESTONE_API_KEY"
        );
      }

      const accountWalletClient = walletClientToAccount(walletClient);

      // Use the connected wallet client
      const rhinestoneAccount = await createRhinestoneAccount({
        owners: {
          type: "ecdsa",
          accounts: [accountWalletClient as any],
        },
        rhinestoneApiKey: apiKey,
      });

      const accountAddress = rhinestoneAccount.getAddress();

      setState((prev) => ({
        ...prev,
        rhinestoneAccount,
        accountAddress,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to initialize Rhinestone account:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize account",
      }));
    }
  }, [isHydrated, isConnected, address, walletClient]);

  const sendCrossChainTransaction = useCallback(
    async (transactionParams: {
      sourceChains?: any[];
      targetChain: any;
      calls: any[];
      tokenRequests: any[];
    }) => {
      if (!state.rhinestoneAccount) {
        throw new Error("Rhinestone account not initialized");
      }

      try {
        console.log("Starting cross-chain transaction with params:", transactionParams);

        // Check if account is deployed on source chains (for logging only)
        const sourceChains = transactionParams.sourceChains || [];
        for (const chain of sourceChains) {
          const deployed = await state.rhinestoneAccount.isDeployed(chain);
          console.log(`Account deployed on ${chain.name} (${chain.id}):`, deployed);
          
          if (!deployed) {
            console.log(`Account not deployed on ${chain.name}. The SDK will handle deployment during the transaction.`);
            console.log(`Note: Account deployment requires ~0.002 ETH for gas fees.`);
          }
        }

        // Use the exact same flow as the working backend
        console.log("Preparing transaction...");
        const preparedTransaction = await state.rhinestoneAccount.prepareTransaction({
          sourceChains: transactionParams.sourceChains?.length ? transactionParams.sourceChains : undefined,
          targetChain: transactionParams.targetChain,
          calls: transactionParams.calls,
          tokenRequests: transactionParams.tokenRequests,
        });
        console.log("Prepared transaction:", preparedTransaction);

        console.log("Signing transaction...");
        const signedTransaction = await state.rhinestoneAccount.signTransaction(preparedTransaction);
        console.log("Signed transaction:", signedTransaction);

        console.log("Submitting transaction...");
        const transaction = await state.rhinestoneAccount.submitTransaction(signedTransaction);

        console.log("Waiting for execution...");
        const result = await state.rhinestoneAccount.waitForExecution(transaction);

        // Extract transaction hash if available
        let fillTransactionHash = null;
        if (result && typeof result === "object") {
          if ("fillTransactionHash" in result) {
            fillTransactionHash = result.fillTransactionHash;
          } else if ("transactionHash" in result) {
            fillTransactionHash = result.transactionHash;
          }
        }

        // Refresh portfolio after transaction
        await fetchPortfolio();

        return {
          transaction,
          result,
          fillTransactionHash,
        };
      } catch (error) {
        console.error("Cross-chain transaction failed:", error);
        
        // Provide helpful error message for insufficient balance
        if (error instanceof Error && error.message.includes("Insufficient balance")) {
          throw new Error("Insufficient balance for transaction. You need ETH for gas fees (~0.002 ETH for account deployment). Please add ETH to your account and try again.");
        }
        
        throw error;
      }
    },
    [state.rhinestoneAccount, fetchPortfolio]
  );

  useEffect(() => {
    initializeRhinestoneAccount();
  }, [initializeRhinestoneAccount]);

  // Fetch portfolio when rhinestone account is available
  useEffect(() => {
    if (state.rhinestoneAccount) {
      fetchPortfolio();
    }
  }, [state.rhinestoneAccount, fetchPortfolio]);

  return {
    ...state,
    refreshPortfolio: () => fetchPortfolio(),
    sendCrossChainTransaction,
  };
}
