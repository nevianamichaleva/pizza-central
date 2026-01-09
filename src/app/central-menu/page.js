'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Supported languages for QR code redirect
const supportedLanguages = ['bg', 'en', 'de', 'ro'];

export default function CentralMenuRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Detect browser language
    const detectLanguage = () => {
      // Get browser language (primary)
      const browserLang = navigator.language || navigator.userLanguage;
      
      // Extract language code (e.g., 'bg' from 'bg-BG' or 'bg')
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Check if language is supported
      if (supportedLanguages.includes(langCode)) {
        return langCode;
      }
      
      // Check all preferred languages
      if (navigator.languages) {
        for (const lang of navigator.languages) {
          const code = lang.split('-')[0].toLowerCase();
          if (supportedLanguages.includes(code)) {
            return code;
          }
        }
      }
      
      // Default to English if no match
      return 'en';
    };

    const detectedLang = detectLanguage();
    router.replace(`/${detectedLang}/central-menu`);
  }, [router]);

  // Show loading state while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      Зареждане...
    </div>
  );
}

