import { NextApiRequest, NextApiResponse } from "next";

const ORCHESTRATOR_URL = "https://v1.orchestrator.rhinestone.dev";

// If dont need any validation, can set this to true
const ALLOW_ALL_CONTRACTS = false;

// Whitelisted contracts when allow all is disabled
const WHITELISTED_CONTRACTS = new Set([
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // Base USDC
  "0x4200000000000000000000000000000000000006", // Weth address
]);

const getApiKey = () => {
  const apiKey = process.env.RHINESTONE_API_KEY;
  if (!apiKey) {
    throw new Error("RHINESTONE_API_KEY is not configured");
  }
  return apiKey;
};

// validate contract addresses in destinationOps
const validateDestinationOps = (body: any): boolean => {
  if (ALLOW_ALL_CONTRACTS) return true;

  const destinationOps =
    body.signedIntentOp?.signedMetadata?.account?.accountContext
      ?.destinationExecutions;

  if (!destinationOps) return true;

  for (const op of destinationOps) {
    const address = op.to?.toLowerCase();
    if (!address || !WHITELISTED_CONTRACTS.has(address)) {
      console.log(`Blocked non-whitelisted contract: ${address}`);
      return false;
    }
  }

  return true;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apiKey = getApiKey();
    const path = (req.query.path as string[]).join("/");
    const targetUrl = new URL(`${ORCHESTRATOR_URL}/${path}`);

    // Copy query parameters
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== "path" && value) {
        targetUrl.searchParams.set(
          key,
          Array.isArray(value) ? value[0] : value
        );
      }
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = JSON.stringify(req.body);
      if (body && body !== "{}") {
        // Validate intent operations
        if (path.includes("intent-operations")) {
          const parsedBody = JSON.parse(body);
          if (!validateDestinationOps(parsedBody)) {
            return res.status(403).json({ error: "Contract not whitelisted" });
          }
        }
        fetchOptions.body = body;
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseBody = await response.text();

    res.status(response.status);
    res.setHeader(
      "Content-Type",
      response.headers.get("Content-Type") || "application/json"
    );
    res.send(responseBody);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Internal proxy error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
