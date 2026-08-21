'use client';

import { default as showAToast } from '@/components/common/showAToast';
import Pizza3x1Modal from '@/components/Pizza3x1Modal';
import { useCategories } from '@/context/CategoriesContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { useObednoMenuSchedule } from '@/hooks/useObednoMenuSchedule';
import { canOrderObednoProduct, getObednoMenuClosedMessage } from '@/lib/obednoMenuSchedule';
import {
  buildPizza3x1FlavorNames,
  buildPizza3x1ItemKey,
  buildPizza3x1ItemName,
  isPizza3x1Product,
  isValidPizza3x1FlavorSelection,
} from '@/lib/pizza3x1';
import { formatOrderDate } from '@/utils/orderNumberUtils';
import { Button, Modal, Radio } from 'antd';
import { get, push, ref, set } from 'firebase/database';
import { useState } from "react";
import { rtdb } from '../../lib/firebase';

const ProductAddToCart = ({ product }) => {
  const { user, userDetails } = useUser();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { isObednoOpen } = useObednoMenuSchedule();
  const [addingToCart, setAddingToCart] = useState(false);
  const [sideDishModalVisible, setSideDishModalVisible] = useState(false);
  const [flavorModalVisible, setFlavorModalVisible] = useState(false);
  const [selectedSideDish, setSelectedSideDish] = useState(null);

  const is3x1 = isPizza3x1Product(product);

  const getSideDishes = () => {
    return products.filter(p => p.isSideDish === true);
  };

  const handleAddToCartClick = () => {
    if (!product) return;

    if (!product.price) {
      showAToast("error", "Цената не е зададена за продукта");
      return;
    }

    if (!canOrderObednoProduct(product, categories, isObednoOpen)) {
      showAToast('warning', getObednoMenuClosedMessage());
      return;
    }

    if (is3x1) {
      setFlavorModalVisible(true);
      return;
    }

    if (product.requiresSideDish) {
      setSideDishModalVisible(true);
      return;
    }

    handleAddToCart(null);
  };

  const handleAddToCart = async (sideDish, flavors = null) => {
    if (!product) return;

    if (!canOrderObednoProduct(product, categories, isObednoOpen)) {
      showAToast('warning', getObednoMenuClosedMessage());
      return;
    }

    const withFlavors = isPizza3x1Product(product) && isValidPizza3x1FlavorSelection(flavors);

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

      const flavorIds = withFlavors ? flavors.map((f) => f.id) : null;
      const flavorNames = withFlavors ? buildPizza3x1FlavorNames(flavors) : null;
      const productName = withFlavors
        ? buildPizza3x1ItemName(product.name, flavors)
        : (sideDish ? `${product.name} (с ${sideDish.name})` : product.name);
      const baseProductPrice = parseFloat(product.price);
      const productImage = product.image || "/images/no-image.png";
      const itemKey = withFlavors
        ? buildPizza3x1ItemKey(product.id, flavorIds)
        : (sideDish ? `${product.id}_${sideDish.id}` : product.id);

      if (!Number.isFinite(baseProductPrice)) {
        showAToast("error", "Цената не е валидна");
        return;
      }

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
            value: totalProductPrice,
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
            flavorIds: withFlavors ? flavorIds : null,
            flavorNames: withFlavors ? flavorNames : null,
            isPizza3x1: withFlavors || null,
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
          order_date: formatOrderDate(),
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
        const orderData = orderSnapshot.val();
        const existingItems = orderData.items || {};
        
        const existingItem = existingItems[itemKey];
        const currentQuantity = Number(existingItem?.quantity) || 0;
        
        const updatedItems = {
          ...existingItems,
          [itemKey]: {
            name: productName,
            quantity: currentQuantity + 1,
            value: totalProductPrice,
            image: productImage,
            productId: product.id,
            sideDishId: sideDish ? sideDish.id : null,
            sideDishName: sideDish ? sideDish.name : null,
            flavorIds: withFlavors ? flavorIds : null,
            flavorNames: withFlavors ? flavorNames : null,
            isPizza3x1: withFlavors || null,
          },
        };

        packagingItems.forEach((packaging) => {
          const packagingKey = `${itemKey}_packaging_${packaging.id}`;
          const existingPackaging = existingItems[packagingKey];
          
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
          const basePrice = parseFloat(item.value) || 0;
          const quantity = Number(item.quantity) || 0;
          return total + basePrice * quantity;
        }, 0);

        await set(ref(rtdb, `orders/${orderKey}`), {
          ...orderData,
          items: updatedItems,
          total: updatedTotal,
          order_date: formatOrderDate(),
        });

        showAToast("success", "Продуктът е добавен в количката");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showAToast("error", "Грешка при добавяне в количката");
    } finally {
      setAddingToCart(false);
      setSideDishModalVisible(false);
      setFlavorModalVisible(false);
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

      <Pizza3x1Modal
        open={flavorModalVisible}
        product={product}
        products={products}
        confirmLoading={addingToCart}
        onCancel={() => setFlavorModalVisible(false)}
        onConfirm={(flavors) => handleAddToCart(null, flavors)}
      />
    </>
  );
};

export default ProductAddToCart;
