"use client";

import { RhinestoneSDK } from "@rhinestone/sdk";
import type { Session } from "@rhinestone/sdk";
import { experimental_enableSession } from "@rhinestone/sdk/actions/smart-sessions";
import { toSession } from "@rhinestone/sdk/smart-sessions";
import { useRef, useState } from "react";
import {
  type Address,
  encodeFunctionData,
  erc20Abi,
  parseUnits,
} from "viem";
import {
  generatePrivateKey,
  type PrivateKeyAccount,
  privateKeyToAccount,
} from "viem/accounts";
import { base } from "viem/chains";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// USDC on Base. The session below scopes the app to USDC transfers only.
const USDC_ADDRESS: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
// Demo recipient (vitalik.eth). The session caps total spend at the limit below.
const RECIPIENT: Address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const SPENDING_LIMIT_USDC = "100";
const TRANSFER_AMOUNT_USDC = "10";

// localStorage keys for the demo owner + session private keys. In production the
// owner is a real user wallet and the session key lives in a KMS/secrets manager.
const OWNER_STORAGE_KEY = "session-keys-demo-owner-pk";
const SESSION_STORAGE_KEY = "session-keys-demo-session-pk";

// The orchestrator API key stays server-side; requests are proxied through
// /api/orchestrator (see src/app/api/orchestrator/[...path]).
function getSDK() {
  const baseUrl = window.location.origin;
  return new RhinestoneSDK({
    auth: { mode: "apiKey", apiKey: "proxy" },
    endpointUrl: `${baseUrl}/api/orchestrator`,
  });
}

// Load or generate a persisted demo private key.
function loadOrCreateKey(storageKey: string): PrivateKeyAccount {
  let pk = localStorage.getItem(storageKey);
  if (!pk) {
    pk = generatePrivateKey();
    localStorage.setItem(storageKey, pk);
  }
  return privateKeyToAccount(pk as `0x${string}`);
}

// Define the scoped session: USDC transfers only, capped at the spending limit.
// The installed SDK types expose the spending limit declaratively on the
// transfer config (`spendingLimit: { token, amount }`), which the SDK expands
// into a spending-limits policy under the hood.
function buildSession(sessionOwner: PrivateKeyAccount): Session {
  return toSession({
    chain: base,
    owners: {
      type: "ecdsa",
      accounts: [sessionOwner],
    },
    permissions: [
      {
        abi: erc20Abi,
        address: USDC_ADDRESS,
        functions: {
          transfer: {
            spendingLimit: {
              token: USDC_ADDRESS,
              amount: parseUnits(SPENDING_LIMIT_USDC, 6),
            },
          },
        },
      },
    ],
  });
}

export default function Home() {
  const [accountAddress, setAccountAddress] = useState<Address | null>(null);
  const [sessionEnabled, setSessionEnabled] = useState(false);
  const [busy, setBusy] = useState<"approve" | "execute" | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // The resolved session is shared between the approve and execute steps.
  const sessionRef = useRef<Session | null>(null);

  function append(line: string) {
    setLog((prev) => [...prev, line]);
  }

  // Step 1: the one-time owner approval. Creates the account with sessions
  // enabled, defines the scoped session, and the owner signs to enable it.
  async function approveSession() {
    setBusy("approve");
    setError(null);
    try {
      const rhinestone = getSDK();

      const ownerAccount = loadOrCreateKey(OWNER_STORAGE_KEY);
      const sessionOwnerAccount = loadOrCreateKey(SESSION_STORAGE_KEY);
      append(`Owner (demo): ${ownerAccount.address}`);
      append(`Session key: ${sessionOwnerAccount.address}`);

      // Create the account with the Smart Sessions module enabled.
      const account = await rhinestone.createAccount({
        owners: {
          type: "ecdsa",
          accounts: [ownerAccount],
        },
        experimental_sessions: { enabled: true },
      });
      const address = account.getAddress();
      setAccountAddress(address);
      append(`Smart account: ${address}`);

      // Define + resolve the scoped session.
      const session = buildSession(sessionOwnerAccount);
      sessionRef.current = session;
      append(
        `Session scoped to USDC transfers, limit ${SPENDING_LIMIT_USDC} USDC`,
      );

      // The owner signs once to enable the session — the only user prompt.
      const sessionDetails = await account.experimental_getSessionDetails([
        session,
      ]);
      const enableSignature =
        await account.experimental_signEnableSession(sessionDetails);
      append("Owner approved the session.");

      const transaction = await account.prepareTransaction({
        chain: base,
        calls: [
          experimental_enableSession(
            session,
            enableSignature,
            sessionDetails.hashesAndChainIds,
            0,
          ),
        ],
      });
      const signed = await account.signTransaction(transaction);
      const result = await account.submitTransaction(signed);
      append("Enabling session on-chain...");
      await account.waitForExecution(result);

      setSessionEnabled(true);
      append("Session enabled. The app can now transact within the limit.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve session");
    } finally {
      setBusy(null);
    }
  }

  // Step 2: execute a USDC transfer signed by the SESSION key — no owner prompt.
  async function executeWithSession() {
    const session = sessionRef.current;
    if (!session) return;

    setBusy("execute");
    setError(null);
    try {
      const rhinestone = getSDK();
      const ownerAccount = loadOrCreateKey(OWNER_STORAGE_KEY);

      // Re-hydrate the same account; the session is already enabled on-chain.
      const account = await rhinestone.createAccount({
        owners: {
          type: "ecdsa",
          accounts: [ownerAccount],
        },
        experimental_sessions: { enabled: true },
      });

      const amount = parseUnits(TRANSFER_AMOUNT_USDC, 6);
      const prepared = await account.prepareTransaction({
        chain: base,
        calls: [
          {
            to: USDC_ADDRESS,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [RECIPIENT, amount],
            }),
          },
        ],
        // The session key signs instead of the owner.
        signers: {
          type: "experimental_session",
          session,
        },
      });
      const signed = await account.signTransaction(prepared);
      const result = await account.submitTransaction(signed);
      append(`Transferring ${TRANSFER_AMOUNT_USDC} USDC (session-signed)...`);

      const status = await account.waitForExecution(result);
      append(`Executed without user prompt. Status: ${JSON.stringify(status)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to execute transfer",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Session keys</CardTitle>
          <CardDescription>
            One-click UX with smart sessions. Approve once, then the app executes
            USDC transfers on Base within a scoped {SPENDING_LIMIT_USDC} USDC
            spending limit — no per-transaction prompt. The owner and session keys
            here are demo keys stored in localStorage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={approveSession} disabled={busy !== null}>
            {busy === "approve"
              ? "Approving..."
              : sessionEnabled
                ? "Re-approve session"
                : "1. Approve session"}
          </Button>

          <Button
            variant="outline"
            onClick={executeWithSession}
            disabled={busy !== null || !sessionEnabled}
          >
            {busy === "execute"
              ? "Executing..."
              : `2. Execute ${TRANSFER_AMOUNT_USDC} USDC transfer with session key`}
          </Button>

          {accountAddress ? (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Smart account
              </span>
              <code className="break-all text-sm">{accountAddress}</code>
            </div>
          ) : null}

          {log.length > 0 ? (
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-muted-foreground text-xs">Status</span>
              <div className="flex flex-col gap-1 font-mono text-xs">
                {log.map((line, i) => (
                  <span key={i} className="break-all">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm break-words">{error}</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
