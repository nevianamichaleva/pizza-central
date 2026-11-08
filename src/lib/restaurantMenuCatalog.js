import { drinkCategories, formatDrinkPriceRange, getDrinkText } from '@/data/centralMenuDrinks';
import { get, ref } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

const EUR_RATE = 1.95583;

function capitalize(name) {
  const text = String(name || '').trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function productBelongsToCategory(product, categoryId) {
  if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories.includes(categoryId);
  }
  return product.category === categoryId;
}

function isRestaurantCategory(category) {
  if (!category || category.status === 'archived') return false;
  const hasDeliveryField = category.forDelivery !== undefined && category.forDelivery !== null;
  const hasRestaurantField = category.forRestaurant !== undefined && category.forRestaurant !== null;
  if (!hasDeliveryField && !hasRestaurantField) return true;
  if (hasRestaurantField) return category.forRestaurant === true;
  return category.forDelivery !== true;
}

function isRestaurantProduct(product, category) {
  if (!product || product.status === 'archived' || !String(product.name || '').trim()) return false;
  const isGarnituri = category?.name === 'Гарнитури';
  if (!isGarnituri && product.isSideDish) return false;

  const hasDeliveryField = product.forDelivery !== undefined && product.forDelivery !== null;
  const hasRestaurantField = product.forRestaurant !== undefined && product.forRestaurant !== null;
  if (!hasDeliveryField && !hasRestaurantField) return true;
  if (hasRestaurantField) return product.forRestaurant === true;
  return product.forDelivery !== true;
}

function formatBgnPrice(rawPrice) {
  if (rawPrice === undefined || rawPrice === null || rawPrice === '') return '';
  const cleaned = String(rawPrice).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return '';
  return `${(parsed / EUR_RATE).toFixed(2)} €`;
}

function dishFromProduct(product) {
  const slug = product.slug && String(product.slug).trim() && !product.isSideDish
    ? String(product.slug).trim()
    : '';
  return {
    id: product.id,
    name: String(product.name).trim(),
    slug,
    price: formatBgnPrice(product.price),
  };
}

function organizeCategories(data) {
  const result = {};
  for (const key of Object.keys(data)) {
    result[key] = { id: key, ...data[key], children: [] };
  }

  for (const key of Object.keys(result)) {
    const item = result[key];
    if (item.parent && result[item.parent]) {
      result[item.parent].children.push(item);
    }
  }

  for (const key of Object.keys(result)) {
    if (result[key].children.length > 0) {
      result[key].children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }

  const roots = [];
  for (const key of Object.keys(result)) {
    const item = result[key];
    if (item.parent) continue;
    if (item.children.length === 0) delete item.children;
    roots.push(item);
  }

  roots.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return roots;
}

function drinkGroups(category) {
  const groups = [];

  (category.subcategories || []).forEach((subcategory, index) => {
    const dishes = (subcategory.items || [])
      .map((item, itemIndex) => ({
        id: `${category.id}-${index}-${itemIndex}`,
        name: getDrinkText(item.name, 'bg'),
        slug: '',
        price: formatDrinkPriceRange(item.price, item.priceSecondary) || '',
      }))
      .filter((dish) => dish.name);
    if (dishes.length) {
      groups.push({
        id: `${category.id}-sub-${index}`,
        name: getDrinkText(subcategory.name, 'bg'),
        dishes,
      });
    }
  });

  const ownDishes = (category.items || [])
    .map((item, itemIndex) => ({
      id: `${category.id}-item-${itemIndex}`,
      name: getDrinkText(item.name, 'bg'),
      slug: '',
      price: formatDrinkPriceRange(item.price, item.priceSecondary) || '',
    }))
    .filter((dish) => dish.name);
  if (ownDishes.length) {
    groups.push({ id: `${category.id}-items`, name: '', dishes: ownDishes });
  }

  return groups;
}

function drinkCatalog() {
  return drinkCategories
    .map((category) => {
      const groups = drinkGroups(category);
      if (!groups.length) return null;
      return {
        id: category.id,
        name: getDrinkText(category.name, 'bg'),
        groups,
      };
    })
    .filter(Boolean);
}

function foodCatalog(categories, products) {
  return categories
    .filter(isRestaurantCategory)
    .map((category) => {
      const groups = [];

      if (category.children?.length) {
        category.children.forEach((child) => {
          const dishes = products
            .filter((item) => {
              if (!productBelongsToCategory(item, category.id)) return false;
              if (item?.subcategory != child.id) return false;
              return isRestaurantProduct(item, category);
            })
            .map(dishFromProduct);
          if (dishes.length) {
            groups.push({ id: child.id, name: capitalize(child.name), dishes });
          }
        });
      } else {
        const dishes = products
          .filter((item) => productBelongsToCategory(item, category.id) && isRestaurantProduct(item, category))
          .map(dishFromProduct);
        if (dishes.length) {
          groups.push({ id: `${category.id}-items`, name: '', dishes });
        }
      }

      if (!groups.length) return null;
      return { id: category.id, name: capitalize(category.name), groups };
    })
    .filter(Boolean);
}

export async function getRestaurantMenuCatalog() {
  const drinks = drinkCatalog();

  try {
    const [productsSnap, categoriesSnap] = await Promise.all([
      get(ref(rtdb, 'products')),
      get(ref(rtdb, 'category')),
    ]);

    const products = productsSnap.exists()
      ? Object.entries(productsSnap.val()).map(([id, value]) => ({ id, ...value }))
      : [];
    const categories = categoriesSnap.exists() ? organizeCategories(categoriesSnap.val()) : [];

    return [...foodCatalog(categories, products), ...drinks];
  } catch (error) {
    console.error('Error building restaurant menu catalog:', error);
    return drinks;
  }
}
