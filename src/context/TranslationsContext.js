'use client';

import { get, ref } from 'firebase/database';
import { createContext, useContext, useEffect, useState } from 'react';
import { rtdb } from '../../lib/firebase';

// Decode key from Firebase
const decodeKey = (encodedKey) => {
  return encodedKey
    .replace(/__RBRACKET__/g, ']')
    .replace(/__LBRACKET__/g, '[')
    .replace(/__SLASH__/g, '/')
    .replace(/__DOLLAR__/g, '$')
    .replace(/__HASH__/g, '#')
    .replace(/__DOT__/g, '.');
};

const TranslationsContext = createContext();

export function useTranslations() {
  return useContext(TranslationsContext);
}

export function TranslationsProvider({ children }) {
  const [translations, setTranslations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTranslations = async () => {
    try {
      const translationsRef = ref(rtdb, 'translations/central-menu');
      const snapshot = await get(translationsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        // Decode all keys in the translations
        const decodedTranslations = {};
        Object.keys(data).forEach(lang => {
          decodedTranslations[lang] = {};
          Object.keys(data[lang]).forEach(encodedKey => {
            const decodedKey = decodeKey(encodedKey);
            decodedTranslations[lang][decodedKey] = data[lang][encodedKey];
          });
        });
        setTranslations(decodedTranslations);
      } else {
        console.log("No translations found.");
        setTranslations({});
      }
    } catch (err) {
      console.error('Error fetching translations:', err);
      setError('Failed to load translations: ' + err.message);
      setTranslations({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  return (
    <TranslationsContext.Provider value={{ translations, error, loading, refetch: fetchTranslations }}>
      {children}
    </TranslationsContext.Provider>
  );
}

