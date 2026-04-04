"use client";

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Modal, Radio } from "antd";
import { get, push, ref, set, update } from "firebase/database";
import Link from "next/link";
import { useEffect, useMemo, useState } from 'react';
import { rtdb } from "../../lib/firebase";
import showAToast from "./common/showAToast";
import MobileProductsSlider from "./MobileProductsSlider";

const MenuPreview = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { user, userDetails } = useUser();
  const [packagingData, setPackagingData] = useState({});
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSideDish, setSelectedSideDish] = useState(null);

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

  // Helper function to check if product belongs to a category
  // Supports both old format (category) and new format (categories array)
  const productBelongsToCategory = (product, categoryId) => {
    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories.includes(categoryId);
    }
    // Fallback to old format
    return product.category === categoryId;
  };

  // Get random products with images (always 6 items)
  const randomProducts = useMemo(() => {
    // Find "Сосове" category
    const saucesCategory = categories.find(cat => 
      cat.name && (cat.name.toLowerCase() === 'сосове' || cat.name.toLowerCase() === 'sauces')
    );
    const saucesCategoryId = saucesCategory?.id;

    // Filter products that have images and are for delivery
    const productsWithImages = products.filter((item) => {
      if (item.isSideDish) return false;
      if (!item.image || item.image === '/images/no-image.png') return false;
      
      // Exclude products from "Сосове" category
      if (saucesCategoryId && productBelongsToCategory(item, saucesCategoryId)) {
        return false;
      }
      
      // If both fields are missing, show the product in both menus
      const hasDeliveryField = item.forDelivery !== undefined && item.forDelivery !== null;
      const hasRestaurantField = item.forRestaurant !== undefined && item.forRestaurant !== null;
      if (!hasDeliveryField && !hasRestaurantField) {
        return true;
      }
      // Show if forDelivery is true
      return item.forDelivery === true;
    });

    // Shuffle and take 6 random items (or all available if less than 6)
    const shuffled = [...productsWithImages].sort(() => Math.random() - 0.5);
    const count = Math.min(6, shuffled.length);
    return shuffled.slice(0, count);
  }, [products, categories]);

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

  // Get display price (product price + packaging price for delivery items)
  const getDisplayPrice = (product) => {
    const basePrice = normalizePrice(product.price);
    if (basePrice === null) {
      return null;
    }

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

  // Get side dishes (products with isSideDish: true)
  const getSideDishes = () => {
    return products.filter(p => p.isSideDish === true);
  };

  const handleProductClick = (product) => {
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
      handleAddProduct(selectedProduct, null);
      setSideDishModalVisible(false);
      setSelectedProduct(null);
      setSelectedSideDish(null);
    }
  };

  async function handleAddProduct(product, sideDish) {
    const ordersRef = ref(rtdb, 'orders');
    const productPrice = normalizePrice(product.price ?? product.value ?? product.basePrice);

    if (productPrice === null) {
      showAToast("error", "Този продукт няма валидна цена и не може да бъде добавен.");
      console.error("Invalid product price", product);
      return;
    }

    const productImage = product.image ?? product.img ?? product.url ?? "/images/no-image.png";
    
    const itemKey = sideDish ? `${product.id}_${sideDish.id}` : product.id;

    let packagingItems = [];
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

        const itemName = sideDish 
          ? `${product.name} (с ${sideDish.name})`
          : product.name;

        let packagingTotal = 0;
        packagingItems.forEach((packaging) => {
          packagingTotal += parseFloat(packaging.price) || 0;
        });
        const totalProductPrice = productPrice + packagingTotal;

        const items = {
          [itemKey]: {
            name: itemName,
            quantity: 1,
            value: totalProductPrice,
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
          },
        };

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
            hiddenInCart: true,
          };
        });

        const newOrder = {
          items: items,
          order_date: new Date().toLocaleString(),
          status: "pending",
          total: totalProductPrice,
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

        const itemName = sideDish 
          ? `${product.name} (с ${sideDish.name})`
          : product.name;

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
            value: totalProductPrice,
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
          },
        };

        packagingItems.forEach((packaging) => {
          const packagingKey = `${itemKey}_packaging_${packaging.id}`;
          const existingPackaging = currentItems[packagingKey];
          
          if (existingPackaging) {
            updatedItems[packagingKey] = {
              ...existingPackaging,
              quantity: (Number(existingPackaging.quantity) || 0) + 1,
              hiddenInCart: true,
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
              hiddenInCart: true,
            };
          }
        });

        const updatedTotal = Object.values(updatedItems).reduce((total, item) => {
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

  if (randomProducts.length === 0) {
    return null;
  }

  return (
    <section id="menu-preview" className="menu section">
      <div className="container section-title">
        <h2>Ресторант-пицария Централ град Добрич</h2>
        <p>
          <span>Акценти от нашето</span>{' '}
          <span className="description-title">меню</span>
        </p>
      </div>

      <p className="editorial-lead menu-section-intro">
        Подбрани предложения за ресторанта и за дома — приготвени с внимание към вкуса и качеството.
      </p>

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/for-home">
            <Button
              type="primary"
              size="large"
              style={{
                fontSize: '18px',
                padding: '12px 40px',
                height: 'auto',
                borderRadius: '8px',
              }}
            >
              Виж цялото меню
            </Button>
          </Link>
        </div>

        {/* Desktop view */}
        <div className="row gy-5 menu-desktop-content">
          {randomProducts.map((item, index) => (
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
                  <div className="menu-card-title" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px', fontFamily: 'var(--heading-font)' }}>
                    {item.name}
                  </div>
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
                  <div className="menu-card-footer">
                    {formatPrice(getDisplayPrice(item)) && (
                      <p className="menu-card-price">{formatPrice(getDisplayPrice(item))}</p>
                    )}
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
          ))}
        </div>

        {/* Mobile view with horizontal scroll */}
        <div className="menu-mobile-categories">
          <MobileProductsSlider>
            {randomProducts.map((item, index) => (
              <Link 
                key={index} 
                href={item.slug ? `/products/${item.slug}` : '#'} 
                className="menu-mobile-product-item menu-mobile-product-link"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '10px', fontFamily: 'var(--default-font)', lineHeight: '1.3' }}>{item.name}</div>
                <div style={{ flex: 1 }}></div>
                {getDisplayPrice(item) && (() => {
                  const price = getDisplayPrice(item);
                  const priceInLv = price.toFixed(2);
                  const priceInEuro = (price / 1.95583).toFixed(2);
                  return (
                    <div className="price" style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '8px', lineHeight: '1.4' }}>
                      <div style={{ fontSize: '13px', color: '#333' }}>{priceInEuro} €</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>
                        {priceInLv}лв{item.weight ? ` | ${item.weight} ${item.weightUnit || 'г'}` : ''}
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
    </section>
  );
};

export default MenuPreview;
