const BRAND = 'Ресторант-пицария Централ';

/**
 * Document title for the root template `%s | Ресторант-пицария Централ Добрич`.
 * A trailing brand suffix is removed so the template adds it once.
 * If the remaining text already names the restaurant, the template is skipped.
 */
export function documentTitle(raw) {
  const text = String(raw || '')
    .replace(/\s*[|\-–]\s*Ресторант-пицария Централ(?: Добрич)?\s*$/i, '')
    .trim();

  if (!text) {
    return { absolute: `${BRAND} Добрич` };
  }

  if (text.toLowerCase().includes(BRAND.toLowerCase())) {
    return { absolute: text };
  }

  return text;
}
