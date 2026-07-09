'use client';

import ContactTurnstile from '@/components/ContactTurnstile';

const honeypotStyle = {
  position: 'absolute',
  left: '-9999px',
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none',
};

export default function FormAntiBotFields({
  honeypotRef,
  turnstileRef,
  setTurnstileToken,
  turnstileConfigured,
}) {
  return (
    <>
      <input
        ref={honeypotRef}
        type="text"
        name="company_website"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        style={honeypotStyle}
      />
      <div className="text-center" style={{ marginBottom: '16px' }}>
        {turnstileConfigured ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ContactTurnstile
              ref={turnstileRef}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>
        ) : (
          <p style={{ color: '#c00', fontSize: '14px', marginBottom: 0 }}>
            Формата временно не приема заявки. Моля обадете се на посочените телефони.
          </p>
        )}
      </div>
    </>
  );
}
