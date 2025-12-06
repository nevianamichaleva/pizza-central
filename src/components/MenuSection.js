"use client";

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button } from "antd";
import { get, push, ref, set, update } from "firebase/database";
import { useState, useEffect } from 'react';
import { rtdb } from "../../lib/firebase";
import showAToast from "../components/common/showAToast";

const MenuSection = () => {
  const STORAGE_KEY = 'menuActiveTab';
  const DEFAULT_TAB = "menu-Пици";
  
  // Initialize activeTab from localStorage or use default
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(STORAGE_KEY);
      return savedTab || DEFAULT_TAB;
    }
    return DEFAULT_TAB;
  });
  
  const [subcategoryActiveTab, setSubcategoryActiveTab] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const { products } = useProducts();
  const { categories } = useCategories();
  const { user, userDetails } = useUser();

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

  async function handleAddProduct(product) {
    const ordersRef = ref(rtdb, 'orders');
    const productPrice = normalizePrice(product.price ?? product.value ?? product.basePrice);

    if (productPrice === null) {
      showAToast("error", "Този продукт няма валидна цена и не може да бъде добавен.");
      console.error("Invalid product price", product);
      return;
    }

    const productImage = product.image ?? product.img ?? product.url ?? "/images/no-image.png";

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

        const newOrder = {
          items: {
            [product.id]: {
              name: product.name,
              quantity: 1,
              value: productPrice,
              image: productImage,
            },
          },
          order_date: new Date().toLocaleString(),
          status: "pending",
          total: productPrice,
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

        const existingItem = currentItems[product.id];
        const currentQuantity = Number(existingItem?.quantity) || 0;
        const updatedItems = {
          ...currentItems,
          [product.id]: {
            name: product.name,
            quantity: currentQuantity + 1,
            value: productPrice,
            image: productImage,
          },
        };

        const updatedTotal = Object.values(updatedItems).reduce((total, item) => {
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


  return (
    <section id="menu" className="menu section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Ресторант-пицария Централ град Добрич</h2>
        <p><span>Нашето</span> <span className="description-title">меню</span></p>
      </div>

      <div className="container">
        <ul className="nav nav-tabs d-flex justify-content-center" data-aos="fade-up" data-aos-delay="100">
          {categories.map((category) => (
            <li key={category.id} className="nav-item">
              <a
                className={`nav-link ${activeTab === `menu-${category.name}` ? 'active show' : ''}`}
                onClick={() => handleTabClick(`menu-${category.name}`)}
              >
                <h4>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h4>
              </a>
            </li>
          ))}
        </ul>

        <div className="tab-content" data-aos="fade-up" data-aos-delay="200">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`tab-pane fade ${activeTab === `menu-${category.name}` ? 'active show' : ''}`}
              id={`menu-${category.name}`}
            >
              <div className="tab-header text-center">
                <p>Меню</p>
                <h3>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h3>
              </div>
              {category?.children && category.children?.length &&
                <ul className="nav nav-tabs d-flex justify-content-center" data-aos="fade-up" data-aos-delay="100">
                  {category.children.map((subcategory) => (
                    <li key={subcategory.id} className="nav-item">
                      <a
                        href="#"
                        className={`nav-link ${subcategoryActiveTab === `menu-${subcategory.name}` ? 'active show' : ''}`}
                        onClick={() => handleSubcategoryClick(subcategory)}
                      >
                        <h4>{subcategory.name.charAt(0).toUpperCase() + subcategory.name.slice(1)}</h4>
                      </a>
                    </li>
                  ))}
                </ul>
              }
              <div className="row gy-5">
                {subcategoryActiveTab ?
                  <>
                    {products.filter((item) => item?.subcategory == subcategory.id).map((item, index) => (
                      <div key={index} className="col-lg-4 menu-item">
                        <a href={item.image ? item.image : '#'} className="glightbox">
                          <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                        </a>
                        <h4>{item.name}</h4>
                        <p className="ingredients">{item.description || item.ingredients}</p>
                        {formatPrice(item.price) && (
                          <p className="price">{formatPrice(item.price)}</p>
                        )}

                        <Button
                          type="primary"
                          onClick={() => handleAddProduct(item)}
                          shape="circle"
                          icon={<ShoppingCartOutlined />}
                          style={{
                            backgroundColor: '#1890ff',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'background-color 0.3s, transform 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#40a9ff';
                            e.target.style.transform = 'scale(1.05)';
                            const icon = e.target.querySelector('svg');
                            if (icon) {
                              icon.style.transform = 'translateX(5px)';
                              icon.style.transition = 'transform 0.2s';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1890ff';
                            e.target.style.transform = 'scale(1)';
                            const icon = e.target.querySelector('svg');
                            if (icon) {
                              icon.style.transform = 'translateX(0)';
                            }
                          }}
                          size="large"
                        >
                          Добави
                        </Button>
                      </div>
                    ))}
                  </>
                  :
                  <>
                    {products.filter((item) => item.category == category.id).map((item, index) => (
                      <div key={index} className="col-lg-4 menu-item">
                        <a href={item.url || "#"} className="glightbox">
                          <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                        </a>
                        <h4>{item.name}</h4>

                        <p className="ingredients">{item.ingredients}</p>
                        {formatPrice(item.price) && (
                          <p className="price">{formatPrice(item.price)}</p>
                        )}

                        <Button
                          type="primary"
                          onClick={() => handleAddProduct(item)}
                          shape="circle"
                          icon={<ShoppingCartOutlined />}
                          style={{
                            backgroundColor: '#1890ff',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'background-color 0.3s, transform 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#40a9ff';
                            e.target.style.transform = 'scale(1.05)';
                            const icon = e.target.querySelector('svg');
                            if (icon) {
                              icon.style.transform = 'translateX(5px)';
                              icon.style.transition = 'transform 0.2s';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1890ff';
                            e.target.style.transform = 'scale(1)';
                            const icon = e.target.querySelector('svg');
                            if (icon) {
                              icon.style.transform = 'translateX(0)';
                            }
                          }}
                          size="large"
                        >
                          Добави
                        </Button>
                      </div>
                    ))}
                  </>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
