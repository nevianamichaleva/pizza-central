'use client';

import { default as showAToast } from '@/components/common/showAToast';
import { useUser } from '@/context/UserContext';
import { useProducts } from '@/context/ProductsContext';
import { useCategories } from '@/context/CategoriesContext';
import { Button, Modal, Radio, Select } from 'antd';
import { get, push, ref, set, update } from 'firebase/database';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

import styles from "./page.module.css";

const NewDishDetailsPage = ({ params }) => {
  const router = useRouter();
  const { user, userDetails } = useUser();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [selectedSideDish, setSelectedSideDish] = useState(null);
  const dishId = params?.id || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '');

  useEffect(() => {
    if (!dishId) return;

    const fetchDish = async () => {
      try {
        const dishRef = ref(rtdb, `new-dishes/${dishId}`);
        const dishSnapshot = await get(dishRef);

        if (dishSnapshot.exists()) {
          const dishData = dishSnapshot.val();
          
          // Fetch product data if productId exists
          if (dishData.productId) {
            const productRef = ref(rtdb, `products/${dishData.productId}`);
            const productSnapshot = await get(productRef);
            
            if (productSnapshot.exists()) {
              const productData = productSnapshot.val();
              setDish({ 
                id: dishId, 
                ...dishData,
                product: {
                  id: dishData.productId,
                  ...productData
                }
              });
            } else {
              setDish({ id: dishId, ...dishData });
            }
          } else {
            setDish({ id: dishId, ...dishData });
          }
        } else {
          router.push('/new-dishes');
        }
      } catch (error) {
        console.error("Error fetching dish:", error);
        router.push('/new-dishes');
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [dishId, router]);

  const getSideDishes = () => {
    return products.filter(p => p.isSideDish === true);
  };

  // Calculate packaging box price based on product type
  const getPackagingPrice = (product) => {
    if (!product) return 0.50;
    
    // Check if product is a sauce (by ID or name)
    const isSauce = (product.id && product.id.startsWith('sauce_')) || 
                    (product.name && product.name.toLowerCase().includes('сос'));
    
    if (isSauce) {
      return 0.10;
    }
    
    // Find the category of the product
    const productCategory = categories.find(cat => cat.id === product.category);
    const isPizza = productCategory && productCategory.name && 
                    (productCategory.name.toLowerCase().includes('пиц') || 
                     productCategory.name.toLowerCase() === 'пици');
    
    if (isPizza) {
      // Check for size in product name
      const productName = (product.name || '').toUpperCase();
      if (productName.includes('XXL')) {
        return 1.50;
      } else if (productName.includes('XL')) {
        return 1.00;
      }
    }
    
    // Default price for all other items
    return 0.50;
  };

  const handleAddToCartClick = () => {
    if (!dish || !dish.productId) {
      showAToast("error", "Продуктът не е свързан с това ястие");
      return;
    }

    const product = dish.product;
    if (!product || !product.price) {
      showAToast("error", "Цената не е зададена за продукта");
      return;
    }

    if (product.requiresSideDish) {
      setSideDishModalVisible(true);
    } else {
      handleAddToCart(null);
    }
  };

  const handleAddToCart = async (sideDish) => {
    if (!dish || !dish.productId) {
      showAToast("error", "Продуктът не е свързан с това ястие");
      return;
    }

    const product = dish.product;
    if (!product || !product.price) {
      showAToast("error", "Цената не е зададена за продукта");
      return;
    }

    const productPrice = parseFloat(product.price);
    const productName = sideDish 
      ? `${product.name} (с ${sideDish.name})`
      : product.name;
    const productImage = product.image || dish.img || "/images/no-image.png";
    
    // Create a unique key for this item (include side dish in key if present)
    const itemKey = sideDish ? `${product.id}_${sideDish.id}` : product.id;
    
    // Calculate packaging price
    const packagingPrice = getPackagingPrice(product);
    const packagingKey = `${itemKey}_packaging`;

    setAddingToCart(true);
    try {
      const ordersRef = ref(rtdb, 'orders');
      const snapshot = await get(ordersRef);

      let orderKey = null;
      if (typeof window !== "undefined") {
        orderKey = window.localStorage.getItem("cartId");
      }

      const emitCartUpdate = (cartId) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("cart:update", {
              detail: { cartId },
            })
          );
        }
      };

      if (!orderKey) {
        const newOrderRef = push(ordersRef);
        orderKey = newOrderRef.key;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cartId", orderKey);
        }
        emitCartUpdate(orderKey);

        const items = {
          [itemKey]: {
            name: productName,
            quantity: 1,
            value: productPrice,
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
          },
          [packagingKey]: {
            name: 'Кутия',
            quantity: 1,
            value: packagingPrice,
            image: "/images/no-image.png",
            productId: null,
            sideDishId: null,
            sideDishName: null,
            isPackaging: true,
          },
        };

        const newOrder = {
          items: items,
          order_date: new Date().toLocaleString(),
          status: "pending",
          total: productPrice + packagingPrice,
          user_id: user ? user.uid : null,
          user_email: user ? user.email : null,
          user_phone: userDetails ? userDetails.phone : null,
          user_address: userDetails ? userDetails.address : null,
          id: orderKey,
        };

        await set(newOrderRef, newOrder);
        showAToast("success", "Продуктът е добавен в количката");
      } else {
        const orderSnapshot = await get(ref(rtdb, `orders/${orderKey}`));
        
        if (!orderSnapshot.exists()) {
          // Order was deleted, create new one
          const newOrderRef = push(ordersRef);
          orderKey = newOrderRef.key;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("cartId", orderKey);
          }
          emitCartUpdate(orderKey);

          const items = {
            [itemKey]: {
              name: productName,
              quantity: 1,
              value: productPrice,
              image: productImage,
              productId: product.id,
              sideDishId: sideDish ? sideDish.id : null,
              sideDishName: sideDish ? sideDish.name : null,
            },
            [packagingKey]: {
              name: 'Кутия',
              quantity: 1,
              value: packagingPrice,
              image: "/images/no-image.png",
              productId: null,
              sideDishId: null,
              sideDishName: null,
              isPackaging: true,
            },
          };

          const newOrder = {
            items: items,
            order_date: new Date().toLocaleString(),
            status: "pending",
            total: productPrice + packagingPrice,
            user_id: user ? user.uid : null,
            user_email: user ? user.email : null,
            user_phone: userDetails ? userDetails.phone : null,
            user_address: userDetails ? userDetails.address : null,
            id: orderKey,
          };

          await set(newOrderRef, newOrder);
          showAToast("success", "Продуктът е добавен в количката");
        } else {
          const orderData = orderSnapshot.val();
          const existingItems = orderData.items || {};
          
          if (existingItems[itemKey]) {
            // Item already exists, increase quantity
            existingItems[itemKey].quantity += 1;
          } else {
            // New item
            existingItems[itemKey] = {
              name: productName,
              quantity: 1,
              value: productPrice,
              image: productImage,
              productId: product.id,
              sideDishId: sideDish ? sideDish.id : null,
              sideDishName: sideDish ? sideDish.name : null,
            };
          }

          // Add or update packaging item
          if (existingItems[packagingKey]) {
            existingItems[packagingKey] = {
              ...existingItems[packagingKey],
              quantity: (Number(existingItems[packagingKey].quantity) || 0) + 1,
            };
          } else {
            existingItems[packagingKey] = {
              name: 'Кутия',
              quantity: 1,
              value: packagingPrice,
              image: "/images/no-image.png",
              productId: null,
              sideDishId: null,
              sideDishName: null,
              isPackaging: true,
            };
          }

          // Recalculate total
          const newTotal = Object.values(existingItems).reduce((sum, item) => {
            return sum + (item.quantity * parseFloat(item.value));
          }, 0);

          await set(ref(rtdb, `orders/${orderKey}`), {
            ...orderData,
            items: existingItems,
            total: newTotal,
          });

          showAToast("success", "Продуктът е добавен в количката");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showAToast("error", "Грешка при добавяне в количката");
    } finally {
      setAddingToCart(false);
      setSideDishModalVisible(false);
      setSelectedSideDish(null);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Зареждане...</p>
        </div>
      </section>
    );
  }

  if (!dish) {
    return null;
  }

  return (
    <section className="section">
      <div className="container">
        <Link className={styles.backLink} href="/new-dishes">
          &larr; Назад към новите предложения
        </Link>
        <div className={styles.hero}>
          <div className={styles.imageWrapper}>
            <Image
              src={dish.img || "/images/no-image.png"}
              alt={dish.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.heroImage}
              priority
            />
          </div>
          <div className={styles.heroContent}>
            <h1>{dish.name}</h1>
            <span style={{ display: 'block', marginBottom: '10px', color: '#666' }}>{dish.title}</span>
            
            {dish.product && (
              <>
                {dish.product.price && (
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c41d7f', marginBottom: '15px' }}>
                    {parseFloat(dish.product.price).toFixed(2)} лв / {(parseFloat(dish.product.price) / 1.95583).toFixed(2)} €
                  </div>
                )}
                
                {dish.product.weight && (
                  <div style={{ marginBottom: '15px', fontSize: '16px' }}>
                    <strong>Грамаж:</strong> {dish.product.weight} {dish.product.weightUnit || 'г'}
                  </div>
                )}
                
                {dish.product.ingredients && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Съставки:</strong>
                    <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{dish.product.ingredients}</p>
                  </div>
                )}
                
                {dish.product.description && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Описание:</strong>
                    <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{dish.product.description}</p>
                  </div>
                )}
                
              </>
            )}
            
            {dish.description && (
              <div style={{ marginBottom: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                {/* <strong>Допълнителна информация:</strong> */}
                <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{dish.description}</p>
              </div>
            )}
            
            {dish.product && dish.product.price && (
              <Button
                type="primary"
                size="large"
                onClick={handleAddToCartClick}
                loading={addingToCart}
                style={{ marginTop: '20px', width: '100%' }}
              >
                Добави в количката
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Изберете гарнитура"
        open={sideDishModalVisible}
        onOk={() => {
          handleAddToCart(selectedSideDish);
        }}
        onCancel={() => {
          setSideDishModalVisible(false);
          setSelectedSideDish(null);
        }}
        okText="Добави"
        cancelText="Отказ"
      >
        <div style={{ marginBottom: '16px' }}>
          <p><strong>{dish?.product?.name}</strong></p>
          <p style={{ color: '#666', fontSize: '14px' }}>Моля, изберете гарнитура:</p>
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
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
          * Гарнитурата е включена в цената на ястието
        </p>
      </Modal>
    </section>
  );
};

export default NewDishDetailsPage;

