/** Минимално време от отваряне на формата до изпращане (мс). */
export const CONTACT_ANTIBOT_MIN_MS = 3500;

/** Макс. време от отваряне на формата (мс) — избягва стари/фалшиви timestamp-и. */
export const CONTACT_ANTIBOT_MAX_AGE_MS = 45 * 60 * 1000;

/**
 * @param {{ hpWebsite?: string, formOpenedAt?: number } | null | undefined} antiBot
 * @param {number} [now]
 * @returns {{ ok: true } | { ok: false, code: 'missing' | 'honeypot' | 'clock' | 'fast' | 'stale' }}
 */
export function validateContactAntiBot(antiBot, now = Date.now()) {
  if (
    !antiBot ||
    typeof antiBot.formOpenedAt !== 'number' ||
    !Number.isFinite(antiBot.formOpenedAt)
  ) {
    return { ok: false, code: 'missing' };
  }
  if (String(antiBot.hpWebsite ?? '').trim() !== '') {
    return { ok: false, code: 'honeypot' };
  }
  if (antiBot.formOpenedAt > now + 2000) {
    return { ok: false, code: 'clock' };
  }
  const elapsed = now - antiBot.formOpenedAt;
  if (elapsed < CONTACT_ANTIBOT_MIN_MS) {
    return { ok: false, code: 'fast' };
  }
  if (elapsed > CONTACT_ANTIBOT_MAX_AGE_MS) {
    return { ok: false, code: 'stale' };
  }
  return { ok: true };
}
