// Same-origin proxy to apps/api's /chat endpoint.
// Intentionally dumb: no auth, no transformation, no business logic.
// Keeps the browser same-origin (no CORS) and hides the Fastify origin from clients.

// Upstream timeout: long enough to cover model-call latency on apps/api,
// short enough that a hung agent doesn't tie up a Next.js worker indefinitely.
const UPSTREAM_TIMEOUT_MS = 30_000;

export async function POST(request: Request) {
  const upstream = process.env.AGENT_API_URL;
  if (!upstream) {
    console.error(
      '[api/chat] AGENT_API_URL is not set; refusing to forward request',
    );
    return Response.json(
      {
        code: 'internal_error',
        message: 'Agent API is not configured on the server.',
      },
      { status: 500 },
    );
  }

  const body = await request.text();

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${upstream}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout =
      error instanceof DOMException && error.name === 'TimeoutError';
    console.error(
      `[api/chat] upstream fetch ${isTimeout ? 'timed out' : 'failed'}`,
      error,
    );
    return Response.json(
      {
        code: 'internal_error',
        message: isTimeout
          ? 'Agent service did not respond in time.'
          : 'Failed to reach the agent service.',
      },
      { status: isTimeout ? 504 : 502 },
    );
  }

  const responseBody = await upstreamResponse.text();
  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: { 'content-type': 'application/json' },
  });
}
