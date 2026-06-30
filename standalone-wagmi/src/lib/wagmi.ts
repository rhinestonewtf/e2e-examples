import { createConfig, http } from "wagmi";
import { arbitrum, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [base, arbitrum],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
