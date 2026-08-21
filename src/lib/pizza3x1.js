export const PIZZA_3X1_FLAVOR_COUNT = 3;

export function isPizza3x1Product(product) {
  return product?.requiresFlavorSelection === true;
}

export function getPizza3x1FlavorOptions(products) {
  return (products || [])
    .filter(
      (p) =>
        p.participatesIn3x1 === true &&
        !p.requiresFlavorSelection &&
        !p.isSideDish
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'bg'));
}

/** Sum of 1/3 of each selected large pizza price. */
export function calculatePizza3x1BasePrice(flavors) {
  const sum = (flavors || []).reduce((total, flavor) => {
    const price = parseFloat(flavor?.price);
    if (!Number.isFinite(price)) return total;
    return total + price / 3;
  }, 0);
  return Math.round(sum * 100) / 100;
}

export function buildPizza3x1ItemName(baseName, flavors) {
  const names = (flavors || []).map((f) => f.name).filter(Boolean);
  if (names.length === 0) return baseName;
  return `${baseName} (${names.join(' / ')})`;
}

export function buildPizza3x1ItemKey(productId, flavorIds) {
  const sorted = [...(flavorIds || [])].sort().join('_');
  return `${productId}_3x1_${sorted}`;
}

export function formatFlavorNames(flavorNames) {
  if (!Array.isArray(flavorNames) || flavorNames.length === 0) return '';
  return flavorNames.join(' / ');
}
