"use client";

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { useObednoMenuSchedule } from '@/hooks/useObednoMenuSchedule';
import {
  canOrderObednoProduct,
  categoryUsesObednoSchedule,
  filterDeliveryCategories,
  getObednoMenuClosedMessage,
  getObednoMenuHoursLabel,
  isProductVisibleInDeliverySearch,
} from '@/lib/obednoMenuSchedule';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Radio } from "antd";
import { get, push, ref, set, update } from "firebase/database";
import Link from "next/link";
import { useEffect, useMemo, useState } from 'react';
import { rtdb } from "../../lib/firebase";
import {
  buildPizza3x1ItemKey,
  buildPizza3x1ItemName,
  calculatePizza3x1BasePrice,
  isPizza3x1Product,
} from '@/lib/pizza3x1';
import { formatOrderDate } from '@/utils/orderNumberUtils';
import showAToast from "../components/common/showAToast";
import MobileProductsSlider from "./MobileProductsSlider";
import Pizza3x1Modal from "./Pizza3x1Modal";
import SpicyBadge from "./SpicyBadge";
const { Search } = Input;

// 14 основни алергена според ЕС регулациите
const allergens = [
  { value: 'gluten', label: 'Глутен' },
  { value: 'crustaceans', label: 'Ракообразни' },
  { value: 'eggs', label: 'Яйца' },
  { value: 'fish', label: 'Риба' },
  { value: 'peanuts', label: 'Фъстъци' },
  { value: 'soybeans', label: 'Соя' },
  { value: 'milk', label: 'Мляко' },
  { value: 'nuts', label: 'Ядки' },
  { value: 'celery', label: 'Целина' },
  { value: 'mustard', label: 'Горчица' },
  { value: 'sesame', label: 'Сусам' },
  { value: 'sulphites', label: 'Сулфити' },
  { value: 'lupin', label: 'Лупина' },
  { value: 'molluscs', label: 'Мекотели' },
];

const getAllergenLabel = (allergenValue) => {
  const allergen = allergens.find(a => a.value === allergenValue);
  return allergen ? allergen.label : allergenValue;
};

