"use client";

import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button } from "antd";
import { get, push, ref, set, update } from "firebase/database";
import { useState } from 'react';
import { rtdb } from "../../lib/firebase";
import showAToast from "../components/common/showAToast";

const MenuSection = () => {
  const [activeTab, setActiveTab] = useState("menu-Пици");
  const [subcategoryActiveTab, setSubcategoryActiveTab] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const { products } = useProducts();
  const { categories } = useCategories();
  const { user, userDetails } = useUser();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSubcategoryActiveTab(null);
  };

  const handleSubcategoryClick = (tab) => {
    setSubcategory(tab);
    setSubcategoryActiveTab(`menu-${tab.name}`)
  }

  async function handleAddProduct(product) {
    const ordersRef = ref(rtdb, 'orders');

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

      if (!orderKey) {
        const newOrderRef = push(ordersRef);
        orderKey = newOrderRef.key;
        localStorage.setItem("cartId", orderKey);
      
        const newOrder = {
          items: {
            [product.id]: {
              name: product.name,
              quantity: 1,
              value: parseFloat(product.price), 
              image: product.image,
            },
          },
          order_date: new Date().toLocaleString(),
          status: "pending",
          total: parseFloat(product.price), 
          user_id: user ? user.uid : null,
          user_email: user ? user.email : null,
          user_phone: userDetails ? userDetails.phone : null,
          user_address: userDetails ? userDetails.address : null,
          id: orderKey,
        };
      
        await set(newOrderRef, newOrder);
        console.log("New order created successfully!");
      } else {
        const orderRef = ref(rtdb, `orders/${orderKey}/items/${product.id}`);
        const orderTotalRef = ref(rtdb, `orders/${orderKey}/total`); 
      
        const itemSnapshot = await get(orderRef);
        const orderTotalSnapshot = await get(orderTotalRef);
      
        let newTotal = orderTotalSnapshot.exists() ? parseFloat(orderTotalSnapshot.val()) : 0;
      
        if (itemSnapshot.exists()) {
          const existingItem = itemSnapshot.val();
          const updatedQuantity = existingItem.quantity + 1;
          const updatedValue = existingItem.value + product.price;
      
          await update(orderRef, {
            quantity: updatedQuantity,
            value: updatedValue,
          });
      
          console.log("Product quantity updated in existing order.");
          newTotal = parseFloat(newTotal) + parseFloat(product.price); 
        } else {
          await set(orderRef, {
            name: product.name,
            quantity: 1,
            value: product.price,
            image: product.image,
          });
      
          showAToast("success", "Продуктът е добавен в количката");
          console.log("New product added to existing order.");
          newTotal = parseFloat(newTotal) + parseFloat(product.price); 
        }
      
        // ✅ Update order total at `orders/${orderKey}/total`
        await update(ref(rtdb, `orders/${orderKey}`), { total: newTotal });
        console.log("Order total updated:", newTotal);
      }
    } catch (error) {
      showAToast("error", "Грешка, обадете се 0895 516401 или 0893 315201");
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
                      <div key={index} className="col-lg-4 menu-item">{console.log(products, subcategory)}
                        <a href={item.img} className="glightbox">
                          <img src={item.image} className="menu-img img-fluid" alt={item.name} />
                        </a>
                        <h4>{item.name}</h4>
                        <p className="ingredients">{item.description}</p>
                        <p className="price">{item.price}</p>
                      </div>
                    ))}
                  </>
                  :
                  <>
                    {products.filter((item) => item.category == category.id).map((item, index) => (
                      <div key={index} className="col-lg-4 menu-item">
                        <a href={item.url} className="glightbox">
                          <img src={item.image} className="menu-img img-fluid" alt={item.name} />
                        </a>
                        <h4>{item.name}</h4>

                        <p className="ingredients">{item.ingredients}</p>
                        <p className="price">
                          {item.price} лв. / {(item.price / 1.95583).toFixed(2)} €
                        </p>

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
