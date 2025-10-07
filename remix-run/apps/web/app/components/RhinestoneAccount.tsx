import { useGlobalWallet } from "~/hooks/useGlobalWallet";

export function RhinestoneAccount() {
  const {
    rhinestoneAccount,
    accountAddress,
    portfolio,
    isLoading,
    error,
    address,
  } = useGlobalWallet();

  if (!address) {
    return (
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <p>Connect your wallet to see your Rhinestone smart account</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Rhinestone Account Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading && !rhinestoneAccount) {
    return (
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Rhinestone Smart Account</h2>
        <p>Loading Rhinestone account...</p>
      </div>
    );
  }

  if (!rhinestoneAccount || !accountAddress) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Rhinestone Smart Account</h2>
      <p>
        <strong>EOA Wallet:</strong> {address}
      </p>
      <p>
        <strong>Smart Account Address:</strong> {accountAddress}
      </p>

      <h3>Portfolio</h3>
      {isLoading && <p>Refreshing portfolio...</p>}

      {portfolio.length === 0 ? (
        <p>No tokens found in portfolio</p>
      ) : (
        <div>
          {portfolio.map((token, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <p>
                <strong>{token.symbol}:</strong>{" "}
                {parseFloat(token.unlockedBalance).toFixed(6)} Available
                {parseFloat(token.lockedBalance) > 0 && (
                  <span>
                    {" "}
                    ({parseFloat(token.lockedBalance).toFixed(6)} Locked)
                  </span>
                )}
              </p>
              {token.chains.length > 0 && (
                <div style={{ marginLeft: "1rem", fontSize: "0.9rem" }}>
                  {token.chains.map((chain, chainIndex) => (
                    <p key={chainIndex} style={{ margin: "0.2rem 0" }}>
                      {chain.chainName}: {chain.formattedUnlockedBalance}
                      {parseFloat(chain.formattedLockedBalance) > 0 && (
                        <span> (Locked: {chain.formattedLockedBalance})</span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
