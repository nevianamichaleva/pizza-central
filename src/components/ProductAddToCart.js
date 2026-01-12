'use client';

import { default as showAToast } from '@/components/common/showAToast';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { Button, Modal, Radio } from 'antd';
import { get, push, ref, set } from 'firebase/database';
import { useState } from "react";
import { rtdb } from '../../lib/firebase';

const ProductAddToCart = ({ product }) => {
  const { user, userDetails } = useUser();
  const { products } = useProducts();
  const [addingToCart, setAddingToCart] = useState(false);
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [selectedSideDish, setSelectedSideDish] = useState(null);

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

      const productName = sideDish 
        ? `${product.name} (с ${sideDish.name})`
        : product.name;
      const baseProductPrice = parseFloat(product.price);
      const productImage = product.image || "/images/no-image.png";
      const itemKey = sideDish ? `${product.id}_${sideDish.id}` : product.id;

      // Fetch packaging items for this product
      let packagingItems = [];
      let packagingTotal = 0;
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
                    packagingTotal += parseFloat(packaging.price) || 0;
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

      // Total price includes packaging
      const totalProductPrice = baseProductPrice + packagingTotal;

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
            value: totalProductPrice, // Include packaging price in product price
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
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
          order_date: new Date().toLocaleString(),
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
        const orderData = orderSnapshot.val();
        const existingItems = orderData.items || {};
        
        const existingItem = existingItems[itemKey];
        const currentQuantity = Number(existingItem?.quantity) || 0;
        
        const updatedItems = {
          ...existingItems,
          [itemKey]: {
            name: productName,
            quantity: currentQuantity + 1,
            value: totalProductPrice, // Include packaging price in product price
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
          },
        };

        // Add or update packaging items linked to this product (hidden in cart but kept for email and admin)
        packagingItems.forEach((packaging) => {
          const packagingKey = `${itemKey}_packaging_${packaging.id}`;
          const existingPackaging = existingItems[packagingKey];
          
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

        // Recalculate total - exclude packaging items that are hidden in cart
        const updatedTotal = Object.values(updatedItems).reduce((total, item) => {
          // Exclude packaging items that are hidden in cart (their price is already included in product price)
          if (item.isPackaging && item.hiddenInCart) {
            return total;
          }
          const basePrice = parseFloat(item.value) || 0;
          const quantity = Number(item.quantity) || 0;
          return total + basePrice * quantity;
        }, 0);

        await set(ref(rtdb, `orders/${orderKey}`), {
          ...orderData,
          items: updatedItems,
          total: updatedTotal,
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

  if (!product || !product.price) {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        size="large"
        onClick={handleAddToCartClick}
        loading={addingToCart}
        style={{ marginTop: '20px', width: '100%' }}
      >
        Добави в количката
      </Button>

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
    </>
  );
};

export default ProductAddToCart;

