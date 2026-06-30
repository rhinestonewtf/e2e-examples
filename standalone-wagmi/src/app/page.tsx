"use client";

import { RhinestoneSDK } from "@rhinestone/sdk";
import { walletClientToAccount } from "@rhinestone/sdk/utils";
import { useState } from "react";
import type { Address } from "viem";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const injectedConnector = connectors.find((c) => c.type === "injected");

  async function createSmartAccount() {
    if (!walletClient) return;

    setIsCreating(true);
    setError(null);
    try {
      // The orchestrator API key stays server-side; requests are proxied
      // through /api/orchestrator (see src/app/api/orchestrator/[...path]).
      const baseUrl = window.location.origin;
      const rhinestone = new RhinestoneSDK({
        auth: { mode: "apiKey", apiKey: "proxy" },
        endpointUrl: `${baseUrl}/api/orchestrator`,
      });

      // Adapt the wagmi wallet client into an SDK-compatible ECDSA signer.
      const owner = walletClientToAccount(walletClient);
      const account = await rhinestone.createAccount({
        owners: {
          type: "ecdsa",
          accounts: [owner],
        },
      });

      setSmartAccountAddress(account.getAddress());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Standalone wagmi</CardTitle>
          <CardDescription>
            Connect any injected wallet, then derive a Rhinestone smart account
            from it. One address, usable across every supported chain — no
            third-party auth provider required.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!isConnected ? (
            <Button
              onClick={() =>
                injectedConnector && connect({ connector: injectedConnector })
              }
              disabled={!injectedConnector || isPending}
            >
              {isPending ? "Connecting..." : "Connect wallet"}
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">
                  Connected EOA
                </span>
                <code className="break-all text-sm">{address}</code>
              </div>

              {smartAccountAddress ? (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs">
                    Smart account address
                  </span>
                  <code className="break-all text-sm">
                    {smartAccountAddress}
                  </code>
                </div>
              ) : (
                <Button
                  onClick={createSmartAccount}
                  disabled={isCreating || !walletClient}
                >
                  {isCreating ? "Creating..." : "Create smart account"}
                </Button>
              )}

              <Button variant="outline" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          )}

          {error ? (
            <p className="text-destructive text-sm break-words">{error}</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
