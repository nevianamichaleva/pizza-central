'use client';

import {
  drinkCategories,
  formatDrinkPriceRange,
  getDrinkCategoryById,
  getDrinkText,
  isDrinkCategoryId,
} from '@/data/centralMenuDrinks';

export function getMergedMenuCategories(foodCategories, lang) {
  const drinkCats = drinkCategories.map((category) => ({
    id: category.id,
    name: getDrinkText(category.name, lang),
    isDrink: true,
    order: category.order,
  }));

  return [...foodCategories, ...drinkCats];
}

function DrinkItemRow({ item, lang, t, getAllergenLabel }) {
  const priceLabel = formatDrinkPriceRange(item.price, item.priceSecondary);

  return (
    <div className="central-menu-drink-item">
      <div className="central-menu-drink-item-main">
        <div className="central-menu-drink-item-name">
          {getDrinkText(item.name, lang)}
        </div>
        {item.quantity && (
          <div className="central-menu-drink-item-quantity">
            {getDrinkText(item.quantity, lang)}
          </div>
        )}
        {priceLabel && (
          <div className="central-menu-drink-item-price">{priceLabel}</div>
        )}
      </div>
      {item.description && (
        <p className="central-menu-drink-item-description">
          {getDrinkText(item.description, lang)}
        </p>
      )}
      {item.allergens?.length > 0 && (
        <div className="central-menu-item-allergens">
          <strong>{t('Алергени')}:</strong>{' '}
          <span style={{ color: '#d32f2f' }}>
            {item.allergens.map((value) => getAllergenLabel(value)).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

function DrinkItemsList({ items, lang, t, getAllergenLabel }) {
  if (!items?.length) return null;

  return (
    <div className="central-menu-drink-items">
      {items.map((item, index) => (
        <DrinkItemRow
          key={`${getDrinkText(item.name, 'bg')}-${index}`}
          item={item}
          lang={lang}
          t={t}
          getAllergenLabel={getAllergenLabel}
        />
      ))}
    </div>
  );
}

export default function CentralMenuDrinks({ categoryId, lang, t, getAllergenLabel }) {
  if (!isDrinkCategoryId(categoryId)) return null;

  const category = getDrinkCategoryById(categoryId);
  if (!category) return null;

  return (
    <div className="central-menu-category central-menu-category--drinks">
      <h2 className="central-menu-category-title">
        {getDrinkText(category.name, lang)}
      </h2>

      {category.note && (
        <p className="central-menu-drink-note">{getDrinkText(category.note, lang)}</p>
      )}

      {category.subcategories?.map((subcategory, index) => (
        <div key={`${getDrinkText(subcategory.name, 'bg')}-${index}`} className="central-menu-subcategory">
          <h3 className="central-menu-subcategory-title">
            {getDrinkText(subcategory.name, lang)}
          </h3>
          <DrinkItemsList
            items={subcategory.items}
            lang={lang}
            t={t}
            getAllergenLabel={getAllergenLabel}
          />
        </div>
      ))}

      <DrinkItemsList
        items={category.items}
        lang={lang}
        t={t}
        getAllergenLabel={getAllergenLabel}
      />
    </div>
  );
}

export { isDrinkCategoryId };
