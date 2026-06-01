/** Нормализира ключ за търсене в central-menu.json (интервали, нови редове). */
export function normalizeTranslationKey(key) {
  if (key == null) return '';
  return String(key)
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Превод от locales/central-menu.json с fallback при леко различен текст от Firebase.
 */
export function translateCentralMenu(key, lang, translations) {
  if (key == null || key === '') return key;
  if (lang === 'bg') return key;

  const dict = translations?.[lang];
  if (!dict || typeof dict !== 'object') return key;

  if (dict[key]) return dict[key];

  const normalized = normalizeTranslationKey(key);
  if (dict[normalized]) return dict[normalized];

  for (const [dictKey, value] of Object.entries(dict)) {
    if (normalizeTranslationKey(dictKey) === normalized) return value;
  }

  return key;
}
