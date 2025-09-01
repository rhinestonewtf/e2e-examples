import { useState, useEffect, useCallback } from "react";
import { useMagic } from "./MagicProvider";
import {
  createRhinestoneAccount,
  walletClientToAccount,
} from "@rhinestone/sdk";
import { formatUnits, createWalletClient, custom } from "viem";

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

export interface RhinestoneWalletState {
  rhinestoneAccount: any | null;
  accountAddress: string | null;
  magicAddress: string | null;
  portfolio: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export function useRhinestoneWallet() {
  const { magic } = useMagic();
  const [state, setState] = useState<RhinestoneWalletState>({
    rhinestoneAccount: null,
    accountAddress: null,
    magicAddress: null,
    portfolio: [],
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: "Ethereum",
      42161: "Arbitrum",
      8453: "Base",
      137: "Polygon",
      10: "Optimism",
      11155111: "Ethereum Sepolia",
      80002: "Polygon Amoy",
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
    if (!magic) {
      setState((prev) => ({
        ...prev,
        rhinestoneAccount: null,
        accountAddress: null,
        magicAddress: null,
        portfolio: [],
        error: null,
        isConnected: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if user is logged in with Magic
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: false,
        }));
        return;
      }

      // Get user's Magic wallet address
      const userInfo = await magic.user.getInfo();
      const magicAddress = userInfo.publicAddress;

      if (!magicAddress) {
        throw new Error("No Magic wallet address found");
      }

      const apiKey = process.env.NEXT_PUBLIC_RHINESTONE_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Rhinestone API key not configured. Please set NEXT_PUBLIC_RHINESTONE_API_KEY"
        );
      }

      // Create a viem wallet client using Magic's provider
      const walletClient = createWalletClient({
        account: magicAddress as `0x${string}`,
        transport: custom(magic.rpcProvider as any),
      });

      // wrap the wagmi client for the sdk
      const wrappedWalletClient = walletClientToAccount(walletClient);

      // use the wallet client (from Dynamic) to create a Rhinestone account
      const account = await createRhinestoneAccount({
        owners: {
          type: "ecdsa",
          accounts: [wrappedWalletClient],
        },
        rhinestoneApiKey: apiKey,
      });

      const accountAddress = account.getAddress();

      setState((prev) => ({
        ...prev,
        rhinestoneAccount: account,
        accountAddress,
        magicAddress,
        isLoading: false,
        isConnected: true,
      }));
    } catch (error) {
      console.error("Failed to initialize Rhinestone account:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isConnected: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize account",
      }));
    }
  }, [magic]);

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
        const result = await state.rhinestoneAccount.waitForExecution(
          transaction
        );

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
        throw error;
      }
    },
    [state.rhinestoneAccount, fetchPortfolio]
  );

  const logout = useCallback(async () => {
    if (magic) {
      await magic.user.logout();
      setState({
        rhinestoneAccount: null,
        accountAddress: null,
        magicAddress: null,
        portfolio: [],
        isLoading: false,
        error: null,
        isConnected: false,
      });
    }
  }, [magic]);

  useEffect(() => {
    initializeRhinestoneAccount();
  }, [initializeRhinestoneAccount]);

  // Fetch portfolio when rhinestone account is available
  useEffect(() => {
    if (state.rhinestoneAccount && state.isConnected) {
      fetchPortfolio();
    }
  }, [state.rhinestoneAccount, state.isConnected, fetchPortfolio]);

  return {
    ...state,
    refreshPortfolio: () => fetchPortfolio(),
    sendCrossChainTransaction,
    logout,
    reconnect: initializeRhinestoneAccount,
  };
}
