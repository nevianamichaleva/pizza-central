import { findLaunchMenuForDate, getTodayLaunchMenuDateStringEuropeSofia } from './launchMenuToday';

const DEFAULT_RTDB_BASE =
  'https://central-4afa2-default-rtdb.europe-west1.firebasedatabase.app';

function launchMenuJsonUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const base = (fromEnv || DEFAULT_RTDB_BASE).replace(/\/$/, '');
  return `${base}/launch-menu.json`;
}

/**
 * Абсолютен HTTPS URL за og:image (Facebook и др.).
 * @param {string} imageUrl
 * @param {string} siteBase — без накраен слэш, напр. https://www.pizza-central.bg
 */
export function absolutizeOgImageUrl(imageUrl, siteBase) {
  const u = String(imageUrl ?? '').trim();
  if (!u) return null;
  if (/^https:\/\//i.test(u)) return u;
  if (/^http:\/\//i.test(u)) return u.replace(/^http:\/\//i, 'https://');
  if (u.startsWith('//')) return `https:${u}`;
  const base = String(siteBase).replace(/\/$/, '');
  if (u.startsWith('/')) return `${base}${u}`;
  return u;
}

/**
 * Връща raw image URL от Firebase за днешната дата (Europe/Sofia), или null.
 */
export async function fetchTodayLaunchMenuImageRawUrl() {
  try {
    const res = await fetch(launchMenuJsonUrl(), {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;
    const today = getTodayLaunchMenuDateStringEuropeSofia();
    const menu = findLaunchMenuForDate(data, today);
    if (!menu) return null;
    const img = menu.image != null ? String(menu.image).trim() : '';
    return img || null;
  } catch {
    return null;
  }
}
