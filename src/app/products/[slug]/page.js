'use client';

import { default as showAToast } from '@/components/common/showAToast';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { Button, Modal, Radio } from 'antd';
import { get, push, ref, set } from 'firebase/database';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

import styles from "./page.module.css";

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

const ProductDetailsPage = ({ params }) => {
  const router = useRouter();
  const { user, userDetails } = useUser();
  const { products } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [selectedSideDish, setSelectedSideDish] = useState(null);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params;
      const slugValue = resolvedParams?.slug || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '');
      setSlug(slugValue);
    };
    getSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const productsRef = ref(rtdb, "products");
        const snapshot = await get(productsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const foundProduct = Object.entries(data).find(([key, value]) => value.slug === slug);
          
          if (foundProduct) {
            const [productId, productData] = foundProduct;
            setProduct({ 
              id: productId, 
              ...productData
            });
          } else {
            router.push('/our-menu');
          }
        } else {
          router.push('/our-menu');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        router.push('/our-menu');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, router]);

  const getSideDishes = () => {
    return products.filter(p => p.isSideDish === true);
  };

  const handleAddToCartClick = () => {
    if (!product || !product.price) {
      showAToast("error", "Цената не е зададена за продукта");
      return;
    }

    if (product.requiresSideDish) {
      setSideDishModalVisible(true);
      return;
    }

    handleAddToCart(null);
  };

  const handleAddToCart = async (sideDish) => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const ordersRef = ref(rtdb, "orders");
      let orderKey = typeof window !== "undefined" ? window.localStorage.getItem("cartId") : null;

      if (!orderKey) {
        const newOrderRef = push(ordersRef);
        orderKey = newOrderRef.key;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cartId", orderKey);
        }
      }

      const productName = product.name;
      const productPrice = parseFloat(product.price);
      const productImage = product.image || "/images/no-image.png";
      const itemKey = `${product.id}_${sideDish ? sideDish.id : 'no_side'}`;

      const orderSnapshot = await get(ref(rtdb, `orders/${orderKey}`));
      
      if (!orderSnapshot.exists()) {
        const newOrderRef = push(ordersRef);
        orderKey = newOrderRef.key;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cartId", orderKey);
        }

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
        };

        // Add packaging items linked to this product
        let packagingTotal = 0;
        if (product.packagingIds && Array.isArray(product.packagingIds) && product.packagingIds.length > 0) {
          const packagingRef = ref(rtdb, "packaging");
          const packagingSnapshot = await get(packagingRef);
          
          if (packagingSnapshot.exists()) {
            const packagingData = packagingSnapshot.val();
            product.packagingIds.forEach((packagingId) => {
              const packaging = packagingData[packagingId];
              if (packaging) {
                const packagingKey = `${itemKey}_packaging_${packagingId}`;
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
                  packagingId: packagingId,
                };
                packagingTotal += parseFloat(packaging.price);
              }
            });
          }
        }

        const newOrder = {
          items: items,
          order_date: new Date().toLocaleString(),
          status: "pending",
          total: productPrice + packagingTotal,
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
          existingItems[itemKey].quantity += 1;
        } else {
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

        // Add or update packaging items linked to this product
        if (product.packagingIds && Array.isArray(product.packagingIds) && product.packagingIds.length > 0) {
          const packagingRef = ref(rtdb, "packaging");
          const packagingSnapshot = await get(packagingRef);
          
          if (packagingSnapshot.exists()) {
            const packagingData = packagingSnapshot.val();
            product.packagingIds.forEach((packagingId) => {
              const packaging = packagingData[packagingId];
              if (packaging) {
                const packagingKey = `${itemKey}_packaging_${packagingId}`;
                const existingPackaging = existingItems[packagingKey];
                
                if (existingPackaging) {
                  existingItems[packagingKey] = {
                    ...existingPackaging,
                    quantity: (Number(existingPackaging.quantity) || 0) + 1,
                  };
                } else {
                  existingItems[packagingKey] = {
                    name: packaging.name,
                    quantity: 1,
                    value: parseFloat(packaging.price),
                    image: "/images/no-image.png",
                    productId: null,
                    sideDishId: null,
                    sideDishName: null,
                    isPackaging: true,
                    linkedToItemId: itemKey,
                    packagingId: packagingId,
                  };
                }
              }
            });
          }
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

  if (!product) {
    return null;
  }

  return (
    <section className="section">
      <div className="container">
        <Link className={styles.backLink} href="/our-menu">
          &larr; Назад към менюто
        </Link>
        <div className={styles.hero}>
          <div className={styles.imageWrapper}>
            <Image
              src={product.image || "/images/no-image.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.heroImage}
              priority
            />
          </div>
          <div className={styles.heroContent}>
            <h1>{product.name}</h1>
            
            {product.price && (
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c41d7f', marginBottom: '15px' }}>
                {parseFloat(product.price).toFixed(2)} лв / {(parseFloat(product.price) / 1.95583).toFixed(2)} €
              </div>
            )}
            
            {product.weight && (
              <div style={{ marginBottom: '15px', fontSize: '16px' }}>
                <strong>Грамаж:</strong> {product.weight} {product.weightUnit || 'г'}
              </div>
            )}
            
            {product.ingredients && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Съставки:</strong>
                <p style={{ marginTop: '5px', lineHeight: '1.6' }}>{product.ingredients}</p>
              </div>
            )}
            
            {product.description && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Описание:</strong>
                <p style={{ marginTop: '5px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
            
            {product.allergens && Array.isArray(product.allergens) && product.allergens.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Алергени:</strong>
                <p style={{ marginTop: '5px', lineHeight: '1.6', color: '#d32f2f' }}>
                  {product.allergens.map(allergenValue => getAllergenLabel(allergenValue)).join(', ')}
                </p>
              </div>
            )}
            
            {product.price && (
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
          <p><strong>{product?.name}</strong></p>
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

export default ProductDetailsPage;

