'use client';

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
// import { useTranslations } from '@/context/TranslationsContext'; използвай този ако има нужда от преводи от базата данни
//използвай този ако има нужда от преводи от json файл
import translations from '@/locales/central-menu.json';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Image, Select } from "antd";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function CentralMenuPage({ params }) {
  const router = useRouter();
  const urlParams = useParams();
  const { products } = useProducts();
  const { categories } = useCategories();
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

  // Translation function
  const t = (key) => {
    if (selectedLanguage === 'bg') {
      return key; // Return original Bulgarian text
    }
    return translations?.[selectedLanguage]?.[key] || key;
  };

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

    const priceInLv = normalized.toFixed(2);
    const priceInEuro = (normalized / 1.95583).toFixed(2);
    return `${priceInLv} лв. / ${priceInEuro} €`;
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
  }).sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 0;
    const orderB = b.order !== undefined ? b.order : 0;
    return orderA - orderB;
  });

  // Set first category as selected by default
  useEffect(() => {
    if (mainCategories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(mainCategories[0].id);
    }
  }, [mainCategories, selectedCategoryId]);

  // Get selected category
  const selectedCategory = mainCategories.find(cat => cat.id === selectedCategoryId) || mainCategories[0];
  
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
              <h1 className="central-menu-title mobile-title">
                {t(selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1))}
              </h1>
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
                        <div className="central-menu-items">
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
                                  <div style={{ marginBottom: (item.ingredients || item.description) ? "12px" : 0, fontSize: '16px' }}>
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
                  <div className="central-menu-items">
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
                            <div style={{ marginBottom: (item.ingredients || item.description) ? "12px" : 0, fontSize: '16px' }}>
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
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

