import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { isServer } from "../utils/isServer";

// SSR-safe wrapper around wagmi hooks that prevents server-side execution
export function useSSRSafeWallet() {
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Only call wagmi hooks on client side
  const accountResult = useAccount();
  const walletClientResult = useWalletClient();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return safe defaults on server or before hydration
  if (isServer || !isHydrated) {
    return {
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
      walletClient: undefined,
      isHydrated: false,
    };
  }

  return {
    ...accountResult,
    walletClient: walletClientResult.data,
    isHydrated: true,
  };
}

// Hook to safely check if we're in a client environment
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
