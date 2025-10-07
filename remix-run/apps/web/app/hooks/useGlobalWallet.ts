import { useState, useEffect, useCallback, useMemo } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { RhinestoneSDK, walletClientToAccount } from "@rhinestone/sdk";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

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
  const { primaryWallet } = useDynamicContext();
  const { chain } = useAccount(); // Listen to chain changes from wagmi
  const [state, setState] = useState<GlobalWalletState>({
    rhinestoneAccount: null,
    accountAddress: null,
    portfolio: [],
    isLoading: false,
    error: null,
  });

  // Memoize the wallet address to use as a stable dependency
  const walletAddress = useMemo(() => {
    return primaryWallet?.address;
  }, [primaryWallet?.address]);

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

        const portfolio = await rhinestoneAccount.getPortfolio(false);

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

            return result;
          })
          .filter((token: any) => token._hasBalance)
          .map(({ _hasBalance, ...token }: any) => token);

        setState((prev) => ({
          ...prev,
          portfolio: formattedPortfolio,
          isLoading: false,
        }));
      } catch (error) {
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
    [] // Remove the dependency to prevent infinite loops
  );

  const sendCrossChainTransaction = useCallback(
    async (
      sourceChains: any[],
      targetChain: any,
      calls: any[],
      tokenRequests: any[]
    ) => {
      if (!state.rhinestoneAccount) {
        throw new Error("Rhinestone account not initialized");
      }

      try {
        const transaction = await state.rhinestoneAccount.sendTransaction({
          sourceChains,
          targetChain,
          calls,
          tokenRequests,
        });

        // Wait for execution
        const result =
          await state.rhinestoneAccount.waitForExecution(transaction);

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
        try {
          await fetchPortfolio();
        } catch (portfolioError) {
          console.warn(
            "Failed to refresh portfolio after transaction:",
            portfolioError
          );
        }

        return {
          transaction,
          result,
          fillTransactionHash,
        };
      } catch (error) {
        console.error("Cross-chain transaction failed:", error);
        throw error;
      }
    },
    [state.rhinestoneAccount] // Remove fetchPortfolio from dependencies
  );

  useEffect(() => {
    let isMounted = true;

    async function initializeAccount() {
      if (
        !primaryWallet ||
        !isEthereumWallet(primaryWallet) ||
        !walletAddress
      ) {
        setState((prev) => ({
          ...prev,
          rhinestoneAccount: null,
          accountAddress: null,
          portfolio: [],
          error: null,
        }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const walletClient = await primaryWallet.getWalletClient();
        if (!isMounted) return;

        const wrappedWalletClient = walletClientToAccount(walletClient);

        const rhinestone = new RhinestoneSDK({
          apiKey: "rs_KCNamU5uVhlN3vHSUaNn0AIrd7bDnaIU8I3CddEwTws",
          endpointUrl: "https://v1.orchestrator.rhinestone.dev",
        });

        const account = await rhinestone.createAccount({
          owners: {
            type: "ecdsa" as const,
            accounts: [wrappedWalletClient],
          },
        });

        const accountAddress = account.getAddress();

        if (isMounted && account) {
          setState((prev) => ({
            ...prev,
            rhinestoneAccount: account,
            accountAddress: accountAddress,
            isLoading: false,
          }));

          try {
            await fetchPortfolio(account);
          } catch (portfolioError) {
            // Don't fail the whole initialization if portfolio fetch fails
          }
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            rhinestoneAccount: null,
            accountAddress: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize account",
          }));
        }
      }
    }

    initializeAccount();

    return () => {
      isMounted = false;
    };
  }, [primaryWallet, walletAddress, chain?.id]);

  return {
    ...state,
    address: walletAddress,
    refreshPortfolio: () => fetchPortfolio(),
    sendCrossChainTransaction,
  };
}
