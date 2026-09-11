import { increment, ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { getEuropeSofiaIsoDateString } from './launchMenuToday';

const PAGE_LABELS = {
  '/': 'Начална страница',
  '/order': 'Количка / Поръчка',
  '/obedno-menu': 'Обедно меню',
  '/reservation': 'Резервация',
  '/contact': 'Контакти',
  '/about-us': 'За нас',
  '/for-home': 'За вкъщи',
  '/central-menu': 'Меню',
  '/catering': 'Кетъринг',
  '/blog': 'Блог',
  '/login': 'Вход',
  '/signup': 'Регистрация',
  '/profile': 'Профил',
};

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function normalizePageViewPath(pathname) {
  if (!pathname) return '';
  const pathOnly = String(pathname).split('?')[0].split('#')[0];
  const trimmed = pathOnly.replace(/\/+$/, '') || '/';
  if (trimmed === '/') return '_root_';
  return trimmed.replace(/^\//, '').replace(/\//g, '_');
}

export function pageViewPathToUrl(pagePath) {
  if (!pagePath || pagePath === '_root_') return '/';
  return `/${String(pagePath).replace(/_/g, '/')}`;
}

export function formatPageViewLabel(urlPath) {
  if (!urlPath || urlPath === '/') return PAGE_LABELS['/'];
  if (PAGE_LABELS[urlPath]) return `${PAGE_LABELS[urlPath]} (${urlPath})`;
  return urlPath;
}

export async function trackPageView(pathname) {
  if (typeof window === 'undefined') return;
  if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

  const today = getEuropeSofiaIsoDateString() || new Date().toISOString().split('T')[0];
  const normalizedPath = normalizePageViewPath(pathname);
  if (!normalizedPath) return;

  const storage = getSessionStorage();
  const storageKey = `page_view_${today}_${normalizedPath}`;
  try {
    if (storage?.getItem(storageKey)) return;
    storage?.setItem(storageKey, '1');
  } catch {
    // Private mode / blocked storage — still try to record the visit
  }

  try {
    await update(ref(rtdb, `page_views/${today}`), {
      [normalizedPath]: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing page view count:', error);
    try {
      storage?.removeItem(storageKey);
    } catch {
      // ignore
    }
  }
}
