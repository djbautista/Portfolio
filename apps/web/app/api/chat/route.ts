// Same-origin proxy to apps/api's /chat endpoint.
// Intentionally dumb: no auth, no transformation, no business logic.
// Keeps the browser same-origin (no CORS) and hides the Fastify origin from clients.

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
    });
  } catch (error) {
    console.error('[api/chat] upstream fetch failed', error);
    return Response.json(
      {
        code: 'internal_error',
        message: 'Failed to reach the agent service.',
      },
      { status: 502 },
    );
  }

  const responseBody = await upstreamResponse.text();
  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: { 'content-type': 'application/json' },
  });
}
