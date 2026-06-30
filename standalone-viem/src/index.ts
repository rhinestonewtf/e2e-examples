import { RhinestoneSDK } from "@rhinestone/sdk";
import { privateKeyToAccount } from "viem/accounts";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const apiKey = requireEnv("RHINESTONE_API_KEY");
  const privateKey = requireEnv("PRIVATE_KEY") as `0x${string}`;

  // A viem LocalAccount is a valid ECDSA owner on its own — no wallet client
  // or auth provider needed.
  const owner = privateKeyToAccount(privateKey);

  // Server-side script: talk to the orchestrator directly with the API key.
  // No proxy server is involved (unlike the browser examples).
  const rhinestone = new RhinestoneSDK({
    auth: { mode: "apiKey", apiKey },
  });

  const account = await rhinestone.createAccount({
    owners: {
      type: "ecdsa",
      accounts: [owner],
    },
  });

  console.log("Owner (EOA):     ", owner.address);
  console.log("Smart account:   ", account.getAddress());

  const portfolio = await account.getPortfolio();
  console.log("Portfolio:");
  console.log(JSON.stringify(portfolio, bigintReplacer, 2));

  // --- Optional: cross-chain USDC transfer ---------------------------------
  // Uncomment to move USDC to a recipient. The SDK sources funds from any
  // supported chain and settles on the target chain in one intent.
  //
  // import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
  // import { arbitrum, base } from "viem/chains";
  //
  // const recipient = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as const;
  // const amount = parseUnits("1", 6); // 1 USDC (6 decimals)
  //
  // const prepared = await account.prepareTransaction({
  //   sourceChains: [base],
  //   targetChain: arbitrum,
  //   calls: [
  //     {
  //       to: "USDC",
  //       value: 0n,
  //       data: encodeFunctionData({
  //         abi: erc20Abi,
  //         functionName: "transfer",
  //         args: [recipient, amount],
  //       }),
  //     },
  //   ],
  //   tokenRequests: [{ address: "USDC", amount }],
  // });
  // const signed = await account.signTransaction(prepared);
  // const submitted = await account.submitTransaction(signed);
  // const result = await account.waitForExecution(submitted);
  // console.log("Transfer result:", result);
}

// Portfolio values include bigints, which JSON.stringify can't serialize.
function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
