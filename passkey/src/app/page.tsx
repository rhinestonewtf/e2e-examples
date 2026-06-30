"use client";

import { RhinestoneSDK } from "@rhinestone/sdk";
import { useEffect, useState } from "react";
import type { Address, Hex } from "viem";
import {
  createWebAuthnCredential,
  toWebAuthnAccount,
} from "viem/account-abstraction";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Only the fields `toWebAuthnAccount` needs to rebuild the same account on
// reload — the private key never leaves the device secure enclave.
type StoredCredential = { id: string; publicKey: Hex };

const STORAGE_KEY = "rhinestone-passkey-credential";

function loadCredential(): StoredCredential | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredCredential) : null;
  } catch {
    return null;
  }
}

function createSdk() {
  // The orchestrator API key stays server-side; requests are proxied through
  // /api/orchestrator (see src/app/api/orchestrator/[...path]).
  const baseUrl = window.location.origin;
  return new RhinestoneSDK({
    auth: { mode: "apiKey", apiKey: "proxy" },
    endpointUrl: `${baseUrl}/api/orchestrator`,
  });
}

async function deriveAddress(
  credential: StoredCredential,
): Promise<Address> {
  const passkeyAccount = toWebAuthnAccount({ credential });
  const rhinestone = createSdk();
  const account = await rhinestone.createAccount({
    owners: {
      type: "passkey",
      accounts: [passkeyAccount],
    },
  });
  return account.getAddress();
}

export default function Home() {
  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);
  const [hasStoredCredential, setHasStoredCredential] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On reload, rebuild the account from the persisted credential rather than
  // minting a new passkey.
  useEffect(() => {
    const stored = loadCredential();
    if (!stored) return;
    setHasStoredCredential(true);
    setIsBusy(true);
    deriveAddress(stored)
      .then(setSmartAccountAddress)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to restore account",
        ),
      )
      .finally(() => setIsBusy(false));
  }, []);

  async function createPasskeyAccount() {
    setIsBusy(true);
    setError(null);
    try {
      const credential = await createWebAuthnCredential({
        name: "Rhinestone Example",
      });
      const stored: StoredCredential = {
        id: credential.id,
        publicKey: credential.publicKey,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setHasStoredCredential(true);
      setSmartAccountAddress(await deriveAddress(stored));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsBusy(false);
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setHasStoredCredential(false);
    setSmartAccountAddress(null);
    setError(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Passkey</CardTitle>
          <CardDescription>
            Create a Rhinestone smart account owned by a device-native WebAuthn
            passkey — Face ID, Touch ID, or Windows Hello. No seed phrases, no
            third-party auth provider. The credential is persisted locally so a
            reload rebuilds the same account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {smartAccountAddress ? (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Smart account address
              </span>
              <code className="break-all text-sm">{smartAccountAddress}</code>
            </div>
          ) : (
            <Button onClick={createPasskeyAccount} disabled={isBusy}>
              {isBusy
                ? hasStoredCredential
                  ? "Restoring..."
                  : "Creating..."
                : "Create passkey account"}
            </Button>
          )}

          {hasStoredCredential ? (
            <Button variant="outline" onClick={reset} disabled={isBusy}>
              Reset
            </Button>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm break-words">{error}</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
