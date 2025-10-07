import { createConfig } from "wagmi";
import { http } from "viem";
import { base, baseSepolia } from "viem/chains";

export const config = createConfig({
  chains: [base, baseSepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
