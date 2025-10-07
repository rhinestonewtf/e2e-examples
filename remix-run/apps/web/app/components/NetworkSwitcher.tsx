import { useAccount, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "viem/chains";

export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const supportedChains = [
    { id: base.id, name: "Base Mainnet" },
    { id: baseSepolia.id, name: "Base Sepolia" },
  ];

  // Check if current chain is unsupported
  const isUnsupported =
    chain && !supportedChains.some((c) => c.id === chain.id);

  if (!isUnsupported) return null;

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1.5rem",
        border: "2px solid #f57c00",
        borderRadius: "8px",
        backgroundColor: "#fff3e0",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#e65100" }}>Unsupported Network</h3>
      <p style={{ color: "#e65100", marginBottom: "1rem" }}>
        Your wallet is connected to{" "}
        <strong>{chain?.name || "an unsupported network"}</strong>. Rhinestone
        SDK requires Base, Optimism, or Arbitrum.
      </p>
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        Please switch to one of the supported networks:
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {supportedChains.map((supportedChain) => (
          <button
            key={supportedChain.id}
            onClick={() => switchChain({ chainId: supportedChain.id })}
            disabled={isPending}
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isPending ? "not-allowed" : "pointer",
              fontWeight: "500",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Switching..." : `Switch to ${supportedChain.name}`}
          </button>
        ))}
      </div>
      <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
        <strong>Tip:</strong> If you don't see the network in your wallet, you
        may need to add it manually first.
      </p>
    </div>
  );
}
