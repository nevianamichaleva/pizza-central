'use client';

import { validateContactAntiBot } from '@/lib/contactAntiBot';
import { useEffect, useRef, useState } from 'react';
import showAToast from '@/components/common/showAToast';
import { isTurnstileConfigured } from '@/components/ContactTurnstile';

/**
 * Honeypot + timing + Turnstile state за публични форми.
 */
export function useFormAntiBot() {
  const [turnstileToken, setTurnstileToken] = useState(null);
  const formOpenedAtRef = useRef(0);
  const honeypotRef = useRef(null);
  const turnstileRef = useRef(null);

  useEffect(() => {
    formOpenedAtRef.current = Date.now();
  }, []);

  const getAntiBotPayload = () => ({
    hpWebsite: (honeypotRef.current?.value ?? '').trim(),
    formOpenedAt: formOpenedAtRef.current,
  });

  /** @returns {{ ok: true, antiBot: object, turnstileToken: string | null } | { ok: false, honeypot?: boolean }} */
  const validateBeforeSubmit = (options = {}) => {
    if (isTurnstileConfigured() && !turnstileToken) {
      showAToast('error', 'Моля потвърдете, че не сте робот.');
      return { ok: false };
    }

    const antiBot = getAntiBotPayload();

    if (options.turnstileOnly) {
      if (String(antiBot.hpWebsite ?? '').trim() !== '') {
        return { ok: false, honeypot: true };
      }
      return { ok: true, antiBot, turnstileToken };
    }

    const gate = validateContactAntiBot(antiBot);
    if (!gate.ok) {
      if (gate.code === 'honeypot') {
        return { ok: false, honeypot: true };
      }
      if (gate.code === 'fast') {
        showAToast('error', 'Моля изчакайте няколко секунди и опитайте отново.');
      } else if (gate.code === 'stale') {
        showAToast('error', 'Формата е изтекла. Презаредете страницата и опитайте отново.');
      } else {
        showAToast('error', 'Невалидна заявка. Презаредете страницата и опитайте отново.');
      }
      return { ok: false };
    }

    return { ok: true, antiBot, turnstileToken };
  };

  const resetAfterSubmit = () => {
    if (honeypotRef.current) honeypotRef.current.value = '';
    setTurnstileToken(null);
    turnstileRef.current?.reset();
    formOpenedAtRef.current = Date.now();
  };

  const submitBlocked =
    !isTurnstileConfigured() || (isTurnstileConfigured() && !turnstileToken);

  return {
    turnstileToken,
    setTurnstileToken,
    honeypotRef,
    turnstileRef,
    validateBeforeSubmit,
    resetAfterSubmit,
    submitBlocked,
    turnstileConfigured: isTurnstileConfigured(),
  };
}
