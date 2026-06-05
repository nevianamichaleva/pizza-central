export const ORDER_AVAILABILITY_MODES = {
  NORMAL: 'normal',
  DISABLED: 'disabled',
  PICKUP_ONLY: 'pickup_only',
};

export const DEFAULT_ORDER_AVAILABILITY = {
  mode: ORDER_AVAILABILITY_MODES.NORMAL,
};

export const ORDER_AVAILABILITY_MESSAGES = {
  [ORDER_AVAILABILITY_MODES.DISABLED]:
    '🚧 Онлайн поръчките са временно недостъпни. Моля, опитайте отново по-късно или се свържете с нас на +359 895 516 401.',
  [ORDER_AVAILABILITY_MODES.PICKUP_ONLY]:
    '🚚 Днес не предлагаме доставка до адрес. Поръчките се получават на място в ресторанта.',
};

export function normalizeOrderAvailability(data) {
  const mode = data?.mode;
  if (mode === ORDER_AVAILABILITY_MODES.DISABLED || mode === ORDER_AVAILABILITY_MODES.PICKUP_ONLY) {
    return { mode };
  }
  return { ...DEFAULT_ORDER_AVAILABILITY };
}

export function getOrderAvailabilityMessage(mode) {
  return ORDER_AVAILABILITY_MESSAGES[mode] || null;
}

export function isOrderSubmissionBlocked(mode) {
  return mode === ORDER_AVAILABILITY_MODES.DISABLED;
}

export function isDeliveryBlocked(mode) {
  return mode === ORDER_AVAILABILITY_MODES.DISABLED || mode === ORDER_AVAILABILITY_MODES.PICKUP_ONLY;
}
