"use client";

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Modal, Select } from "antd";
import { get, push, ref, set, update } from "firebase/database";
import { useEffect, useState } from 'react';
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
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSideDish, setSelectedSideDish] = useState(null);
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
      // Allow adding without side dish if user doesn't select one
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
    
    // Create a unique key for this item (include side dish in key if present)
    const itemKey = sideDish ? `${product.id}_${sideDish.id}` : product.id;

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

        const newOrder = {
          items: {
            [itemKey]: {
              name: itemName,
              quantity: 1,
              value: productPrice,
              image: productImage,
              productId: product.id,
              sideDishId: sideDish ? sideDish.id : null,
              sideDishName: sideDish ? sideDish.name : null,
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

        const itemName = sideDish 
          ? `${product.name} (с ${sideDish.name})`
          : product.name;

        const existingItem = currentItems[itemKey];
        const currentQuantity = Number(existingItem?.quantity) || 0;
        const updatedItems = {
          ...currentItems,
          [itemKey]: {
            name: itemName,
            quantity: currentQuantity + 1,
            value: productPrice,
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
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


  // Render product card
  const renderProductCard = (item, index) => (
    <div key={index} className="col-lg-4 menu-item">
      <a href={item.url || item.image || "#"} className="glightbox">
        <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
      </a>
      <h4>{item.name}</h4>
      <p className="ingredients">{item.description || item.ingredients}</p>
      {formatPrice(item.price) && (
        <p className="price">{formatPrice(item.price)}</p>
      )}
      <Button
        type="primary"
        onClick={() => handleProductClick(item)}
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
  );

  return (
    <section id="menu" className="menu section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Ресторант-пицария Централ град Добрич</h2>
        <p><span>Нашето</span> <span className="description-title">меню</span></p>
      </div>

      <div className="container">
        {/* Desktop Tab Navigation */}
        <ul className="nav nav-tabs d-flex justify-content-center menu-desktop-tabs" data-aos="fade-up" data-aos-delay="100">
          {categories
            .filter((category) => category.name !== "Гарнитури")
            .map((category) => (
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

        {/* Desktop Tab Content */}
        <div className="tab-content menu-desktop-content" data-aos="fade-up" data-aos-delay="200">
          {categories
            .filter((category) => category.name !== "Гарнитури")
            .map((category) => (
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
                    {products.filter((item) => item?.subcategory == subcategory.id && !item.isSideDish).map((item, index) => renderProductCard(item, index))}
                  </>
                  :
                  <>
                    {products.filter((item) => item.category == category.id && !item.isSideDish).map((item, index) => renderProductCard(item, index))}
                  </>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Category List with Sliders */}
        <div className="menu-mobile-categories">
          {categories
            .filter((category) => category.name !== "Гарнитури")
            .map((category) => {
              const categoryProducts = products.filter((item) => item.category == category.id && !item.isSideDish);
              
              return (
                <div key={category.id} className="menu-mobile-category-section">
                  <h3 className="menu-mobile-category-title">
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </h3>
                  <div className="menu-mobile-products-slider">
                    {categoryProducts.map((item, index) => (
                      <div key={index} className="menu-mobile-product-item">
                        <a href={item.url || item.image || "#"} className="glightbox">
                          <img src={item.image ? item.image : '/images/no-image.png'} className="menu-img img-fluid" alt={item.name} />
                        </a>
                        <h4>{item.name}</h4>
                        <p className="ingredients">{item.description || item.ingredients}</p>
                        {formatPrice(item.price) && (
                          <p className="price">{formatPrice(item.price)}</p>
                        )}
                        <Button
                          type="primary"
                          onClick={() => handleProductClick(item)}
                          shape="circle"
                          icon={<ShoppingCartOutlined />}
                          style={{
                            backgroundColor: '#1890ff',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'background-color 0.3s, transform 0.2s',
                            width: '100%',
                          }}
                          size="large"
                        >
                          Добави
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
          <p style={{ color: '#666', fontSize: '14px' }}>Моля, изберете гарнитура:</p>
        </div>
        <Select
          placeholder="Изберете гарнитура"
          value={selectedSideDish?.id}
          onChange={(value) => {
            const sideDish = getSideDishes().find(sd => sd.id === value);
            setSelectedSideDish(sideDish);
          }}
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {getSideDishes().map((sideDish) => (
            <Select.Option key={sideDish.id} value={sideDish.id}>
              {sideDish.name}
            </Select.Option>
          ))}
        </Select>
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
          * Гарнитурата е включена в цената на ястието
        </p>
      </Modal>
    </section>
  );
};

export default MenuSection;
