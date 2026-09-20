const COOKIE_NAME = 'rs_unique_visitor';
const COUNTER_KEY = 'rs:homepage:unique-visitors';
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

function cookieValue(header, name) {
  const match = String(header || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function isAutomated(userAgent) {
  return /bot|crawler|spider|slurp|facebookexternalhit|preview|headless|lighthouse/i.test(userAgent || '');
}

async function redis(command, key) {
  const baseUrl = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!baseUrl || !token) throw new Error('Counter storage is not configured');

  const response = await fetch(
    `${baseUrl}/${command}/${encodeURIComponent(key)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    }
  );

  if (!response.ok) throw new Error(`Counter storage returned ${response.status}`);
  const payload = await response.json();
  return Number(payload.result || 0);
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const existingVisitor = cookieValue(request.headers.cookie, COOKIE_NAME);
    const shouldCount = !existingVisitor && !isAutomated(request.headers['user-agent']);
    const count = await redis(shouldCount ? 'incr' : 'get', COUNTER_KEY);

    if (shouldCount) {
      const visitorId = crypto.randomUUID();
      response.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=${encodeURIComponent(visitorId)}; Path=/; Max-Age=${TEN_YEARS}; HttpOnly; Secure; SameSite=Lax`
      );
    }

    return response.status(200).json({ count });
  } catch (error) {
    console.error('visitor counter error', error);
    return response.status(503).json({ error: 'Counter temporarily unavailable' });
  }
}
