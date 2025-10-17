import { NextRequest, NextResponse } from "next/server";

// The actual orchestrator URL - this is kept on the server side
const ORCHESTRATOR_URL = "https://v1.orchestrator.rhinestone.dev";

// Get the API key from server-side environment variable
const getApiKey = () => {
  const apiKey = process.env.RHINESTONE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RHINESTONE_API_KEY is not configured on the server. Please set it in your environment variables."
    );
  }
  return apiKey;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] }
) {
  try {
    // Get the API key from server environment
    const apiKey = getApiKey();

    // Reconstruct the path from the catch-all route
    const path = params.path.join("/");

    // Build the target URL with query parameters
    const url = new URL(request.url);
    const targetUrl = new URL(`${ORCHESTRATOR_URL}/${path}`);
    targetUrl.search = url.search;

    // Prepare headers for the orchestrator request
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };

    // Copy other relevant headers from the original request
    const forwardHeaders = ["user-agent", "accept", "accept-language"];
    forwardHeaders.forEach((headerName) => {
      const value = request.headers.get(headerName);
      if (value) {
        headers[headerName] = value;
      }
    });

    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // For POST, PUT, etc., include the body
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch (error) {
        console.error("Error reading request body:", error);
      }
    }

    // Forward the request to the actual orchestrator
    const response = await fetch(targetUrl.toString(), fetchOptions);

    // Get the response body
    const responseBody = await response.text();

    // Forward the orchestrator's response back to the client
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        // Forward retry-after header if present (for rate limiting)
        ...(response.headers.get("retry-after")
          ? { "retry-after": response.headers.get("retry-after")! }
          : {}),
      },
    });
  } catch (error) {
    console.error("Orchestrator proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal proxy error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

