"use client"

import { useUser } from "@/context/UserContext";
import { Input, message, Select, Tooltip } from "antd";
import { get, onValue, ref, update } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { rtdb } from "../../../lib/firebase";
import showAToast from "../../components/common/showAToast";
const { TextArea } = Input;

export default function Order() {
  const { user, userDetails } = useUser();
  const [cartId, setCartId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [workingHours, setWorkingHours] = useState({ startHour: 10, endHour: 22 });
  const [deliveryPriceTiers, setDeliveryPriceTiers] = useState([
    { maxAmount: 25, fee: 5 },
    { maxAmount: null, fee: 3 }
  ]);
  const [minOrderForDelivery, setMinOrderForDelivery] = useState(25);
  const [registeredUserDiscountPercent, setRegisteredUserDiscountPercent] = useState(0);
  const [specialNotes, setSpecialNotes] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [orderType, setOrderType] = useState('delivery'); // 'pickup' or 'delivery'
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  const resolveCartId = async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedCartId = window.localStorage.getItem("cartId");

    if (storedCartId) {
      return storedCartId;
    }

    if (!user) {
      return null;
    }

    const ordersRef = ref(rtdb, "orders");
    const snapshot = await get(ordersRef);

    if (!snapshot.exists()) {
      return null;
    }

    let foundCartId = null;

    snapshot.forEach((childSnapshot) => {
      const orderData = childSnapshot.val();
      if (
        orderData.user_id === user.uid &&
        orderData.status === "pending" &&
        !foundCartId
      ) {
        foundCartId = orderData.id || childSnapshot.key;
      }
    });

    if (foundCartId) {
      window.localStorage.setItem("cartId", foundCartId);
    }

    return foundCartId;
  };

  const subscribeToOrder = (currentCartId) => {
    if (!currentCartId) {
      setOrder(null);
      setOrderId(null);
      setStatus("");
      setAddress("");
      setPhone("");
      setEmail("");
      setSpecialNotes("");
      setDeliveryTime("");
      setLoading(false);
      return () => {};
    }

    const orderRef = ref(rtdb, `orders/${currentCartId}`);

    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOrder(null);
        setOrderId(currentCartId);
        setStatus("");
        setAddress("");
        setPhone("");
        setEmail("");
        setSpecialNotes("");
        setDeliveryTime("");
        setLoading(false);
        return;
      }

      const orderData = snapshot.val();
      setOrder(orderData);
      setOrderId(orderData.id || currentCartId);
      // Use delivery_address/phone/email if user_address/user_phone/user_email is not available (for completed orders). Coerce to string for mobile/production (Firebase can return numbers).
      const orderAddress = String(orderData.user_address ?? orderData.delivery_address ?? "");
      const orderPhone = String(orderData.user_phone ?? orderData.phone ?? "");
      const orderEmail = orderData.user_email || orderData.email || "";
      setAddress(orderAddress);
      setPhone(orderPhone);
      setEmail(orderEmail);
      setSpecialNotes(orderData.special_notes || "");
      setDeliveryTime(orderData.delivery_time || "");
      setStatus(orderData.status || "");
      // Default to delivery for pending orders, or use saved order_type for completed orders
      const orderStatus = orderData.status || "";
      if (orderStatus === 'pending' || !orderStatus) {
        setOrderType('delivery');
      } else {
        setOrderType(orderData.order_type || 'delivery');
      }
      setLoading(false);
    });

    return unsubscribe;
  };

  // Pre-fill address and phone from profile when user is logged in and order has no saved data
  useEffect(() => {
    if (!user || !userDetails || !order || order.status !== "pending") return;
    const orderAddress = String(order.user_address ?? order.delivery_address ?? "").trim();
    const orderPhone = String(order.user_phone ?? order.phone ?? "").trim();
    if (userDetails.address && !orderAddress) setAddress(String(userDetails.address));
    if (userDetails.phone && !orderPhone) setPhone(String(userDetails.phone));
    if ((user.email || userDetails.email) && !(order.user_email || order.email)) setEmail(user.email || userDetails.email || "");
  }, [user, userDetails, order]);

  const calculateTotal = (items) => {
    if (!items) return 0;
    return Object.values(items).reduce((total, item) => {
      // Exclude packaging items that are hidden in cart (their price is already included in product price)
      if (item.isPackaging && item.hiddenInCart) {
        return total;
      }
      return total + item.quantity * parseFloat(item.value);
    }, 0);
  };

  // Delivery fee from admin tiers: first tier where subtotal <= maxAmount; above last tier = 0
  const getDeliveryFee = (subtotal) => {
    if (!deliveryPriceTiers?.length) return 3;
    const sorted = [...deliveryPriceTiers].sort((a, b) => (a.maxAmount ?? 9999) - (b.maxAmount ?? 9999));
    for (const tier of sorted) {
      if (tier.maxAmount == null || subtotal <= tier.maxAmount) {
        return Number(tier.fee) || 0;
      }
    }
    return 0;
  };


  const isWithinWorkingHours = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= workingHours.startHour && currentHour < workingHours.endHour;
  };

  const getMinDeliveryTime = () => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return oneHourFromNow.toTimeString().slice(0, 5);
  };

  const validateDeliveryTime = (timeString) => {
    if (!timeString) return true; // Optional field
    
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create delivery time for today
    const deliveryTime = new Date();
    deliveryTime.setHours(hours, minutes, 0, 0);
    
    // Check if delivery time is at least 1 hour from now
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Check if delivery time is within working hours
    const isWithinHours = hours >= workingHours.startHour && hours < workingHours.endHour;
    
    return deliveryTime >= oneHourFromNow && isWithinHours;
  };

  const handleDeliveryTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (validateDeliveryTime(selectedTime)) {
      setDeliveryTime(selectedTime);
    } else {
      message.warning("Моля, изберете час който е минимум 1 час от сега и в работното време.");
      // Reset to minimum valid time
      setDeliveryTime(getMinDeliveryTime());
    }
  };

  // Generate hour options
  const getHourOptions = () => {
    const hours = [];
    const now = new Date();
    const currentHour = now.getHours();
    // Minimum hour should be at least 1 hour from now
    const minHour = Math.max(workingHours.startHour, currentHour + 1);
    
    for (let h = minHour; h < workingHours.endHour; h++) {
      hours.push({ value: h, label: `${h.toString().padStart(2, '0')}` });
    }
    return hours;
  };

  // Generate minute options
  const getMinuteOptions = () => {
    const minutes = [];
    for (let m = 0; m < 60; m += 15) {
      minutes.push({ value: m, label: `${m.toString().padStart(2, '0')}` });
    }
    return minutes;
  };

  // Handle hour change
  const handleHourChange = (hour) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      const newTime = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      if (validateDeliveryTime(newTime)) {
        setDeliveryTime(newTime);
      }
    }
  };

  // Handle minute change
  const handleMinuteChange = (minute) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      const newTime = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      if (validateDeliveryTime(newTime)) {
        setDeliveryTime(newTime);
      }
    }
  };

  useEffect(() => {
    if (orderType === "delivery" && deliveryTime) {
      const [h, m] = deliveryTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setSelectedHour(h);
        setSelectedMinute(m);
      }
    }
  }, [orderType, deliveryTime]);

  // Initialize hour and minute from deliveryTime
  useEffect(() => {
    if (deliveryTime && deliveryTime.includes(':')) {
      const [hour, minute] = deliveryTime.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [deliveryTime]);


  const updateItemQuantity = async (itemId, quantity) => {
    if (!orderId || !order || !order.items || !order.items[itemId]) {
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    const updatedItems = {
      ...order.items,
      [itemId]: {
        ...order.items[itemId],
        quantity: parsedQuantity,
      },
    };

    // Also update packaging items quantity if they are linked to this item
    Object.keys(updatedItems).forEach(key => {
      const item = updatedItems[key];
      if (item.isPackaging && item.linkedToItemId === itemId) {
        updatedItems[key] = {
          ...item,
          quantity: parsedQuantity,
        };
      }
    });


    const updatedOrder = {
      ...order,
      items: updatedItems,
    };

    const newTotal = calculateTotal(updatedOrder.items);
    updatedOrder.total = newTotal;

    await update(ref(rtdb, `orders/${orderId}`), updatedOrder);
    setOrder(updatedOrder);
    message.success("Количеството е променено!");
  };

  const deleteItem = async (itemId) => {
    if (!orderId || !order || !order.items || !order.items[itemId]) {
      return;
    }

    const updatedItems = { ...order.items };
    delete updatedItems[itemId];
    
    // Also delete packaging items linked to this item
    Object.keys(updatedItems).forEach(key => {
      const item = updatedItems[key];
      if (item.isPackaging && item.linkedToItemId === itemId) {
        delete updatedItems[key];
      }
    });

    const updatedOrder = {
      ...order,
      items: updatedItems,
    };

    const newTotal = calculateTotal(updatedOrder.items);
    updatedOrder.total = newTotal;

    await update(ref(rtdb, `orders/${orderId}`), updatedOrder);
    setOrder(updatedOrder);
    message.success("Продуктът е изтрит!");
  };

  const changeOrderStatus = async () => {
    if (!orderId || !order) {
      return;
    }

    const addressStr = String(address ?? "");
    const phoneStr = String(phone ?? "");
    if (orderType === 'delivery' && !addressStr.trim()) {
      message.error("Моля, въведете адрес за доставка.");
      return;
    }

    if (!phoneStr.trim()) {
      message.error("Моля, въведете телефон за връзка.");
      return;
    }

    if (deliveryTime && !validateDeliveryTime(deliveryTime)) {
      message.error("Часът за доставка трябва да е минимум 1 час от сега и в рамките на работното време.");
      return;
    }

    // Get order number if not already assigned
    let orderNumber = order.order_number;
    if (!orderNumber) {
      try {
        const { getNextOrderNumber } = await import('../../utils/orderNumberUtils');
        orderNumber = await getNextOrderNumber();
      } catch (error) {
        console.error('Error getting order number:', error);
        // Continue without order number - it can be assigned later by admin
      }
    }

    // Pickup: 10% on products only. Delivery + registered: % on products + delivery fee.
    const pickupDiscountAmount = orderType === 'pickup' ? calculatedTotal * 0.1 : 0;
    const deliveryFeeAmount = orderType === 'delivery' ? getDeliveryFee(calculatedTotal) : 0;
    const registeredUserDiscountAmountSubmit = user && registeredUserDiscountPercent > 0 && orderType !== 'pickup'
      ? (calculatedTotal + deliveryFeeAmount) * (registeredUserDiscountPercent / 100)
      : 0;
    const finalOrderTotal =
      orderType === 'pickup'
        ? calculatedTotal - pickupDiscountAmount
        : calculatedTotal + deliveryFeeAmount - registeredUserDiscountAmountSubmit;

    const updatedOrder = {
      ...order,
      status: 'in progress',
      delivery_address: orderType === 'delivery' ? addressStr : '',
      phone: phoneStr,
      email: email,
      special_notes: specialNotes,
      delivery_time: orderType === 'delivery' ? deliveryTime : '',
      order_number: orderNumber,
      order_type: orderType,
      pickup_discount: pickupDiscountAmount,
      registered_user_discount: registeredUserDiscountAmountSubmit,
      registered_user_discount_percent: user && registeredUserDiscountPercent > 0 && orderType !== 'pickup' ? registeredUserDiscountPercent : null,
      delivery_fee: deliveryFeeAmount,
      total: finalOrderTotal
    };

    await update(ref(rtdb, `orders/${orderId}`), updatedOrder);

    setStatus('in progress');
    setOrderCompleted(true);
    
    // Send email notification
    try {
      // Get admin email from Firebase settings
      const emailRef = ref(rtdb, 'settings/email');
      const emailSnapshot = await get(emailRef);
      let adminEmail = null;
      
      if (emailSnapshot.exists()) {
        const emailData = emailSnapshot.val();
        adminEmail = emailData.adminEmail || emailData.email;
      }

      if (adminEmail) {
        // Also get SMTP config to send to API
        const smtpRef = ref(rtdb, 'settings/email');
        const smtpSnapshot = await get(smtpRef);
        let smtpConfig = null;
        
        if (smtpSnapshot.exists()) {
          const smtpData = smtpSnapshot.val();
          smtpConfig = {
            smtpHost: smtpData.smtpHost,
            smtpPort: smtpData.smtpPort,
            smtpUser: smtpData.smtpUser,
            smtpPassword: smtpData.smtpPassword,
            smtpSecure: smtpData.smtpSecure,
            fromEmail: smtpData.fromEmail
          };
        }

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderData: updatedOrder,
            adminEmail: adminEmail,
            smtpConfig: smtpConfig,
          }),
        });

        const result = await response.json();
        if (!result.success && !result.logged) {
          console.error('Failed to send email notification:', result);
        }
      } else {
        console.log('No admin email configured, skipping email notification');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't block the order process if email fails
    }

    // Keep orderId in localStorage so we can continue to show the order data
    // Don't remove cartId immediately - keep it so data remains visible
    if (typeof window !== "undefined") {
      // Keep the cartId so we can continue to display order information
      // Only remove it when user navigates away or starts a new order
      window.dispatchEvent(
        new CustomEvent("cart:update", {
          detail: { cartId: null },
        })
      );
    }
    showAToast("success", "Поръчката е изпратена успешно! Очаквайте доставка на посочения адрес.");
  };

  useEffect(() => {
    let unsubscribe = () => {};
    let unsubscribeWorkingHours = () => {};
    let unsubDeliveryPrice = () => {};

    const init = async () => {
      setLoading(true);
      const resolvedCartId = await resolveCartId();
      setCartId(resolvedCartId);
      unsubscribe = subscribeToOrder(resolvedCartId);
      
      // Subscribe to working hours changes
      const settingsRef = ref(rtdb, 'settings/workingHours');
      unsubscribeWorkingHours = onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setWorkingHours({
            startHour: data.startHour || 10,
            endHour: data.endHour || 22
          });
        }
      });

      // Subscribe to delivery price tiers
      const deliveryPriceRef = ref(rtdb, 'settings/deliveryPrice');
      unsubDeliveryPrice = onValue(deliveryPriceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const raw = data?.tiers;
          if (Array.isArray(raw) && raw.length >= 2) {
            const sorted = [...raw].sort((a, b) => (a.maxAmount ?? 9999) - (b.maxAmount ?? 9999));
            const twoTiers = [
              { maxAmount: sorted[0].maxAmount != null ? Number(sorted[0].maxAmount) : 25, fee: Number(sorted[0].fee ?? 5) },
              { maxAmount: null, fee: Number(sorted[1]?.fee ?? 3) }
            ];
            setDeliveryPriceTiers(twoTiers);
          }
          if (data?.minOrderAmount != null) {
            setMinOrderForDelivery(Number(data.minOrderAmount));
          }
          if (data?.registeredUserDiscountPercent != null) {
            setRegisteredUserDiscountPercent(Number(data.registeredUserDiscountPercent));
          }
        }
      });
    };

    init();

    return () => {
      unsubscribe();
      unsubscribeWorkingHours();
      unsubDeliveryPrice();
    };
  }, [user]);

  if (loading) {
    return <p>Зареждане...</p>;
  }

  if (!order || !order.items || Object.keys(order.items).length === 0) {
    return (
      <section id="contact" className="contact section shopping-cart dark">
        <div className="container">
          <div className="container section-title">
            <h2>Ресторант-пицария Централ</h2>
            <p>
              <span className="description-title">Вашата количка е празна</span>
            </p>
            <Link href="/for-home" className="btn btn-primary w-auto text-center py-1 px-3" aria-label="Към менюто за поръчка">
              Към меню
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Separate regular items from packaging items
  const regularItems = order && order.items ? Object.keys(order.items)
    .filter(itemId => !order.items[itemId].isPackaging)
    .map((itemId) => {
      const item = order.items[itemId];
      // Find packaging items linked to this item (exclude hidden ones from cart display)
      const linkedPackaging = order && order.items ? Object.keys(order.items)
        .filter(packId => {
          const packItem = order.items[packId];
          return packItem.isPackaging && packItem.linkedToItemId === itemId && !packItem.hiddenInCart;
        })
        .map(packId => ({
          id: packId,
          name: order.items[packId].name,
          quantity: order.items[packId].quantity,
          value: order.items[packId].value,
        })) : [];

      return {
        id: itemId,
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        value: item.value,
        sideDishName: item.sideDishName || null,
        isPackaging: false,
        linkedPackaging: linkedPackaging,
      };
    }) : [];

  // Combine regular items with their linked packaging items (exclude hidden ones)
  const dataSource = [];
  regularItems.forEach(item => {
    // Add the main item
    dataSource.push(item);
    // Add linked packaging items right after the main item (only if not hidden)
    if (item.linkedPackaging && item.linkedPackaging.length > 0) {
      item.linkedPackaging.forEach(pack => {
        // Check if packaging is hidden in cart
        const packItem = order && order.items ? order.items[pack.id] : null;
        if (!packItem || !packItem.hiddenInCart) {
          dataSource.push({
            id: pack.id,
            name: pack.name,
            quantity: pack.quantity,
            image: null,
            value: pack.value,
            sideDishName: null,
            isPackaging: true,
            linkedToItemId: item.id,
          });
        }
      });
    }
  });

  // Calculate total from actual items (more reliable than order.total)
  const calculatedTotal = order && order.items ? calculateTotal(order.items) : 0;
  
  // Currency conversion rate
  const EUR_RATE = 1.95583;
  
  // Format price in BGN and EUR
  const formatPrice = (priceInBGN) => {
    const bgn = parseFloat(priceInBGN || 0);
    const eur = (bgn / EUR_RATE).toFixed(2);
    return { bgn: bgn.toFixed(2), eur };
  };
  
  // Delivery fee from admin tiers (based on order value before discounts)
  const deliveryFee = orderType === 'delivery' ? getDeliveryFee(calculatedTotal) : 0;
  // Registered users: % on products + delivery (delivery only). Pickup uses 10% on products only.
  const registeredUserDiscountAmount = user && registeredUserDiscountPercent > 0 && orderType !== 'pickup'
    ? (calculatedTotal + deliveryFee) * (registeredUserDiscountPercent / 100)
    : 0;

  // Calculate discount per item (10% off for pickup)
  const getItemDiscount = (itemPrice) => {
    return orderType === 'pickup' ? itemPrice * 0.1 : 0;
  };

  const pickupDiscount = orderType === 'pickup' ? calculatedTotal * 0.1 : 0;
  const finalTotal =
    orderType === 'pickup'
      ? calculatedTotal - pickupDiscount
      : calculatedTotal + deliveryFee - registeredUserDiscountAmount;

  return (
    <>
      <section id="contact" className="contact section shopping-cart dark">
        <div className="container">
          <div className="container section-title">
            <h2>Ресторант-пицария Централ</h2>
            <p>
              <span className="description-title">Детайли на поръчката</span>
            </p>
            <Link href="/for-home" className="btn btn-primary w-auto text-center py-1 px-3" style={{ marginBottom: "20px" }}>
              Към меню
            </Link>
            <div className="content box">
              <div className="row">
                <div className="col-lg-8 items-section">
                  {dataSource.map((item, key) => {
                    if (item.isPackaging) {
                      // Packaging items - desktop view only
                      return (
                        <div 
                          className="product row d-flex align-items-center flex-nowrap desktop-only" 
                          key={key} 
                          style={{ 
                            marginBottom: "15px", 
                            paddingBottom: "15px", 
                            borderBottom: "1px solid #f0f0f0",
                            paddingLeft: "30px",
                            opacity: 0.8
                          }}
                        >
                          <div className="col-md-5 product-name d-flex align-items-center">
                            <div>
                              <a href="#" style={{ fontSize: "14px", fontWeight: "normal" }}>
                                └ {item.name}
                              </a>
                            </div>
                          </div>
                          <div className="col-md-3 quantity d-flex align-items-center">
                            <span>{item.quantity}</span>
                          </div>
                          <div className="col-md-2 price d-flex align-items-center justify-content-center">
                            <span>{item.value ? formatPrice(parseFloat(item.value)).bgn : "0.00"} лв ({item.value ? formatPrice(parseFloat(item.value)).eur : "0.00"}€)</span>
                          </div>
                          <div className="col-md-2 total-price d-flex align-items-center justify-content-center">
                            <span>
                              {Number.isFinite(item.value * item.quantity) ? formatPrice(item.value * item.quantity).bgn : "0.00"} лв ({Number.isFinite(item.value * item.quantity) ? formatPrice(item.value * item.quantity).eur : "0.00"}€)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    const itemPrice = parseFloat(item.value || 0);
                    const itemDiscount = getItemDiscount(itemPrice);
                    const itemDiscountTotal = itemDiscount * item.quantity;
                    const discountedPrice = itemPrice - itemDiscount;
                    const originalTotal = itemPrice * item.quantity;
                    const discountedTotal = discountedPrice * item.quantity;
                    const originalPriceFormatted = formatPrice(itemPrice);
                    const discountedPriceFormatted = formatPrice(discountedPrice);
                    
                    return (
                      <div key={key}>
                        {/* Desktop View */}
                        <div 
                          className="product row d-flex align-items-center flex-nowrap desktop-only" 
                          style={{ 
                            marginBottom: "15px", 
                            paddingBottom: "15px", 
                            borderBottom: "1px solid #f0f0f0"
                          }}
                        >
                          <div className="col-md-5 product-name d-flex align-items-center">
                            <div className="desktop-only-image">
                              <Image
                                src={item.image || "/images/no-image.png"}
                                alt={item.name}
                                width={80}
                                height={80}
                                style={{ marginRight: "10px", borderRadius: "8px" }}
                              />
                            </div>
                            <div>
                              <a href="#" style={{ fontSize: "16px", fontWeight: "500" }}>
                                {item.name}
                              </a>
                              {item.sideDishName && (
                                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                  Гарнитура: {item.sideDishName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-3 quantity d-flex align-items-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                              className="form-control quantity-input"
                              style={{ width: "60px" }}
                            />
                          </div>
                          <div className="col-md-2 price d-flex align-items-center justify-content-center">
                            <span>{originalPriceFormatted.bgn} лв ({originalPriceFormatted.eur}€)</span>
                          </div>
                          <div className="col-md-2 total-price d-flex align-items-center justify-content-center">
                            <span>{formatPrice(originalTotal).bgn} лв ({formatPrice(originalTotal).eur}€)</span>
                            {!orderCompleted &&
                              <FaTimes
                                onClick={() => deleteItem(item.id)}
                                style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                                title="Премахни артикула"
                              />
                            }
                          </div>
                        </div>
                        
                        {/* Mobile View */}
                        <div 
                          className="product-mobile mobile-only" 
                          style={{ 
                            marginBottom: "20px", 
                            padding: "15px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px", textAlign: "left" }}>
                                {item.name}
                              </div>
                              {item.sideDishName && (
                                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                                  Гарнитура: {item.sideDishName}
                                </div>
                              )}
                            </div>
                            {!orderCompleted && (
                              <FaTimes
                                onClick={() => deleteItem(item.id)}
                                style={{ color: "#ce1212", cursor: "pointer", fontSize: "18px", marginLeft: "10px" }}
                                title="Премахни артикула"
                              />
                            )}
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <button
                                onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "4px",
                                  border: "1px solid #ce1212",
                                  backgroundColor: "#fff",
                                  color: "#ce1212",
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                                disabled={orderCompleted}
                              >
                                −
                              </button>
                              <span style={{ fontSize: "16px", fontWeight: "600", minWidth: "30px", textAlign: "center" }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "4px",
                                  border: "1px solid #ce1212",
                                  backgroundColor: "#ce1212",
                                  color: "#fff",
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                                disabled={orderCompleted}
                              >
                                +
                              </button>
                            </div>
                            
                            <div style={{ textAlign: "right" }}>
                              <div>
                                <div style={{ fontSize: "16px", fontWeight: "600" }}>
                                  {originalPriceFormatted.bgn} лв ({originalPriceFormatted.eur}€)
                                </div>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "4px" }}>
                                  Общо: {formatPrice(originalTotal).bgn} лв ({formatPrice(originalTotal).eur}€)
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Packaging Items - Mobile */}
                          {item.linkedPackaging && item.linkedPackaging.length > 0 && (
                            <div style={{ 
                              marginTop: "12px", 
                              paddingTop: "12px", 
                              borderTop: "1px solid #e0e0e0" 
                            }}>
                              {item.linkedPackaging.map((pack, packIndex) => {
                                const packPrice = parseFloat(pack.value || 0);
                                const packTotal = packPrice * pack.quantity;
                                const packPriceFormatted = formatPrice(packPrice);
                                const packTotalFormatted = formatPrice(packTotal);
                                
                                return (
                                  <div 
                                    key={packIndex} 
                                    style={{ 
                                      display: "flex", 
                                      justifyContent: "space-between", 
                                      alignItems: "center",
                                      marginBottom: packIndex < item.linkedPackaging.length - 1 ? "8px" : "0"
                                    }}
                                  >
                                    <div style={{ fontSize: "14px", color: "#666" }}>
                                      {pack.name} (x{pack.quantity})
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ fontSize: "14px", fontWeight: "600" }}>
                                        {packPriceFormatted.bgn} лв ({packPriceFormatted.eur}€)
                                      </div>
                                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                                        Общо: {packTotalFormatted.bgn} лв ({packTotalFormatted.eur}€)
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Delivery/Pickup Options - Mobile */}
                  {!orderCompleted && (
                    <div className="mobile-only order-type-selection" style={{ marginTop: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                        <label style={{ 
                          flex: 1,
                          display: "flex", 
                          flexDirection: "column",
                          alignItems: "center", 
                          justifyContent: "center",
                          padding: "10px 8px",
                          border: orderType === 'pickup' ? "2px solid #ce1212" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          backgroundColor: orderType === 'pickup' ? "#ce1212" : "#fff",
                          color: orderType === 'pickup' ? "#fff" : "#000",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          position: "relative"
                        }}>
                          <input
                            type="radio"
                            name="orderType"
                            value="pickup"
                            checked={orderType === 'pickup'}
                            onChange={(e) => setOrderType(e.target.value)}
                            style={{ display: "none", cursor: "pointer" }}
                          />
                          <div style={{ fontWeight: "600", fontSize: "13px", textAlign: "center", lineHeight: "1.2" }}>
                            Вземане от ресторанта
                          </div>
                          <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.9 }}>
                            (-10%)
                          </div>
                          {orderType === 'pickup' && (
                            <div style={{
                              position: "absolute",
                              top: "4px",
                              right: "6px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ce1212",
                              fontSize: "11px",
                              fontWeight: "bold"
                            }}>
                              ✓
                            </div>
                          )}
                        </label>
                        <label style={{ 
                          flex: 1,
                          display: "flex", 
                          flexDirection: "column",
                          alignItems: "center", 
                          justifyContent: "center",
                          padding: "10px 8px",
                          border: orderType === 'delivery' ? "2px solid #ce1212" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          backgroundColor: orderType === 'delivery' ? "#ce1212" : "#fff",
                          color: orderType === 'delivery' ? "#fff" : "#000",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          position: "relative"
                        }}>
                          <input
                            type="radio"
                            name="orderType"
                            value="delivery"
                            checked={orderType === 'delivery'}
                            onChange={(e) => setOrderType(e.target.value)}
                            style={{ display: "none", cursor: "pointer" }}
                          />
                          <div style={{ fontWeight: "600", fontSize: "13px", textAlign: "center", lineHeight: "1.2" }}>
                            Доставка
                          </div>
                          <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.9 }}>
                            {formatPrice(3.00).bgn}лв
                          </div>
                          {orderType === 'delivery' && (
                            <div style={{
                              position: "absolute",
                              top: "4px",
                              right: "6px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ce1212",
                              fontSize: "11px",
                              fontWeight: "bold"
                            }}>
                              ✓
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-lg-4 summary-section">
                  <h3>Обобщение</h3>
                  <div className="summary-item">
                    <span>Сума:</span>
                    <span>{formatPrice(calculatedTotal).bgn} лв ({formatPrice(calculatedTotal).eur}€)</span>
                  </div>
                  {orderType === 'pickup' && pickupDiscount > 0 && (
                    <div className="summary-item" style={{ color: "#ce1212" }}>
                      <span>Отстъпка за вземане (-10%):</span>
                      <span>-{formatPrice(pickupDiscount).bgn} лв ({formatPrice(pickupDiscount).eur}€)</span>
                    </div>
                  )}
                  {orderType === 'delivery' && (
                    <div className="summary-item">
                      <span>Доставка:</span>
                      <span>{formatPrice(deliveryFee).bgn} лв ({formatPrice(deliveryFee).eur}€)</span>
                    </div>
                  )}
                  {registeredUserDiscountAmount > 0 && (
                    <div className="summary-item" style={{ color: "#ce1212" }}>
                      <span>Отстъпка за регистрирани (-{registeredUserDiscountPercent}%):</span>
                      <span>-{formatPrice(registeredUserDiscountAmount).bgn} лв ({formatPrice(registeredUserDiscountAmount).eur}€)</span>
                    </div>
                  )}
                  <div className="summary-item" style={{ fontWeight: "bold", fontSize: "18px", borderTop: "2px solid #e0e0e0", paddingTop: "10px", marginTop: "10px" }}>
                    <span>Общо:</span>
                    <span>{finalTotal.toFixed(2)} лева ({formatPrice(finalTotal).eur}€)</span>
                  </div>
                  
                  {/* Mobile Summary */}
                  <div className="mobile-only" style={{ 
                    marginTop: "20px", 
                    padding: "15px", 
                    backgroundColor: "#fff", 
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e0e0e0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "16px" }}>Сума:</span>
                        <span style={{ fontSize: "16px", fontWeight: "600" }}>
                          {formatPrice(calculatedTotal).bgn} лв ({formatPrice(calculatedTotal).eur}€)
                        </span>
                      </div>
                      {orderType === 'pickup' && pickupDiscount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#ce1212" }}>
                          <span style={{ fontSize: "16px" }}>Общо отстъпка:</span>
                          <span style={{ fontSize: "16px", fontWeight: "600" }}>
                            -{formatPrice(pickupDiscount).bgn} лв ({formatPrice(pickupDiscount).eur}€)
                          </span>
                        </div>
                      )}
                      {orderType === 'delivery' && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "16px" }}>Доставка:</span>
                          <span style={{ fontSize: "16px", fontWeight: "600" }}>
                            {formatPrice(deliveryFee).bgn} лв ({formatPrice(deliveryFee).eur}€)
                          </span>
                        </div>
                      )}
                      {registeredUserDiscountAmount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#ce1212" }}>
                          <span style={{ fontSize: "16px" }}>Отстъпка регистрирани (-{registeredUserDiscountPercent}%, пр.+дост.):</span>
                          <span style={{ fontSize: "16px", fontWeight: "600" }}>
                            -{formatPrice(registeredUserDiscountAmount).bgn} лв ({formatPrice(registeredUserDiscountAmount).eur}€)
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "bold" }}>Общо:</span>
                      <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ce1212" }}>
                        {formatPrice(finalTotal).bgn} лв ({formatPrice(finalTotal).eur}€)
                      </span>
                    </div>
                  </div>
                  
                  {/* Delivery/Pickup Options - Desktop */}
                  {!orderCompleted && (
                    <div className="desktop-only" style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                      <h5 style={{ marginBottom: "15px", fontSize: "16px" }}>Начин на получаване:</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          padding: "10px",
                          border: orderType === 'pickup' ? "2px solid #ce1212" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          backgroundColor: orderType === 'pickup' ? "#fff5f5" : "#fff",
                          cursor: "pointer"
                        }}>
                          <input
                            type="radio"
                            name="orderType"
                            value="pickup"
                            checked={orderType === 'pickup'}
                            onChange={(e) => setOrderType(e.target.value)}
                            style={{ display: "none", marginRight: "10px", cursor: "pointer" }}
                          />
                          <div>
                            <div style={{ fontWeight: "600" }}>
                              Вземане от ресторанта (-10%)
                            </div>
                          </div>
                        </label>
                        <label style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          padding: "10px",
                          border: orderType === 'delivery' ? "2px solid #ce1212" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          backgroundColor: orderType === 'delivery' ? "#fff5f5" : "#fff",
                          cursor: "pointer"
                        }}>
                          <input
                            type="radio"
                            name="orderType"
                            value="delivery"
                            checked={orderType === 'delivery'}
                            onChange={(e) => setOrderType(e.target.value)}
                            style={{ display: "none", marginRight: "10px", cursor: "pointer" }}
                          />
                          <div>
                            <div style={{ fontWeight: "600" }}>
                              С доставка ({formatPrice(deliveryFee).bgn} лв / {formatPrice(deliveryFee).eur}€)
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                  {!orderCompleted &&
                    <>
                      <div style={{ marginBottom: '15px', fontSize: '14px', textAlign: 'left', lineHeight: '1.6' }}>
                        С потвърждаването на поръчката Вие се съгласявате с нашите{' '}
                        <Link href="/obshti-usloviya" target="_blank" style={{ color: '#ce1212', textDecoration: 'underline' }}>
                          Общи условия
                        </Link>
                        {' '}и{' '}
                        <Link href="/privacy-policy" target="_blank" style={{ color: '#ce1212', textDecoration: 'underline' }}>
                          Политика за личните данни
                        </Link>
                      </div>
                      <Tooltip title={
                        (!phone || !String(phone).trim()) 
                          ? "Въведете телефон като натиснете бутона Добави" 
                          : (orderType === 'delivery' && (!address || !String(address).trim()))
                            ? "Въведете адрес за доставка"
                            : !isWithinWorkingHours() 
                              ? `Поръчките се приемат от ${workingHours.startHour}:00 до ${workingHours.endHour}:00 часа` 
                              : ""
                      }>
                        <span style={{ display: 'inline-block', width: '100%', marginTop: '10px' }}>
                          <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={changeOrderStatus}
                            disabled={
                              order?.status === 'in progress' || 
                              (orderType === 'delivery' && calculatedTotal < minOrderForDelivery) || 
                              !isWithinWorkingHours() ||
                              !phone || 
                              !String(phone).trim() ||
                              (orderType === 'delivery' && (!address || !String(address).trim()))
                            }
                          >
                            Поръчай
                          </button>
                        </span>
                      </Tooltip>
                      {!isWithinWorkingHours() && (
                        <p style={{ fontSize: '15px', textAlign: 'left', color: 'red', marginTop: '10px' }}>
                          Поръчките се приемат от {workingHours.startHour}:00 до {workingHours.endHour}:00 часа
                        </p>
                      )}
                      {orderType === 'delivery' && calculatedTotal < minOrderForDelivery && (
                        <>
                        <p style={{ fontSize: '15px', textAlign: 'left', color: 'red' }}>
                          Минимална сума за доставка {formatPrice(minOrderForDelivery).bgn} лв ({formatPrice(minOrderForDelivery).eur}€), добавете продукти за още {formatPrice(minOrderForDelivery - calculatedTotal).bgn} лв ({formatPrice(minOrderForDelivery - calculatedTotal).eur}€).
                        </p>
                        <Link href='/for-home' className="btn btn-primary w-auto text-center py-1 px-3">Към меню</Link>
                        </>
                      )}
                    </>
                  }
                  {/* Desktop Contact Info */}
                  <div className="contact-info desktop-only">
                    {(orderType === 'delivery' || orderCompleted) && (
                      <div style={{ marginBottom: "20px" }}>
                        <h5>Адрес:</h5>
                        {!orderCompleted ? (
                          <Input 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            placeholder="Въведете адрес за доставка"
                          />
                        ) : (
                          <span>{address || ""}</span>
                        )}
                      </div>
                    )}
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Email:</h5>
                      {!orderCompleted ? (
                        <Input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="Въведете email"
                        />
                      ) : (
                        <span>{email}</span>
                      )}
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Телефон:</h5>
                      {!orderCompleted ? (
                        <Input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          placeholder="Въведете телефон"
                        />
                      ) : (
                        <span>{phone || ""}</span>
                      )}
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Специални предпочитания/забележки:</h5>
                      {!orderCompleted ? (
                        <TextArea 
                          value={specialNotes} 
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="Например: без гъби, добавете пипер, без лук..."
                          rows={3}
                        />
                      ) : (
                        <span>{specialNotes || "Няма специални забележки"}</span>
                      )}
                    </div>
                    {(orderType === 'delivery' || orderCompleted) && (
                      <div style={{ marginBottom: "20px" }}>
                        <h5>Час за доставка (по избор):</h5>
                        {!orderCompleted ? (
                          <div>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "13px", marginBottom: "5px", display: "block", color: "#666" }}>
                                  Час:
                                </label>
                                <Select
                                  placeholder="Изберете час"
                                  value={selectedHour}
                                  onChange={handleHourChange}
                                  style={{ width: "100%" }}
                                  options={getHourOptions()}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "13px", marginBottom: "5px", display: "block", color: "#666" }}>
                                  Минути:
                                </label>
                                <Select
                                  placeholder="Изберете минути"
                                  value={selectedMinute}
                                  onChange={handleMinuteChange}
                                  style={{ width: "100%" }}
                                  options={getMinuteOptions()}
                                />
                              </div>
                            </div>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
                              Доставката трябва да е минимум 1 час от сега и до {workingHours.endHour}:00 часа
                            </p>
                          </div>
                        ) : (
                          <span>{deliveryTime || "Възможно най-скоро"}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Contact Info */}
                  <div className="contact-info mobile-only" style={{ marginTop: "20px" }}>
                    {(orderType === 'delivery' || orderCompleted) && (
                      <div style={{ 
                        marginBottom: "15px", 
                        padding: "15px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}>
                        <h5 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", textAlign: "left" }}>Адрес:</h5>
                        {!orderCompleted ? (
                          <Input 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Въведете адрес за доставка"
                            style={{ width: "100%" }}
                          />
                        ) : (
                          <div style={{ fontSize: "14px", color: address ? "#333" : "#999", textAlign: "left" }}>
                            {address || ""}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ 
                      marginBottom: "15px", 
                      padding: "15px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}>
                      <h5 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", textAlign: "left" }}>Email:</h5>
                      {!orderCompleted ? (
                        <Input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Въведете email"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div style={{ fontSize: "14px", color: email ? "#333" : "#999", textAlign: "left" }}>
                          {email || ""}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      marginBottom: "15px", 
                      padding: "15px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}>
                      <h5 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", textAlign: "left" }}>Телефон:</h5>
                      {!orderCompleted ? (
                        <Input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Въведете телефон"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div style={{ fontSize: "14px", color: phone ? "#333" : "#999", textAlign: "left" }}>
                          {phone || ""}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      marginBottom: "15px", 
                      padding: "15px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}>
                      <h5 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", textAlign: "left" }}>Специални предпочитания/забележки:</h5>
                      {!orderCompleted ? (
                        <TextArea 
                          value={specialNotes} 
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="Например: без гъби, добавете пипер, без лук..."
                          rows={3}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <div style={{ fontSize: "14px", color: specialNotes ? "#333" : "#999", textAlign: "left" }}>
                          {specialNotes || "Няма специални забележки"}
                        </div>
                      )}
                    </div>
                    
                    {(orderType === 'delivery' || orderCompleted) && (
                      <div style={{ 
                        marginBottom: "15px", 
                        padding: "15px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0"
                      }}>
                        <h5 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 10px 0", textAlign: "left" }}>Час за доставка (по избор):</h5>
                        {!orderCompleted ? (
                          <div>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "13px", marginBottom: "5px", display: "block", color: "#666" }}>
                                  Час:
                                </label>
                                <Select
                                  placeholder="Изберете час"
                                  value={selectedHour}
                                  onChange={handleHourChange}
                                  style={{ width: "100%" }}
                                  options={getHourOptions()}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "13px", marginBottom: "5px", display: "block", color: "#666" }}>
                                  Минути:
                                </label>
                                <Select
                                  placeholder="Изберете минути"
                                  value={selectedMinute}
                                  onChange={handleMinuteChange}
                                  style={{ width: "100%" }}
                                  options={getMinuteOptions()}
                                />
                              </div>
                            </div>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
                              Доставката трябва да е минимум 1 час от сега и до {workingHours.endHour}:00 часа
                            </p>
                          </div>
                        ) : (
                          <div style={{ fontSize: "14px", color: deliveryTime ? "#333" : "#999", textAlign: "left" }}>
                            {deliveryTime || "Възможно най-скоро"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Second Поръчай button - below contact data */}
                  {!orderCompleted && (
                    <>
                      <Tooltip title={
                        (!phone || !String(phone).trim()) 
                          ? "Въведете телефон" 
                          : (orderType === 'delivery' && (!address || !String(address).trim()))
                            ? "Въведете адрес за доставка"
                            : !isWithinWorkingHours() 
                              ? `Поръчките се приемат от ${workingHours.startHour}:00 до ${workingHours.endHour}:00 часа` 
                              : ""
                      }>
                        <span style={{ display: 'inline-block', width: '100%', marginTop: '20px' }}>
                          <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={changeOrderStatus}
                            disabled={
                              order?.status === 'in progress' || 
                              (orderType === 'delivery' && calculatedTotal < minOrderForDelivery) || 
                              !isWithinWorkingHours() ||
                              !phone || 
                              !String(phone).trim() ||
                              (orderType === 'delivery' && (!address || !String(address).trim()))
                            }
                          >
                            Поръчай
                          </button>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </div>
            {orderCompleted &&
              <div className="contact-info">
                {/* Success Message Box */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #52c41a',
                  borderRadius: '12px',
                  padding: '24px',
                  margin: '20px 0',
                  boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Main Success Message */}
                  <h3 style={{
                    color: '#52c41a',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '0 0 12px 0',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>✅</span>
                    Поръчката е изпратена успешно!
                  </h3>
                  
                  {/* Secondary Message */}
                  <p style={{
                    color: '#666',
                    fontSize: '16px',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5'
                  }}>
                    Очаквайте доставка на посочения адрес
                  </p>
                  
                  {/* Status Section */}
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    padding: '12px',
                    margin: '16px 0',
                    border: '1px solid #bae7ff'
                  }}>
                    <h5 style={{
                      color: '#1890ff',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      margin: '0 0 8px 0'
                    }}>
                      Статус на поръчката:
                    </h5>
                    <span style={{
                      color: '#1890ff',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {status == "in progress" ? "🚚 Доставя се" : status == "completed" ? "✅ Поръчката е доставена" : status == "cancelled" ? "❌ Поръчката е отказана" : status}
                    </span>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#52c41a',
                    borderRadius: '50%',
                    opacity: '0.1'
                  }}></div>
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '-15px',
                    left: '-15px',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#52c41a',
                    borderRadius: '50%',
                    opacity: '0.05'
                  }}></div>
                  
                  {/* Contact Info */}
                  <div style={{
                    backgroundColor: '#f6ffed',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '16px',
                    border: '1px solid #d9f7be'
                  }}>
                    <p style={{
                      color: '#389e0d',
                      fontSize: '14px',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      📞 За въпроси: +359 895 516 401
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
        <style jsx>
          {`
        .box {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
        }
        .items-section {
          padding-right: 20px;
        }
        .summary-section {
          background: #fff;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        .contact-info {
          margin-top: 20px;
          text-align: left;
        }
        .desktop-only {
          display: block;
        }
        .desktop-only-image {
          display: block;
        }
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .row {
            flex-direction: column;
          }
          .items-section, .summary-section {
            width: 100%;
            padding-right: 0;
          }
          .contact-info {
            text-align: center;
          }
          .desktop-only {
            display: none !important;
          }
          .desktop-only-image {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
          .product {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .product-name {
            width: 100%;
            margin-bottom: 10px;
          }
          .total-price {
            width: 100%;
            justify-content: flex-end !important;
            margin-top: 10px;
          }
          .order-type-selection {
            margin-top: 20px;
          }
          .summary-section {
            margin-top: 20px;
          }
          .summary-section h3 {
            display: none;
          }
          .summary-section .summary-item {
            display: none;
          }
        }
      `}
        </style>
      </section>
    </>
  );
}
