/** Нормализира дата към DD/MM/YYYY за сравнение (админът ползва DD/MM/YYYY, но записи може да са с единични цифри). */
export function normalizeLaunchMenuDate(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const parts = s.split(/[/.\-]/).map((p) => p.trim());
  if (parts.length !== 3) return s;
  const [d, m, yIn] = parts;
  const dn = parseInt(d, 10);
  const mn = parseInt(m, 10);
  let y = String(yIn).trim();
  if (!Number.isFinite(dn) || !Number.isFinite(mn) || !y) return s;
  if (y.length === 2) y = `20${y}`;
  return `${String(dn).padStart(2, '0')}/${String(mn).padStart(2, '0')}/${y}`;
}

/** DD/MM/YYYY в локална часова зона — като в админа */
export function getTodayLaunchMenuDateString() {
  const today = new Date();
  return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
}

/** За показване: 04.04.2026 */
export function formatMenuDateForDisplay(ddmmyyyy) {
  const n = normalizeLaunchMenuDate(ddmmyyyy);
  const parts = n.split('/');
  if (parts.length !== 3) return ddmmyyyy ? String(ddmmyyyy).trim() : '';
  const [d, m, y] = parts;
  return `${d}.${m}.${y}`;
}

export function findLaunchMenuForDate(data, dateStr) {
  if (!data || !dateStr) return null;
  const target = normalizeLaunchMenuDate(dateStr);
  if (!target) return null;

  for (const menu of Object.values(data)) {
    if (!menu || typeof menu !== 'object' || Array.isArray(menu)) continue;
    if (normalizeLaunchMenuDate(menu.date) === target) return menu;
  }
  return null;
}

export function hasLaunchMenuForToday(data) {
  return findLaunchMenuForDate(data, getTodayLaunchMenuDateString()) != null;
}
