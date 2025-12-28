'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    // Инициализиране на dataLayer и Consent Mode v2
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      
      // Проверяваме дали вече има дадено съгласие
      const consent = localStorage.getItem('cookie-consent');
      const defaultConsent = consent === 'granted' ? 'granted' : 'denied';
      
      // Инициализиране на Consent Mode v2
      window.gtag = window.gtag || function() {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('consent', 'default', {
        'analytics_storage': defaultConsent,
        'ad_storage': defaultConsent,
        'wait_for_update': 500
      });
    }
  }, []);

  if (!gtmId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
}

export function GoogleTagManagerNoscript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

