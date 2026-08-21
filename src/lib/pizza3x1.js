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

/** Remove XXL size label from flavor names (not from the 3x1 product title). */
export function cleanPizza3x1DisplayName(name) {
  if (!name) return '';
  return String(name)
    .replace(/\s*XXL\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
  const names = buildPizza3x1FlavorNames(flavors);
  if (names.length === 0) return baseName;
  return `${baseName} (${names.join(' / ')})`;
}

export function buildPizza3x1FlavorNames(flavors) {
  return (flavors || [])
    .map((f) => cleanPizza3x1DisplayName(f.name))
    .filter(Boolean);
}

export function buildPizza3x1ItemKey(productId, flavorIds) {
  const sorted = [...(flavorIds || [])].sort().join('_');
  return `${productId}_3x1_${sorted}`;
}

export function formatFlavorNames(flavorNames) {
  if (!Array.isArray(flavorNames) || flavorNames.length === 0) return '';
  return flavorNames
    .map((name) => cleanPizza3x1DisplayName(name))
    .filter(Boolean)
    .join(' / ');
}
