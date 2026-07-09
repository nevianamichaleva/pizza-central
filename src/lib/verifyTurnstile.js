/**
 * Проверка на Cloudflare Turnstile токен (сървърна страна).
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstileToken(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return { success: false, error: 'not_configured' };
  }
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'missing_token' };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteip) {
    body.append('remoteip', remoteip);
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    return { success: Boolean(data.success), ...data };
  } catch (err) {
    console.error('Turnstile verification request failed:', err);
    return { success: false, error: 'request_failed' };
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '';
}
