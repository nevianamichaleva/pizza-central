export const PIZZA_3X1_MIN_FLAVORS = 2;
export const PIZZA_3X1_MAX_FLAVORS = 3;

/** @deprecated use PIZZA_3X1_MAX_FLAVORS */
export const PIZZA_3X1_FLAVOR_COUNT = PIZZA_3X1_MAX_FLAVORS;

export function isPizza3x1Product(product) {
  return product?.requiresFlavorSelection === true;
}

export function isValidPizza3x1FlavorSelection(flavors) {
  const count = Array.isArray(flavors) ? flavors.length : 0;
  return count >= PIZZA_3X1_MIN_FLAVORS && count <= PIZZA_3X1_MAX_FLAVORS;
}

/** Keep Пица Централ 3х1 products first; preserve relative order otherwise. */
export function sortPizza3x1First(productList) {
  return [...(productList || [])].sort((a, b) => {
    const aFirst = isPizza3x1Product(a) ? 0 : 1;
    const bFirst = isPizza3x1Product(b) ? 0 : 1;
    return aFirst - bFirst;
  });
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
