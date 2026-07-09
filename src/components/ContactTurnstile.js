'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { forwardRef } from 'react';

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export function isTurnstileConfigured() {
  return Boolean(TURNSTILE_SITE_KEY);
}

const ContactTurnstile = forwardRef(function ContactTurnstile(
  { onSuccess, onExpire, onError },
  ref
) {
  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return (
    <Turnstile
      ref={ref}
      siteKey={TURNSTILE_SITE_KEY}
      onSuccess={onSuccess}
      onExpire={onExpire}
      onError={onError}
      options={{ theme: 'light', language: 'bg' }}
    />
  );
});

export default ContactTurnstile;
