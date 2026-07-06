import { get, ref, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

export const getNextOrderNumber = async () => {
  try {
    // First check if we have a counter in settings
    const counterRef = ref(rtdb, 'settings/orderCounter');
    const counterSnapshot = await get(counterRef);
    
    if (counterSnapshot.exists()) {
      const currentCounter = counterSnapshot.val();
      const nextNumber = currentCounter + 1;
      await set(counterRef, nextNumber);
      return nextNumber;
    }
    
    // If no counter exists, find the highest existing order number
    const ordersRef = ref(rtdb, "orders");
    const snapshot = await get(ordersRef);
    
    let highestNumber = 0;
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ordersArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      
      const existingNumbers = ordersArray
        .filter(order => order.order_number)
        .map(order => parseInt(order.order_number))
        .filter(num => !isNaN(num));
      
      highestNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    }
    
    const nextNumber = highestNumber + 1;
    await set(counterRef, nextNumber);
    return nextNumber;
    
  } catch (error) {
    console.error("Грешка при получаване на следващ номер:", error);
    // Fallback to timestamp-based number
    return Date.now() % 10000; // Last 4 digits of timestamp
  }
};

export const generateOrderNumber = (order) => {
  if (!order) return 'N/A';
  
  // If order already has an order_number, use it
  if (order.order_number) {
    return `ORD-${String(order.order_number).padStart(4, '0')}`;
  }
  
  return 'N/A';
};

/** Числова стойност за сортиране по номер (0 = без номер / чакаща). */
export function getOrderNumberSortValue(order) {
  if (!order?.order_number) return 0;
  const n = parseInt(String(order.order_number).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Формат DD.MM.YYYY HH:mm за запис на дата на поръчка в количката. */
export function formatOrderDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function parseDotDateParts(dayStr, monthStr, yearStr, timePart = '') {
  let year = parseInt(yearStr, 10);
  if (year < 100) year += 2000;
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const timeMatch = timePart?.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const h = timeMatch ? parseInt(timeMatch[1], 10) : 0;
  const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
  const sec = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
  const ts = new Date(year, month, day, h, min, sec).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

/** Timestamp за сортиране/филтриране по дата (DD.MM.YYYY, legacy toLocaleString и др.). */
export function parseOrderDateTimestamp(order) {
  if (!order?.order_date) return 0;
  const raw = String(order.order_date).trim();
  if (!raw) return 0;

  const cleaned = raw.replace(/ г\./g, '').replace(/ ч\./g, '').trim();

  // DD.MM.YYYY [HH:mm[:ss]] – български формат (преди Date.parse, за да не се обърка с MM.DD.YYYY)
  const bgMatch = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?$/);
  if (bgMatch) {
    return parseDotDateParts(bgMatch[1], bgMatch[2], bgMatch[3], bgMatch[4] || '');
  }

  // Legacy: "DD.MM.YYYY, HH:mm:ss"
  if (cleaned.includes(',')) {
    const [datePart, timePart] = cleaned.split(',').map((s) => s.trim());
    const dotMatch = datePart.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
    if (dotMatch) {
      return parseDotDateParts(dotMatch[1], dotMatch[2], dotMatch[3], timePart);
    }
  }

  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slashMatch) {
    return parseDotDateParts(slashMatch[1], slashMatch[2], slashMatch[3]);
  }

  // ISO и други стандартни формати – не dot-separated (те се объркват като MM.DD.YYYY)
  if (!/^\d{1,2}\.\d{1,2}\./.test(cleaned)) {
    const direct = Date.parse(cleaned);
    if (!Number.isNaN(direct)) return direct;
  }

  const fallback = new Date(order.order_date).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

export function compareOrdersByDate(a, b, direction = 'desc') {
  const diff = parseOrderDateTimestamp(a) - parseOrderDateTimestamp(b);
  if (diff !== 0) return direction === 'desc' ? -diff : diff;
  return b.id.localeCompare(a.id);
}

export function compareOrdersByNumber(a, b, direction = 'desc') {
  const diff = getOrderNumberSortValue(a) - getOrderNumberSortValue(b);
  if (diff !== 0) return direction === 'desc' ? -diff : diff;
  return compareOrdersByDate(a, b, direction);
}











