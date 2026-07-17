import { validateContactAntiBot } from '@/lib/contactAntiBot';
import { getClientIp, verifyTurnstileToken } from '@/lib/verifyTurnstile';

/**
 * @param {{ antiBot?: { hpWebsite?: string, formOpenedAt?: number }, turnstileToken?: string }} payload
 * @param {Request} request
 * @param {{ turnstileOnly?: boolean }} [options] - turnstileOnly: само Turnstile + honeypot (за поръчки, където формата стои отворена дълго)
 * @returns {Promise<
 *   | { ok: true }
 *   | { ok: false, status: number, error?: string, honeypot?: boolean }
 * >}
 */
export async function verifyFormSubmission(
  { antiBot, turnstileToken },
  request,
  options = {}
) {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return { ok: false, status: 503, error: 'Service unavailable' };
  }

  const turnstile = await verifyTurnstileToken(turnstileToken, getClientIp(request));
  if (!turnstile.success) {
    return { ok: false, status: 403, error: 'Bot verification failed' };
  }

  if (options.turnstileOnly) {
    if (String(antiBot?.hpWebsite ?? '').trim() !== '') {
      return { ok: false, status: 200, honeypot: true };
    }
    return { ok: true };
  }

  const botCheck = validateContactAntiBot(antiBot);
  if (!botCheck.ok) {
    if (botCheck.code === 'honeypot') {
      return { ok: false, status: 200, honeypot: true };
    }
    return { ok: false, status: 400, error: 'Invalid request' };
  }

  return { ok: true };
}