const MenuSection = ({ categorySlug = null, hideTitle = false }) => {
  const STORAGE_KEY = 'menuActiveTab';
  const DEFAULT_TAB = "menu-Пици";
  
  // Initialize activeTab from localStorage or use default
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && !categorySlug) {
      const savedTab = localStorage.getItem(STORAGE_KEY);
      return savedTab || DEFAULT_TAB;
    }
    return DEFAULT_TAB;
  });
  
  const [subcategoryActiveTab, setSubcategoryActiveTab] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [flavorModalVisible, setFlavorModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSideDish, setSelectedSideDish] = useState(null);
  const [packagingData, setPackagingData] = useState({});
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const { products } = useProducts();
  const { categories } = useCategories();
  const { user, userDetails } = useUser();
  const { isObednoOpen } = useObednoMenuSchedule();

  const visibleDeliveryCategories = useMemo(
    () => filterDeliveryCategories(categories, isObednoOpen),
    [categories, isObednoOpen],
  );

  // Find category by slug if categorySlug is provided
  const selectedCategory = categorySlug
    ? visibleDeliveryCategories.find((cat) => cat.slug === categorySlug) ||
      categories.find((cat) => cat.slug === categorySlug && categoryUsesObednoSchedule(cat))
    : null;

  const selectedCategoryObednoClosed =
    Boolean(categorySlug && selectedCategory && categoryUsesObednoSchedule(selectedCategory) && !isObednoOpen);

  // Set active tab to selected category when categorySlug is provided
  useEffect(() => {
    if (categorySlug && selectedCategory && !selectedCategoryObednoClosed) {
      setActiveTab(`menu-${selectedCategory.name}`);
    }
  }, [categorySlug, selectedCategory, selectedCategoryObednoClosed]);

  useEffect(() => {
    if (categorySlug || visibleDeliveryCategories.length === 0) return;
    const activeStillVisible = visibleDeliveryCategories.some(
      (cat) => activeTab === `menu-${cat.name}`,
    );
    if (!activeStillVisible) {
      const first = visibleDeliveryCategories[0];
      const nextTab = `menu-${first.name}`;
      setActiveTab(nextTab);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, nextTab);
      }
    }
  }, [activeTab, categorySlug, visibleDeliveryCategories]);

  // Helper function to check if product belongs to a category
  // Supports both old format (category) and new format (categories array)
  const productBelongsToCategory = (product, categoryId) => {
    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories.includes(categoryId);
    }
    // Fallback to old format
    return product.category === categoryId;
  };

  // Filter products by search query (name, category, ingredients)
  const filterProductsBySearch = (productList, query) => {
    if (!query || query.trim() === '') {
      return productList;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return productList.filter((item) => {
      // Search by name
      const nameMatch = item.name && item.name.toLowerCase().includes(searchTerm);
      
      // Search by ingredients
      const ingredientsMatch = item.ingredients && item.ingredients.toLowerCase().includes(searchTerm);
      
      // Search by category name
      let categoryMatch = false;
      const categoryIds = item.categories && Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : (item.category ? [item.category] : []);
      
      categoryIds.forEach(categoryId => {
        const category = categories.find(cat => cat.id === categoryId);
        if (category && category.name && category.name.toLowerCase().includes(searchTerm)) {
          categoryMatch = true;
        }
      });
      
      return nameMatch || ingredientsMatch || categoryMatch;
    });
  };

  // Validate and set active tab when categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0) {
      const savedTab = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      
      if (savedTab) {
        // Check if saved tab exists in categories
        const categoryName = savedTab.replace('menu-', '');
        const categoryExists = categories.some(cat => cat.name === categoryName);
        
        if (categoryExists && savedTab !== activeTab) {
          setActiveTab(savedTab);
        } else if (!categoryExists) {
          // If saved category doesn't exist, use default
          setActiveTab(DEFAULT_TAB);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, DEFAULT_TAB);
          }
        }
      }
    }
  }, [categories]);


  // Fetch packaging data
  useEffect(() => {
    const fetchPackaging = async () => {
      try {
        const packagingRef = ref(rtdb, 'packaging');
        const packagingSnapshot = await get(packagingRef);
        if (packagingSnapshot.exists()) {
          setPackagingData(packagingSnapshot.val());
        }
      } catch (error) {
        console.error("Error fetching packaging:", error);
      }
    };
    fetchPackaging();
  }, []);

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

  // Get display price (product price + packaging price for delivery items)
  const getDisplayPrice = (product) => {
    const basePrice = normalizePrice(product.price);
    if (basePrice === null) {
      return null;
    }

    // Only add packaging price for items that are delivered
    // Since MenuSection only shows delivery items, we add packaging for all items shown here
    if (product.packagingIds && packagingData) {
      const packagingIds = Array.isArray(product.packagingIds) ? product.packagingIds : [product.packagingIds];
      let packagingTotal = 0;
      
      packagingIds.forEach(packagingId => {
        const packaging = packagingData[packagingId];
        if (packaging && packaging.price) {
          packagingTotal += parseFloat(packaging.price) || 0;
        }
      });

      return basePrice + packagingTotal;
    }

    return basePrice;
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSubcategoryActiveTab(null);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, tab);
    }
  };

  const handleSubcategoryClick = (tab) => {
    setSubcategory(tab);
    setSubcategoryActiveTab(`menu-${tab.name}`)
  }

  // Get side dishes (products with isSideDish: true)
  const getSideDishes = () => {
    return products.filter(p => p.isSideDish === true);
  };


  const handleProductClick = (product) => {
    if (!canOrderObednoProduct(product, categories, isObednoOpen)) {
      showAToast('warning', getObednoMenuClosedMessage());
      return;
    }
    if (isPizza3x1Product(product)) {
      setSelectedProduct(product);
      setFlavorModalVisible(true);
      return;
    }
    if (product.requiresSideDish) {
      setSelectedProduct(product);
      setSideDishModalVisible(true);
    } else {
      handleAddProduct(product, null);
    }
  };

  const handleSideDishConfirm = () => {
    if (selectedProduct && selectedSideDish) {
      handleAddProduct(selectedProduct, selectedSideDish);
      setSideDishModalVisible(false);
      setSelectedProduct(null);
      setSelectedSideDish(null);
    } else if (selectedProduct) {
      // Allow adding without side dish if user doesn't select one
      handleAddProduct(selectedProduct, null);
      setSideDishModalVisible(false);
      setSelectedProduct(null);
      setSelectedSideDish(null);
    }
  };

  const handleFlavorConfirm = (flavors) => {
    if (selectedProduct && flavors?.length === 3) {
      handleAddProduct(selectedProduct, null, flavors);
      setFlavorModalVisible(false);
      setSelectedProduct(null);
    }
  };

  async function handleAddProduct(product, sideDish, flavors = null) {
    if (!canOrderObednoProduct(product, categories, isObednoOpen)) {
      showAToast('warning', getObednoMenuClosedMessage());
      return;
    }
    const ordersRef = ref(rtdb, 'orders');

    const is3x1 = isPizza3x1Product(product) && Array.isArray(flavors) && flavors.length === 3;
    const productPrice = is3x1
      ? calculatePizza3x1BasePrice(flavors)
      : normalizePrice(product.price ?? product.value ?? product.basePrice);

    if (productPrice === null || !Number.isFinite(productPrice)) {
      showAToast("error", "Този продукт няма валидна цена и не може да бъде добавен.");
      console.error("Invalid product price", product);
      return;
    }

    const productImage = product.image ?? product.img ?? product.url ?? "/images/no-image.png";
    
    const flavorIds = is3x1 ? flavors.map((f) => f.id) : null;
    const flavorNames = is3x1 ? flavors.map((f) => f.name) : null;
    const itemKey = is3x1
      ? buildPizza3x1ItemKey(product.id, flavorIds)
      : (sideDish ? `${product.id}_${sideDish.id}` : product.id);
    const itemName = is3x1
      ? buildPizza3x1ItemName(product.name, flavors)
      : (sideDish ? `${product.name} (с ${sideDish.name})` : product.name);

    // Fetch packaging items for this product
    let packagingItems = [];
    // Handle both array and non-array packagingIds, and also handle empty arrays
    const packagingIds = product.packagingIds;
    if (packagingIds) {
      const idsArray = Array.isArray(packagingIds) ? packagingIds : [packagingIds];
      if (idsArray.length > 0) {
        try {
          const packagingRef = ref(rtdb, 'packaging');
          const packagingSnapshot = await get(packagingRef);
          if (packagingSnapshot.exists()) {
            const packagingData = packagingSnapshot.val();
            packagingItems = idsArray
              .map(packagingId => {
                const packaging = packagingData[packagingId];
                if (packaging) {
                  return {
                    id: packagingId,
                    ...packaging
                  };
                }
                return null;
              })
              .filter(Boolean);
          }
        } catch (error) {
          console.error("Error fetching packaging:", error);
        }
      }
    }

    try {
      const snapshot = await get(ordersRef);
      let orderKey = null;
      let cartId = localStorage.getItem('cartId');

      if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
          const orderData = childSnapshot.val();
          if (orderData.id === cartId) {
            orderKey = childSnapshot.key;
            return true;
          }
        });
      }

      const emitCartUpdate = (nextCartId) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("cart:update", {
              detail: { cartId: nextCartId },
            })
          );
        }
      };

      if (!orderKey) {
        const newOrderRef = push(ordersRef);
        orderKey = newOrderRef.key;
        localStorage.setItem("cartId", orderKey);
        emitCartUpdate(orderKey);

        // Calculate total price including packaging
        let packagingTotal = 0;
        packagingItems.forEach((packaging) => {
          packagingTotal += parseFloat(packaging.price) || 0;
        });
        const totalProductPrice = productPrice + packagingTotal;

        const items = {
          [itemKey]: {
            name: itemName,
            quantity: 1,
            value: totalProductPrice, // Include packaging price in product price
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
            flavorIds: is3x1 ? flavorIds : null,
            flavorNames: is3x1 ? flavorNames : null,
            isPizza3x1: is3x1 || null,
          },
        };

        // Add packaging items linked to this product (hidden in cart but kept for email and admin)
        packagingItems.forEach((packaging) => {
          const packagingKey = `${itemKey}_packaging_${packaging.id}`;
          items[packagingKey] = {
            name: packaging.name,
            quantity: 1,
            value: parseFloat(packaging.price),
            image: "/images/no-image.png",
            productId: null,
            sideDishId: null,
            sideDishName: null,
            isPackaging: true,
            linkedToItemId: itemKey,
            packagingId: packaging.id,
            hiddenInCart: true, // Hide in cart but keep for email and admin
          };
        });

        const newOrder = {
          items: items,
          order_date: formatOrderDate(),
          status: "pending",
          total: totalProductPrice, // Already includes packaging price
          user_id: user ? user.uid : null,
          user_email: user ? user.email : null,
          user_phone: userDetails ? userDetails.phone : null,
          user_address: userDetails ? userDetails.address : null,
          id: orderKey,
        };

        await set(newOrderRef, newOrder);
        showAToast("success", "Продуктът е добавен в количката");
      } else {
        const orderSnapshot = snapshot.child(orderKey);
        const currentOrder = orderSnapshot.exists() ? orderSnapshot.val() : {};
        const currentItems = currentOrder.items || {};

        // Calculate total price including packaging
        let packagingTotal = 0;
        packagingItems.forEach((packaging) => {
          packagingTotal += parseFloat(packaging.price) || 0;
        });
        const totalProductPrice = productPrice + packagingTotal;

        const existingItem = currentItems[itemKey];
        const currentQuantity = Number(existingItem?.quantity) || 0;
        
        const updatedItems = {
          ...currentItems,
          [itemKey]: {
            name: itemName,
            quantity: currentQuantity + 1,
            value: totalProductPrice, // Include packaging price in product price
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
            flavorIds: is3x1 ? flavorIds : null,
            flavorNames: is3x1 ? flavorNames : null,
            isPizza3x1: is3x1 || null,
          },
        };

        // Add or update packaging items linked to this product (hidden in cart but kept for email and admin)
        packagingItems.forEach((packaging) => {
          const packagingKey = `${itemKey}_packaging_${packaging.id}`;
          const existingPackaging = currentItems[packagingKey];
          
          if (existingPackaging) {
            updatedItems[packagingKey] = {
              ...existingPackaging,
              quantity: (Number(existingPackaging.quantity) || 0) + 1,
              hiddenInCart: true, // Ensure it's marked as hidden
            };
          } else {
            updatedItems[packagingKey] = {
              name: packaging.name,
              quantity: 1,
              value: parseFloat(packaging.price),
              image: "/images/no-image.png",
              productId: null,
              sideDishId: null,
              sideDishName: null,
              isPackaging: true,
              linkedToItemId: itemKey,
              packagingId: packaging.id,
              hiddenInCart: true, // Hide in cart but keep for email and admin
            };
          }
        });

        const updatedTotal = Object.values(updatedItems).reduce((total, item) => {
          // Exclude packaging items that are hidden in cart (their price is already included in product price)
          if (item.isPackaging && item.hiddenInCart) {
            return total;
          }
          const basePrice = normalizePrice(item.value);
          const quantity = Number(item.quantity) || 0;
          if (!Number.isFinite(basePrice)) {
            return total;
          }
          return total + basePrice * quantity;
        }, 0);

        await update(ref(rtdb, `orders/${orderKey}`), {
          items: updatedItems,
          total: updatedTotal,
          order_date: formatOrderDate(),
          user_id: user ? user.uid : currentOrder.user_id ?? null,
          user_email: user ? user.email : currentOrder.user_email ?? null,
          user_phone: userDetails ? userDetails.phone : currentOrder.user_phone ?? null,
          user_address: userDetails ? userDetails.address : currentOrder.user_address ?? null,
        });

        emitCartUpdate(orderKey);
        showAToast("success", "Продуктът е добавен в количката");
      }
    } catch (error) {
      showAToast("error", "Грешка, обадете се на телефон 0895 516401 или 0893 315201");
      console.error("Error handling the order:", error);
    }
  }


  // Render product card - Enhanced desktop version
  const renderProductCard = (item, index) => (
    <div key={index} className="col-lg-4 menu-item menu-item-desktop">
      <div className="menu-card-wrapper">
        <div className="menu-card-image-container">
          <a href={item.url || item.image || "#"} className="glightbox">
            <img 
              src={item.image ? item.image : '/images/no-image.png'} 
              className="menu-img img-fluid" 
              alt={item.name} 
            />
          </a>
          <div className="menu-card-overlay">
            <Button
              type="primary"
              onClick={() => handleProductClick(item)}
              icon={<ShoppingCartOutlined />}
              className="menu-card-overlay-btn"
            >
              Добави в количката
            </Button>
          </div>
        </div>
        <div className="menu-card-content">
          <div className="menu-card-body-top">
            <div className="menu-card-title" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px', fontFamily: 'var(--heading-font)' }}>{item.name}</div>
            {item.weight && (
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Грамаж:</strong> {item.weight} г.
              </p>
            )}
            {(item.ingredients || item.description) && (
              <div style={{ marginBottom: "16px" }}>
                {item.ingredients && (
                  <p className="menu-card-description" style={{ marginBottom: "6px" }}>
                    {item.ingredients.length > 60
                      ? `${item.ingredients.substring(0, 60)}...` 
                      : item.ingredients}
                  </p>
                )}
                {item.description && (
                  <p className="menu-card-description" style={{ marginBottom: 0 }}>
                    {item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description}
                  </p>
                )}
              </div>
            )}
          </div>
          {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
            <div className="menu-card-allergens-row">
              {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                <>
                  <strong>Алергени:</strong>{' '}
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
                  <SpicyBadge spicy />
                </>
              )}
            </div>
          )}
          <div className="menu-card-footer">
            {isPizza3x1Product(item) ? (
              <p className="menu-card-price">по вкусове</p>
            ) : formatPrice(getDisplayPrice(item)) ? (
              <p className="menu-card-price">{formatPrice(getDisplayPrice(item))}</p>
            ) : null}
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              {item.slug && (
                <Link href={`/products/${item.slug}`}>
                  <Button
                    type="default"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    Виж повече
                  </Button>
                </Link>
              )}
              <Button
                type="primary"
                onClick={() => handleProductClick(item)}
                icon={<ShoppingCartOutlined />}
                className="menu-card-mobile-btn"
                size="large"
              >
                Добави
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If categorySlug is provided and category not found, return null
  if (categorySlug && !selectedCategory && !categories.some((c) => c.slug === categorySlug)) {
    return null;
  }

  if (selectedCategoryObednoClosed) {
    return (
      <section id="menu" className="menu section">
        <div className="container py-5">
          <div
            className="text-center px-3 py-4"
            style={{
              backgroundColor: 'var(--surface-color)',
              borderRadius: '12px',
              border: '1px solid rgba(206, 18, 18, 0.2)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            <p style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>
              Обедното меню не е активно в момента
            </p>
            <p style={{ fontSize: '1rem', marginBottom: 0, color: 'var(--default-color)' }}>
              Поръчки от тази категория приемаме само {getObednoMenuHoursLabel()}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="menu section">
      {!hideTitle && !categorySlug && (
        <div className="container section-title">
          <h2>
            {selectedCategory 
              ? selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1)
              : 'Ресторант-пицария Централ град Добрич'
            }
          </h2>
          <p>
            <span>
              {selectedCategory ? 'Нашите' : 'Нашето'}
            </span>{' '}
            <span className="description-title">
              {selectedCategory 
                ? selectedCategory.name.toLowerCase()
                : 'меню'
              }
            </span>
          </p>
        </div>
      )}

      <div className="container">
        {/* Search Bar */}
        <div style={{ marginBottom: '20px', marginTop: '0px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Search
            placeholder="Въведете за търсене в менюто"
            allowClear
            enterButton="Търси"
            size="large"
            onSearch={(value) => {
              setActiveSearchQuery(value.trim());
            }}
          />
        </div>

        {/* Desktop Tab Navigation - Hide if single category or when searching (min 3 chars) */}
        {!categorySlug && (!activeSearchQuery || activeSearchQuery.trim().length < 3) && (
          <ul className="nav nav-tabs d-flex justify-content-center menu-desktop-tabs" role="tablist">
          {visibleDeliveryCategories.map((category) => {
              const tabId = `menu-${category.name}`;
              const isActive = activeTab === tabId;
              return (
              <li key={category.id} className="nav-item" role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={`tab-${category.id}`}
                  aria-selected={isActive}
                  aria-controls={`menu-${category.name}`}
                  className={`nav-link ${isActive ? 'active show' : ''}`}
                  onClick={() => handleTabClick(tabId)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 400, fontFamily: 'var(--default-font)' }}>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
                </button>
              </li>
            )})}
          </ul>
        )}

        {/* Desktop Tab Content */}
        <div className="tab-content menu-desktop-content">
          {(() => {
            // If searching (at least 3 characters), show all products from all categories
            if (activeSearchQuery && activeSearchQuery.trim().length >= 3) {
              const allFilteredProducts = filterProductsBySearch(
                products.filter((item) => isProductVisibleInDeliverySearch(item, categories, isObednoOpen)),
                activeSearchQuery,
              );

              return (
                <div className="tab-pane fade active show">
                  <div className="tab-header text-center">
                    <p>Меню</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '500' }}>Резултати от търсенето: "{activeSearchQuery}"</h3>
                    <p style={{ fontSize: '16px', color: '#4a4a4a', marginTop: '10px', marginBottom: '20px' }}>
                      Намерени {allFilteredProducts.length} {allFilteredProducts.length === 1 ? 'продукт' : 'продукта'}
                    </p>
                  </div>
                  <div className="row gy-5">
                    {allFilteredProducts.map((item, index) => renderProductCard(item, index))}
                  </div>
                </div>
              );
            }

            // Normal category-based display
            const filteredCategories = visibleDeliveryCategories;

            const categoriesToDisplay =
              categorySlug && selectedCategory && !selectedCategoryObednoClosed
                ? [selectedCategory]
                : filteredCategories;

            return categoriesToDisplay.map((category, index) => {
              // Find next category in the filtered list
              const currentIndexInFiltered = filteredCategories.findIndex(cat => cat.id === category.id);
              const nextCategory = currentIndexInFiltered >= 0 && currentIndexInFiltered < filteredCategories.length - 1
                ? filteredCategories[currentIndexInFiltered + 1]
                : filteredCategories[0]; // If last category, link to first

              return (
            <div
              key={category.id}
              role="tabpanel"
              aria-labelledby={`tab-${category.id}`}
              className={`tab-pane fade ${(categorySlug && selectedCategory) || activeTab === `menu-${category.name}` ? 'active show' : ''}`}
              id={`menu-${category.name}`}
            >
              <div className="tab-header text-center">
                {!categorySlug && (
                  <>
                    <p>Меню</p>
                    <h3>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h3>
                  </>
                )}
                    {categorySlug && category.menuDescription && (
                      <p style={{ 
                        fontSize: '18px', 
                        color: '#666', 
                        fontStyle: 'italic',
                        marginTop: '15px',
                        marginBottom: '15px',
                        maxWidth: '800px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: '1.6',
                        textTransform: 'none'
                      }}>
                        {category.menuDescription}
                      </p>
                    )}
                    <div style={{ marginTop: '15px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {categorySlug && nextCategory && nextCategory.slug && nextCategory.id !== category.id && (
                        <Link
                          href={`/for-home/${nextCategory.slug}`}
                          style={{
                            color: '#FF8C00',
                            textDecoration: 'none',
                            fontSize: '22px',
                            fontWeight: '500'
                          }}
                        >
                          → Виж нашите {nextCategory.name.charAt(0).toUpperCase() + nextCategory.name.slice(1)}
                        </Link>
                      )}
                      {categorySlug && (
                        <Link
                          href={`/for-home`}
                          style={{
                            color: '#FF8C00',
                            textDecoration: 'none',
                            fontSize: '22px',
                            fontWeight: '500'
                          }}
                        >
                          → Виж всички за доставка
                        </Link>
                      )}
                    </div>
              </div>
              {category?.children && category.children?.length &&
                <ul className="nav nav-tabs d-flex justify-content-center" role="tablist">
                  {category.children.map((subcategory) => {
                    const subTabId = `menu-${subcategory.name}`;
                    const isSubActive = subcategoryActiveTab === subTabId;
                    return (
                    <li key={subcategory.id} className="nav-item" role="presentation">
                      <button
                        type="button"
                        role="tab"
                        id={`subtab-${subcategory.id}`}
                        aria-selected={isSubActive}
                        className={`nav-link ${isSubActive ? 'active show' : ''}`}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
                      >
                        <span style={{ fontSize: '18px', fontWeight: 400, fontFamily: 'var(--default-font)' }}>{subcategory.name.charAt(0).toUpperCase() + subcategory.name.slice(1)}</span>
                      </button>
                    </li>
                  )})}
                </ul>
              }
              <div className="row gy-5">
                {subcategoryActiveTab ?
                  <>
                    {filterProductsBySearch(products.filter((item) => {
                      // Check if product belongs to the parent category of this subcategory
                      const parentCategory = categories.find(cat => cat.id === subcategory.parent || cat.children?.some(child => child.id === subcategory.id));
                      if (!parentCategory || !productBelongsToCategory(item, parentCategory.id)) return false;
                      if (item?.subcategory != subcategory.id || item.isSideDish) return false;
                      // If both fields are missing, show the product in both menus
                      const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                      const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                      if (!hasDeliveryField && !hasRestaurantField) {
                        return true;
                      }
                      // Show if forDelivery is true
                      return item.forDelivery === true;
                    }), activeSearchQuery).map((item, index) => renderProductCard(item, index))}
                  </>
                  :
                  <>
                    {filterProductsBySearch(products.filter((item) => {
                      if (!productBelongsToCategory(item, category.id) || item.isSideDish) return false;
                      // If both fields are missing, show the product in both menus
                      const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                      const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                      if (!hasDeliveryField && !hasRestaurantField) {
                        return true;
                      }
                      // Show if forDelivery is true
                      return item.forDelivery === true;
                    }), activeSearchQuery).map((item, index) => renderProductCard(item, index))}
                  </>
                }
              </div>
            </div>
              );
            });
          })()}
        </div>

        {/* Mobile Search Results - Show when searching with categorySlug */}
        {categorySlug && (
          <div className="menu-mobile-categories">
            {(() => {
              // If searching (at least 3 characters), show all products from all categories
              if (activeSearchQuery && activeSearchQuery.trim().length >= 3) {
                const allFilteredProducts = filterProductsBySearch(products.filter((item) => {
                  if (item.isSideDish) return false;
                  // If both fields are missing, show the product in both menus
                  const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                  const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                  if (!hasDeliveryField && !hasRestaurantField) {
                    return true;
                  }
                  // Show if forDelivery is true
                  return item.forDelivery === true;
                }), activeSearchQuery);

                return (
                  <div className="menu-mobile-category-section">
                    <h3 className="menu-mobile-category-title" style={{ fontSize: '18px' }}>
                      Резултати от търсенето: "{activeSearchQuery}"
                    </h3>
                    <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '15px', textAlign: 'center' }}>
                      Намерени {allFilteredProducts.length} {allFilteredProducts.length === 1 ? 'продукт' : 'продукта'}
                    </p>
                    <MobileProductsSlider>
                      {allFilteredProducts.map((item, index) => (
                        <Link 
                          key={index} 
                          href={item.slug ? `/products/${item.slug}` : '#'} 
                          className="menu-mobile-product-item menu-mobile-product-link"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                          <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '8px', fontFamily: 'var(--default-font)', lineHeight: '1.3' }}>{item.name}</div>
                          <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />
                          {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
                            <div style={{ fontSize: '12px', lineHeight: 1.35, marginBottom: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                              {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                <>
                                  <strong>Алергени:</strong>
                                  <span style={{ color: '#d32f2f' }}>
                                    {item.allergens.map((allergenValue) => getAllergenLabel(allergenValue)).join(', ')}
                                  </span>
                                </>
                              )}
                              {item.spicy === true && (
                                <>
                                  {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                    <span style={{ color: '#bdbdbd' }} aria-hidden="true">·</span>
                                  )}
                                  <SpicyBadge spicy />
                                </>
                              )}
                            </div>
                          )}
                          {getDisplayPrice(item) && (() => {
                            const price = getDisplayPrice(item);
                            const priceInEuro = (price / 1.95583).toFixed(2);
                            return (
                              <div className="price" style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px', lineHeight: '1.4' }}>
                                <div style={{ fontSize: '13px', color: '#333' }}>
                                  {priceInEuro} €{item.weight ? ` | ${item.weight} ${item.weightUnit || 'г'}` : ''}
                                </div>
                              </div>
                            );
                          })()}
                          <div className="menu-mobile-product-buttons" style={{ display: 'flex', gap: '6px', width: '100%' }}>
                            <Button
                              type="primary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleProductClick(item);
                              }}
                              icon={<ShoppingCartOutlined />}
                              style={{
                                width: '100%',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                height: 'auto',
                                backgroundColor: '#b01a6b',
                                borderColor: '#b01a6b',
                                color: '#ffffff',
                                lineHeight: '1.2'
                              }}
                            >
                              Добави
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </MobileProductsSlider>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* Mobile Category List with Sliders - Hide if single category */}
        {!categorySlug && (
          <div className="menu-mobile-categories">
            {(() => {
              // If searching (at least 3 characters), show all products from all categories
              if (activeSearchQuery && activeSearchQuery.trim().length >= 3) {
                const allFilteredProducts = filterProductsBySearch(products.filter((item) => {
                  if (item.isSideDish) return false;
                  // If both fields are missing, show the product in both menus
                  const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                  const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                  if (!hasDeliveryField && !hasRestaurantField) {
                    return true;
                  }
                  // Show if forDelivery is true
                  return item.forDelivery === true;
                }), activeSearchQuery);

                return (
                  <div className="menu-mobile-category-section">
                    <h3 className="menu-mobile-category-title" style={{ fontSize: '18px' }}>
                      Резултати от търсенето: "{activeSearchQuery}"
                    </h3>
                    <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '15px', textAlign: 'center' }}>
                      Намерени {allFilteredProducts.length} {allFilteredProducts.length === 1 ? 'продукт' : 'продукта'}
                    </p>
                    <MobileProductsSlider>
                      {allFilteredProducts.map((item, index) => (
                        <div key={index} className="menu-mobile-product-item">
                          <a href={item.url || item.image || "#"} className="glightbox">
                            <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                          </a>
                          <div style={{ fontSize: '20px', fontWeight: 400, marginBottom: '8px', fontFamily: 'var(--default-font)' }}>{item.name}</div>
                          {item.weight && (
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                              <strong>Грамаж:</strong> {item.weight} г.
                            </p>
                          )}
                          {item.ingredients && (
                            <p className="ingredients" style={{ marginBottom: item.description ? "6px" : undefined }}>
                              {item.ingredients.length > 60 
                                ? `${item.ingredients.substring(0, 60)}...` 
                                : item.ingredients}
                            </p>
                          )}
                          {item.description && (
                            <p className="ingredients" style={{ marginBottom: "8px" }}>
                              {item.description.length > 60 
                                ? `${item.description.substring(0, 60)}...` 
                                : item.description}
                            </p>
                          )}
                          {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
                            <div style={{ fontSize: '13px', lineHeight: 1.35, marginBottom: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                              {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                <>
                                  <strong>Алергени:</strong>
                                  <span style={{ color: '#d32f2f' }}>
                                    {item.allergens.map((allergenValue) => getAllergenLabel(allergenValue)).join(', ')}
                                  </span>
                                </>
                              )}
                              {item.spicy === true && (
                                <>
                                  {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                    <span style={{ color: '#bdbdbd' }} aria-hidden="true">·</span>
                                  )}
                                  <SpicyBadge spicy />
                                </>
                              )}
                            </div>
                          )}
                          {isPizza3x1Product(item) ? (
                            <p className="price">по вкусове</p>
                          ) : formatPrice(getDisplayPrice(item)) ? (
                            <p className="price">{formatPrice(getDisplayPrice(item))}</p>
                          ) : null}
                          <div className="menu-mobile-product-buttons">
                            {item.slug && (
                              <Link href={`/products/${item.slug}`} style={{ marginBottom: '8px', display: 'block' }}>
                                <Button
                                  type="default"
                                  style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    height: 'auto'
                                  }}
                                >
                                  Виж повече
                                </Button>
                              </Link>
                            )}
                            <Button
                              type="primary"
                              onClick={() => handleProductClick(item)}
                              icon={<ShoppingCartOutlined />}
                              style={{
                                width: '100%',
                                borderRadius: '10px',
                                padding: '10px 20px',
                                fontSize: '16px',
                                height: 'auto',
                                backgroundColor: '#b01a6b',
                                borderColor: '#b01a6b',
                                color: '#ffffff'
                              }}
                            >
                              Добави
                            </Button>
                          </div>
                        </div>
                      ))}
                    </MobileProductsSlider>
                  </div>
                );
              }

              // Normal category-based display
              const filteredCategories = visibleDeliveryCategories;

              return filteredCategories.map((category, index) => {
                const categoryProducts = filterProductsBySearch(products.filter((item) => {
                  if (!productBelongsToCategory(item, category.id) || item.isSideDish) return false;
                  // If both fields are missing, show the product in both menus
                  const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                  const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                  if (!hasDeliveryField && !hasRestaurantField) {
                    return true;
                  }
                  // Show if forDelivery is true
                  return item.forDelivery === true;
                }), activeSearchQuery);

                // Find next category in the filtered list
                const nextCategory = index < filteredCategories.length - 1
                  ? filteredCategories[index + 1]
                  : filteredCategories[0]; // If last category, link to first
              
                return (
                  <div key={category.id} className="menu-mobile-category-section">
                    <h3 className="menu-mobile-category-title">
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </h3>
                    {category.slug && (
                      <div style={{ textAlign: 'right'}}>
                        <Link 
                          href={`/for-home/${category.slug}`}
                          style={{ 
                            color: '#FF8C00',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'inline-block'
                          }}
                        >
                          Виж всички {category.name.toLowerCase()} →
                        </Link>
                      </div>
                    )}
                  <MobileProductsSlider>
                    {categoryProducts.map((item, index) => (
                      <Link 
                        key={index} 
                        href={item.slug ? `/products/${item.slug}` : '#'} 
                        className="menu-mobile-product-item menu-mobile-product-link"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                        <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '8px', fontFamily: 'var(--default-font)', lineHeight: '1.3' }}>{item.name}</div>
                        <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />
                        {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
                          <div style={{ fontSize: '12px', lineHeight: 1.35, marginBottom: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                            {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                              <>
                                <strong>Алергени:</strong>
                                <span style={{ color: '#d32f2f' }}>
                                  {item.allergens.map((allergenValue) => getAllergenLabel(allergenValue)).join(', ')}
                                </span>
                              </>
                            )}
                            {item.spicy === true && (
                              <>
                                {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                  <span style={{ color: '#bdbdbd' }} aria-hidden="true">·</span>
                                )}
                                <SpicyBadge spicy />
                              </>
                            )}
                          </div>
                        )}
                        {getDisplayPrice(item) && (() => {
                          const price = getDisplayPrice(item);
                          const priceInEuro = (price / 1.95583).toFixed(2);
                          return (
                            <div className="price" style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px', lineHeight: '1.4' }}>
                              <div style={{ fontSize: '13px', color: '#333' }}>
                                {priceInEuro} €{item.weight ? ` | ${item.weight} ${item.weightUnit || 'г'}` : ''}
                              </div>
                            </div>
                          );
                        })()}
                        <div className="menu-mobile-product-buttons" style={{ display: 'flex', gap: '6px', width: '100%' }}>
                          <Button
                            type="primary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleProductClick(item);
                            }}
                            icon={<ShoppingCartOutlined />}
                            style={{
                              width: '100%',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              height: 'auto',
                              backgroundColor: '#b01a6b',
                              borderColor: '#b01a6b',
                              color: '#ffffff',
                              lineHeight: '1.2'
                            }}
                          >
                            Добави
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </MobileProductsSlider>
                </div>
                );
              });
            })()}
          </div>
        )}

        {/* Mobile view for single category */}
        {categorySlug && selectedCategory && (() => {
          const filteredCategories = visibleDeliveryCategories;

          const currentIndex = filteredCategories.findIndex(cat => cat.id === selectedCategory.id);
          const nextCategory = currentIndex >= 0 && currentIndex < filteredCategories.length - 1
            ? filteredCategories[currentIndex + 1]
            : filteredCategories[0];

          return (
            <div className="menu-mobile-categories">
              <div className="menu-mobile-category-section">
                {selectedCategory.menuDescription && (
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#666', 
                    fontStyle: 'italic',
                    marginTop: '10px',
                    marginBottom: '15px',
                    textAlign: 'center',
                    padding: '0 15px',
                    lineHeight: '1.6',
                    textTransform: 'none'
                  }}>
                    {selectedCategory.menuDescription}
                  </p>
                )}
                {nextCategory && nextCategory.slug && nextCategory.id !== selectedCategory.id && (
                  <div style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center' }}>
                    <Link 
                      href={`/for-home/${nextCategory.slug}`}
                      style={{ 
                        color: '#FF8C00', 
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      → Виж нашите {nextCategory.name.charAt(0).toUpperCase() + nextCategory.name.slice(1)}
                    </Link>
                  </div>
                )}
                <div style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center' }}>
                  <Link 
                    href={`/for-home`}
                    style={{ 
                      color: '#FF8C00', 
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    → Виж всички за доставка
                  </Link>
                </div>
                <MobileProductsSlider>
                {products
                  .filter((item) => {
                    if (!productBelongsToCategory(item, selectedCategory.id) || item.isSideDish) return false;
                    const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
                    const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
                    if (!hasDeliveryField && !hasRestaurantField) {
                      return true;
                    }
                    return item.forDelivery === true;
                  })
                  .map((item, index) => (
                    <Link 
                      key={index} 
                      href={item.slug ? `/products/${item.slug}` : '#'} 
                      className="menu-mobile-product-item menu-mobile-product-link"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                      <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '8px', fontFamily: 'var(--default-font)', lineHeight: '1.3' }}>{item.name}</div>
                      <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />
                      {((item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0) || item.spicy === true) && (
                        <div style={{ fontSize: '12px', lineHeight: 1.35, marginBottom: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                          {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                            <>
                              <strong>Алергени:</strong>
                              <span style={{ color: '#d32f2f' }}>
                                {item.allergens.map((allergenValue) => getAllergenLabel(allergenValue)).join(', ')}
                              </span>
                            </>
                          )}
                          {item.spicy === true && (
                            <>
                              {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
                                <span style={{ color: '#bdbdbd' }} aria-hidden="true">·</span>
                              )}
                              <SpicyBadge spicy />
                            </>
                          )}
                        </div>
                      )}
                      {getDisplayPrice(item) && (() => {
                        const price = getDisplayPrice(item);
                        const priceInEuro = (price / 1.95583).toFixed(2);
                        return (
                          <div className="price" style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px', lineHeight: '1.4' }}>
                            <div style={{ fontSize: '13px', color: '#333' }}>
                              {priceInEuro} €{item.weight ? ` | ${item.weight} ${item.weightUnit || 'г'}` : ''}
                            </div>
                          </div>
                        );
                      })()}
                      <div className="menu-mobile-product-buttons" style={{ display: 'flex', gap: '6px', width: '100%' }}>
                        <Button
                          type="primary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleProductClick(item);
                          }}
                          icon={<ShoppingCartOutlined />}
                          style={{
                            width: '100%',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            height: 'auto',
                            backgroundColor: '#b01a6b',
                            borderColor: '#b01a6b',
                            color: '#ffffff',
                            lineHeight: '1.2'
                          }}
                        >
                          Добави
                        </Button>
                      </div>
                    </Link>
                  ))}
                </MobileProductsSlider>
              </div>
            </div>
          );
        })()}
      </div>

      <Modal
        title="Изберете гарнитура"
        open={sideDishModalVisible}
        onOk={handleSideDishConfirm}
        onCancel={() => {
          setSideDishModalVisible(false);
          setSelectedProduct(null);
          setSelectedSideDish(null);
        }}
        okText="Добави"
        cancelText="Отказ"
      >
        <div style={{ marginBottom: '16px' }}>
          <p><strong>{selectedProduct?.name}</strong></p>
          <p style={{ color: '#4a4a4a', fontSize: '14px' }}>Моля, изберете гарнитура:</p>
        </div>
        <Radio.Group
          value={selectedSideDish?.id}
          onChange={(e) => {
            const sideDish = getSideDishes().find(sd => sd.id === e.target.value);
            setSelectedSideDish(sideDish);
          }}
          style={{ width: '100%' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {getSideDishes().map((sideDish) => (
              <Radio key={sideDish.id} value={sideDish.id} style={{ fontSize: '15px' }}>
                {sideDish.name}
              </Radio>
            ))}
          </div>
        </Radio.Group>
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
          * Гарнитурата е включена в цената на ястието
        </p>
      </Modal>

      <Pizza3x1Modal
        open={flavorModalVisible}
        product={selectedProduct}
        products={products}
        onCancel={() => {
          setFlavorModalVisible(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleFlavorConfirm}
      />
    </section>
  );
};

export default MenuSection;
