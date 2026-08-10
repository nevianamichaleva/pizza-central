'use client';

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
// import { useTranslations } from '@/context/TranslationsContext'; използвай този ако има нужда от преводи от базата данни
//използвай този ако има нужда от преводи от json файл
import { translateCentralMenu } from '@/lib/centralMenuTranslate';
import translations from '@/locales/central-menu.json';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Image, Select } from "antd";
import SpicyBadge from '@/components/SpicyBadge';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useObednoMenuSchedule } from '@/hooks/useObednoMenuSchedule';
import { categoryUsesObednoSchedule } from '@/lib/obednoMenuSchedule';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function CentralMenuPage({ params }) {
  const router = useRouter();
  const urlParams = useParams();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { isObednoOpen } = useObednoMenuSchedule();
  // const { translations } = useTranslations();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const categoriesSliderRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('bg');

  // Get lang from URL params
  useEffect(() => {
    const getLang = async () => {
      const resolvedParams = params ? await params : urlParams;
      const langValue = resolvedParams?.lang || 'bg';
      setSelectedLanguage(langValue);
    };
    getLang();
  }, [params, urlParams]);

  const t = (key) => translateCentralMenu(key, selectedLanguage, translations);

  const normalizePrice = (rawPrice) => {
    if (rawPrice === undefined || rawPrice === null) {
      return null;
    }

    if (typeof rawPrice === "number") {
      return Number.isFinite(rawPrice) ? rawPrice : null;
    }

    const cleaned = String(rawPrice)
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");

    if (!cleaned) {
      return null;
    }

    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatPrice = (price) => {
    const normalized = normalizePrice(price);
    if (normalized === null) {
      return null;
    }

    const priceInEuro = (normalized / 1.95583).toFixed(2);
    return `${priceInEuro} €`;
  };

  // Мапване на стойностите на алергените към техните български имена (за търсене в JSON)
  const allergenValueToBgName = {
    'gluten': 'Глутен',
    'crustaceans': 'Ракообразни',
    'eggs': 'Яйца',
    'fish': 'Риба',
    'peanuts': 'Фъстъци',
    'soybeans': 'Соя',
    'milk': 'Мляко',
    'nuts': 'Ядки',
    'celery': 'Целина',
    'mustard': 'Горчица',
    'sesame': 'Сусам',
    'sulphites': 'Сулфити',
    'lupin': 'Лупина',
    'molluscs': 'Мекотели',
  };

  const getAllergenLabel = (allergenValue) => {
    const bgName = allergenValueToBgName[allergenValue];
    if (!bgName) return allergenValue;
    // Използваме функцията t() за превод от JSON файла
    return t(bgName);
  };


  // Filter categories by forRestaurant field
  // If both fields are missing, show the category (backward compatibility)
  const mainCategories = categories.filter((category) => {
    // If both fields are missing, show the category in both menus
    const hasDeliveryField = category.forDelivery !== undefined && category.forDelivery !== null;
    const hasRestaurantField = category.forRestaurant !== undefined && category.forRestaurant !== null;
    if (!hasDeliveryField && !hasRestaurantField) {
      return true;
    }
    // If forRestaurant field exists, use it
    if (hasRestaurantField) {
      return category.forRestaurant === true;
    }
    // If only forDelivery exists, show if not explicitly marked as delivery-only
    return category.forDelivery !== true;
  })
  .filter((category) => isObednoOpen || !categoryUsesObednoSchedule(category))
  .sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

  // Helper function to check if product belongs to a category
  // Supports both old format (category) and new format (categories array)
  const productBelongsToCategory = (product, categoryId) => {
    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories.includes(categoryId);
    }
    // Fallback to old format
    return product.category === categoryId;
  };
  
  // Get products for selected category
  // Show products that are for restaurant (forRestaurant === true)
  // If both fields are missing, show all products (backward compatibility)
  // For "Гарнитури" category, show side dishes, otherwise filter them out
  const getCategoryProducts = (categoryId) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    const isGarnituriCategory = selectedCategory?.name === "Гарнитури";
    
    return products.filter(
      (item) => {
        if (!productBelongsToCategory(item, categoryId)) return false;
        // For "Гарнитури" category, show side dishes. For other categories, filter them out
        if (!isGarnituriCategory && item.isSideDish) return false;
        // If both fields are missing, show the product in both menus
        const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
        const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
        if (!hasDeliveryField && !hasRestaurantField) {
          return true;
        }
        // If forRestaurant field exists, use it
        if (hasRestaurantField) {
          return item.forRestaurant === true;
        }
        // If only forDelivery exists, show if not explicitly marked as delivery-only
        return item.forDelivery !== true;
      }
    );
  };

  const visibleCategories = useMemo(
    () => mainCategories.filter((category) => getCategoryProducts(category.id).length > 0),
    [mainCategories, products, categories]
  );

  useEffect(() => {
    if (visibleCategories.length === 0) return;
    const isCurrentVisible = visibleCategories.some((cat) => cat.id === selectedCategoryId);
    if (selectedCategoryId === null || !isCurrentVisible) {
      setSelectedCategoryId(visibleCategories[0].id);
    }
  }, [visibleCategories, selectedCategoryId]);

  const selectedCategory = visibleCategories.find((cat) => cat.id === selectedCategoryId)
    || visibleCategories[0]
    || null;

  const formatCategoryLabel = (category) => {
    const translatedName = t(category.name);
    return translatedName.charAt(0).toUpperCase() + translatedName.slice(1);
  };

  const currentCategoryIndex = selectedCategory
    ? visibleCategories.findIndex((cat) => cat.id === selectedCategory.id)
    : -1;
  const previousCategory = currentCategoryIndex > 0 ? visibleCategories[currentCategoryIndex - 1] : null;
  const nextCategory = currentCategoryIndex >= 0 && currentCategoryIndex < visibleCategories.length - 1
    ? visibleCategories[currentCategoryIndex + 1]
    : null;

  const goToCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderCategoryNavigation = () => {
    if (!previousCategory && !nextCategory) return null;

    return (
      <nav className="central-menu-category-nav" aria-label={t('Навигация между категории')}>
        {previousCategory ? (
          <button
            type="button"
            className="central-menu-category-nav-link central-menu-category-nav-link--prev"
            onClick={() => goToCategory(previousCategory.id)}
          >
            <LeftOutlined />
            <span>{formatCategoryLabel(previousCategory)}</span>
          </button>
        ) : (
          <span className="central-menu-category-nav-spacer" aria-hidden="true" />
        )}
        {nextCategory ? (
          <button
            type="button"
            className="central-menu-category-nav-link central-menu-category-nav-link--next"
            onClick={() => goToCategory(nextCategory.id)}
          >
            <span>{formatCategoryLabel(nextCategory)}</span>
            <RightOutlined />
          </button>
        ) : (
          <span className="central-menu-category-nav-spacer" aria-hidden="true" />
        )}
      </nav>
    );
  };

  // Scroll categories functions
  const scrollCategories = (direction) => {
    if (categoriesSliderRef.current) {
      const scrollAmount = 200;
      const currentScroll = categoriesSliderRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      categoriesSliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="central-menu-page">
      {/* Order Button Section */}
      <div className="central-menu-header">
        <div className="container">
          <div className="central-menu-header-content">
            <h1 className="central-menu-title desktop-title" style={{fontSize: '36px'}}>{t("Меню на Ресторант-пицария Централ град Добрич")}</h1>
            {selectedCategory && (
              <div className="central-menu-title mobile-title">
                {t(selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1))}
              </div>
            )}
            <div className="language-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Select
                value={selectedLanguage}
                onChange={(newLang) => {
                  setSelectedLanguage(newLang);
                  router.push(`/${newLang}/central-menu`);
                }}
                className="language-selector"
                style={{
                  width: 120,
                  height: '50px',
                }}
                size="large"
                options={[
                  { value: 'bg', label: '🇧🇬 BG' },
                  { value: 'en', label: '🇬🇧 EN' },
                  { value: 'ro', label: '🇷🇴 RO' },
                  { value: 'de', label: '🇩🇪 DE' },
                ]}
              />
              <Link href="/for-home">
                <Button 
                  type="primary" 
                  size="large"
                  className="order-home-btn"
                  style={{
                    backgroundColor: '#FFA500',
                    borderColor: '#ce1212',
                    height: '50px',
                    fontSize: '18px',
                    fontWeight: 600,
                    padding: '0 40px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px #ce1212',
                  }}
                >
                  {t("Поръчай за вкъщи")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Slider */}
      <div className="central-menu-categories-container">
        <div className="container">
          <div className="central-menu-categories-wrapper">
            <button 
              className="central-menu-category-arrow central-menu-category-arrow-left"
              onClick={() => scrollCategories('left')}
              aria-label={t("Предишни категории")}
            >
              <LeftOutlined />
            </button>
            <div 
              className="central-menu-categories-slider"
              ref={categoriesSliderRef}
            >
              {mainCategories.map((category) => {
                const categoryProducts = getCategoryProducts(category.id);
                // Hide empty categories
                if (categoryProducts.length === 0) return null;
                
                return (
                  <button
                    key={category.id}
                    className={`central-menu-category-btn ${selectedCategoryId === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {(() => {
                      const translatedName = t(category.name);
                      return translatedName.charAt(0).toUpperCase() + translatedName.slice(1);
                    })()}
                  </button>
                );
              })}
            </div>
            <button 
              className="central-menu-category-arrow central-menu-category-arrow-right"
              onClick={() => scrollCategories('right')}
              aria-label={t("Следващи категории")}
            >
              <RightOutlined />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="central-menu-content">
        <div className="container">
          {selectedCategory && (() => {
            const categoryProducts = getCategoryProducts(selectedCategory.id);
            
            if (categoryProducts.length === 0) {
              return (
                <div className="central-menu-category">
                  <p style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    {t("Няма продукти в тази категория.")}
                  </p>
                  {renderCategoryNavigation()}
                </div>
              );
            }

            return (
              <div key={selectedCategory.id} className="central-menu-category">
                <h2 className="central-menu-category-title">
                  {t(selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1))}
                </h2>
                
                {/* Subcategories if they exist */}
                {selectedCategory?.children && selectedCategory.children?.length > 0 ? (
                  selectedCategory.children.map((subcategory) => {
                    const subcategoryProducts = products.filter(
                      (item) => {
                        // Check if product belongs to the parent category
                        if (!productBelongsToCategory(item, selectedCategory.id)) return false;
                        if (item?.subcategory != subcategory.id) return false;
                        // Check if this subcategory belongs to "Гарнитури" category
                        const parentCategory = categories.find(cat => cat.id === selectedCategory.id);
                        const isGarnituriCategory = parentCategory?.name === "Гарнитури";
                        // For "Гарнитури" category, show side dishes. For other categories, filter them out
                        if (!isGarnituriCategory && item.isSideDish) return false;
                        // If both fields are missing, show the product in both menus
                        const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                        const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                        if (!hasDeliveryField && !hasRestaurantField) {
                          return true;
                        }
                        // If forRestaurant field exists, use it
                        if (hasRestaurantField) {
                          return item.forRestaurant === true;
                        }
                        // If only forDelivery exists, show if not explicitly marked as delivery-only
                        return item.forDelivery !== true;
                      }
                    );

                    if (subcategoryProducts.length === 0) return null;

                    return (
                      <div key={subcategory.id} className="central-menu-subcategory">
                        <h3 className="central-menu-subcategory-title">
                          {t(subcategory.name.charAt(0).toUpperCase() + subcategory.name.slice(1))}
                        </h3>
                        <div className="central-menu-items central-menu-items--list">
                          {subcategoryProducts.map((item, index) => (
                            <div key={index} className="central-menu-item">
                              <div className="central-menu-item-image">
                                <Image
                                  src={item.image ? item.image : '/images/no-image.png'}
                                  alt={item.name}
                                  className="menu-item-img"
                                  preview={{
                                    mask: t('Преглед'),
                                    maskClassName: 'central-menu-image-preview-mask'
                                  }}
                                />
                              </div>
                              <div className="central-menu-item-content">
                                <div className="central-menu-item-header">
                                  <h4 className="central-menu-item-name">{t(item.name)}</h4>
                                  {formatPrice(item.price) && (
                                    <p className="central-menu-item-price">{formatPrice(item.price)}</p>
                                  )}
                                </div>
                                {item.weight && (
                                  <div className="central-menu-item-meta" style={{ marginBottom: (item.ingredients || item.description) ? '8px' : 0 }}>
                                    <strong>{t("Грамаж")}:</strong> {item.weight} {item.weightUnit || t("г")}
                                  </div>
                                )}
                                {(item.ingredients || item.description) && (
                                  <>
                                    {item.ingredients && (
                                      <p
                                        className="central-menu-item-description"
                                        style={{ marginBottom: item.description ? "6px" : undefined }}
                                      >
                                        {t(item.ingredients)}
                                      </p>
                                    )}
                                    {item.description && (
                                      <p className="central-menu-item-description" style={{ marginBottom: 0 }}>
                                        {t(item.description)}
                                      </p>
                                    )}
                                  </>
                                )}
                                {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
                                  <div className="central-menu-item-allergens" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                                    {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                      <>
                                        <strong>{t("Алергени")}:</strong>{' '}
                                        <span style={{ color: '#d32f2f' }}>
                                          {item.allergens.map(allergenValue => getAllergenLabel(allergenValue)).join(', ')}
                                        </span>
                                      </>
                                    )}
                                    {item.spicy === true && (
                                      <>
                                        {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                          <span style={{ color: '#bdbdbd' }} aria-hidden="true">·</span>
                                        )}
                                        <SpicyBadge spicy={item.spicy} title={t('Пикантно')} />
                                      </>
                                    )}
                                  </div>
                                )}
                                {/* {item.slug && (
                                  <div style={{ marginTop: '12px' }}>
                                    <Link href={`/products/${item.slug}`}>
                                      <Button
                                        type="default"
                                        style={{ width: '100%' }}
                                      >
                                        {t("Виж повече")}
                                      </Button>
                                    </Link>
                                  </div>
                                )} */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="central-menu-items central-menu-items--list">
                    {categoryProducts.map((item, index) => (
                      <div key={index} className="central-menu-item">
                        <div className="central-menu-item-image">
                          <Image
                            src={item.image ? item.image : '/images/no-image.png'}
                            alt={item.name}
                            className="menu-item-img"
                            preview={{
                              mask: t('Преглед'),
                              maskClassName: 'central-menu-image-preview-mask'
                            }}
                          />
                        </div>
                        <div className="central-menu-item-content">
                          <div className="central-menu-item-header">
                            <h4 className="central-menu-item-name">{t(item.name)}</h4>
                            {formatPrice(item.price) && (
                              <p className="central-menu-item-price">{formatPrice(item.price)}</p>
                            )}
                          </div>
                          {item.weight && (
                            <div className="central-menu-item-meta" style={{ marginBottom: (item.ingredients || item.description) ? '8px' : 0 }}>
                              <strong>{t("Грамаж")}:</strong> {item.weight} {item.weightUnit || t("г")}
                            </div>
                          )}
                          {(item.ingredients || item.description) && (
                            <>
                              {item.ingredients && (
                                <p
                                  className="central-menu-item-description"
                                  style={{ marginBottom: item.description ? "6px" : undefined }}
                                >
                                  {t(item.ingredients)}
                                </p>
                              )}
                              {item.description && (
                                <p className="central-menu-item-description" style={{ marginBottom: 0 }}>
                                  {t(item.description)}
                                </p>
                              )}
                            </>
                          )}
                          {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
                            <div className="central-menu-item-allergens" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                              {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                <>
                                  <strong>{t("Алергени")}:</strong>{' '}
                                  <span style={{ color: '#d32f2f' }}>
                                    {item.allergens.map(allergenValue => getAllergenLabel(allergenValue)).join(', ')}
                                  </span>
                                </>
                              )}
                              {item.spicy === true && (
                                <>
                                  {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                    <span style={{ color: '#bdbdbd' }} aria-hidden="true">·</span>
                                  )}
                                  <SpicyBadge spicy={item.spicy} title={t('Пикантно')} />
                                </>
                              )}
                            </div>
                          )}
                          {/* {item.slug && (
                            <div style={{ marginTop: '12px' }}>
                              <Link href={`/products/${item.slug}`}>
                                <Button
                                  type="default"
                                  style={{ width: '100%' }}
                                >
                                  {t("Виж повече")}
                                </Button>
                              </Link>
                            </div>
                          )} */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {renderCategoryNavigation()}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

