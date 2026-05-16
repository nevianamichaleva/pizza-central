const SOFIA_TZ = 'Europe/Sofia';
const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const OBEDNO_MENU_START = { hour: 11, minute: 0 };
export const OBEDNO_MENU_END = { hour: 15, minute: 30 };
export const OBEDNO_SCHEDULE_FIELD = 'weekday-lunch';

/** Категория с ограничен график (поле schedule, slug или име). */
export function categoryUsesObednoSchedule(category) {
  if (!category) return false;
  if (category.schedule === OBEDNO_SCHEDULE_FIELD || category.lunchMenuSchedule === true) {
    return true;
  }
  const slug = category.slug != null ? String(category.slug).trim().toLowerCase() : '';
  if (slug && (slug.includes('obedno') || slug.includes('obedno-menu') || slug === 'launch')) {
    return true;
  }
  const name = category.name != null ? String(category.name).trim().toLowerCase() : '';
  return name.includes('обедно');
}

export function productBelongsToCategory(product, categoryId) {
  if (!product || !categoryId) return false;
  if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories.includes(categoryId);
  }
  return product.category === categoryId;
}

export function productBelongsToObednoCategory(product, categories) {
  if (!product || !Array.isArray(categories)) return false;
  return categories.some(
    (cat) => categoryUsesObednoSchedule(cat) && productBelongsToCategory(product, cat.id),
  );
}

function getSofiaTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: SOFIA_TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    weekday: map.weekday,
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
  };
}

function isTimeWithinObednoWindow(hour, minute) {
  const startMins = OBEDNO_MENU_START.hour * 60 + OBEDNO_MENU_START.minute;
  const endMins = OBEDNO_MENU_END.hour * 60 + OBEDNO_MENU_END.minute;
  const nowMins = hour * 60 + minute;
  return nowMins >= startMins && nowMins <= endMins;
}

function isObednoMenuTestOverrideEnabled() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_OBEDNO_MENU_ALWAYS_OPEN === 'true') {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem('obednoMenuTestOpen') === '1';
    } catch {
      return false;
    }
  }
  return false;
}

/** Понеделник–петък, 11:00–15:30, часова зона Europe/Sofia. */
export function isObednoMenuOrderingOpen(date = new Date()) {
  if (isObednoMenuTestOverrideEnabled()) return true;
  const { weekday, hour, minute } = getSofiaTimeParts(date);
  if (!WEEKDAY_SHORT.includes(weekday)) return false;
  return isTimeWithinObednoWindow(hour, minute);
}

export function getObednoMenuHoursLabel() {
  return '11:00 – 15:30, понеделник – петък';
}

export function getObednoMenuClosedMessage() {
  return `Обедното меню е достъпно за поръчка само в ${getObednoMenuHoursLabel()}.`;
}

export function canOrderObednoProduct(product, categories, isOpen = isObednoMenuOrderingOpen()) {
  if (!productBelongsToObednoCategory(product, categories)) return true;
  return isOpen;
}

/** Видима в менюто за доставка (for-home), с отчитане на графика. */
export function isCategoryVisibleInDeliveryMenu(category, isOpen = isObednoMenuOrderingOpen()) {
  if (!category) return false;
  const hasDeliveryField = category.forDelivery !== undefined && category.forDelivery !== null;
  const hasRestaurantField = category.forRestaurant !== undefined && category.forRestaurant !== null;
  let passesMenu = false;
  if (!hasDeliveryField && !hasRestaurantField) {
    passesMenu = true;
  } else {
    passesMenu = category.forDelivery === true;
  }
  if (!passesMenu) return false;
  if (categoryUsesObednoSchedule(category) && !isOpen) return false;
  return true;
}

export function filterDeliveryCategories(categories, isOpen = isObednoMenuOrderingOpen()) {
  return (categories || [])
    .filter((cat) => isCategoryVisibleInDeliveryMenu(cat, isOpen))
    .sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });
}

export function isProductVisibleInDeliverySearch(product, categories, isOpen = isObednoMenuOrderingOpen()) {
  if (!product || product.isSideDish) return false;
  const hasDeliveryField = product.forDelivery !== undefined && product.forDelivery !== null;
  const hasRestaurantField = product.forRestaurant !== undefined && product.forRestaurant !== null;
  let passesMenu = false;
  if (!hasDeliveryField && !hasRestaurantField) {
    passesMenu = true;
  } else {
    passesMenu = product.forDelivery === true;
  }
  if (!passesMenu) return false;
  if (productBelongsToObednoCategory(product, categories) && !isOpen) return false;
  return true;
}

/** Поръчка с обедни артикули извън графика. */
export function orderContainsUnavailableObednoItems(orderItems, products, categories, isOpen = isObednoMenuOrderingOpen()) {
  if (isOpen || !orderItems || typeof orderItems !== 'object') return false;
  const productList = Array.isArray(products) ? products : [];
  return Object.values(orderItems).some((item) => {
    if (!item || item.isPackaging) return false;
    const productId = item.productId;
    if (!productId) return false;
    const product = productList.find((p) => p.id === productId);
    return product && productBelongsToObednoCategory(product, categories);
  });
}
