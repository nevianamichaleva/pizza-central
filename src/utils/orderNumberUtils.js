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

/** Timestamp за сортиране по дата (поддържа toLocaleString и DD.MM.YYYY). */
export function parseOrderDateTimestamp(order) {
  if (!order?.order_date) return 0;
  const raw = String(order.order_date).trim();
  if (!raw) return 0;

  const cleaned = raw.replace(/ г\./g, '').replace(/ ч\./g, '').trim();
  const direct = Date.parse(cleaned);
  if (!Number.isNaN(direct)) return direct;

  const datePart = cleaned.includes(',')
    ? cleaned.split(',')[0].trim()
    : cleaned.split(/\s+/)[0].trim();

  const dotMatch = datePart.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (dotMatch) {
    let year = parseInt(dotMatch[3], 10);
    if (year < 100) year += 2000;
    const month = parseInt(dotMatch[2], 10) - 1;
    const day = parseInt(dotMatch[1], 10);
    const timePart = cleaned.includes(',') ? cleaned.split(',')[1]?.trim() : '';
    const timeMatch = timePart?.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const h = timeMatch ? parseInt(timeMatch[1], 10) : 0;
    const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const sec = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    return new Date(year, month, day, h, min, sec).getTime();
  }

  const slashMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let year = parseInt(slashMatch[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(slashMatch[2], 10) - 1, parseInt(slashMatch[1], 10)).getTime();
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











