"use client"

import { useUser } from "@/context/UserContext";
import { CheckOutlined } from "@ant-design/icons";
import { Button, Input, message, Tooltip } from "antd";
import { get, onValue, ref, update } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { rtdb } from "../../../lib/firebase";
import showAToast from "../../components/common/showAToast";
const { TextArea } = Input;

export default function Order() {
  const { user } = useUser();
  const [cartId, setCartId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [workingHours, setWorkingHours] = useState({ startHour: 10, endHour: 22 });
  const [specialNotes, setSpecialNotes] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDeliveryTime, setIsEditingDeliveryTime] = useState(false);

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
      // Use delivery_address/phone/email if user_address/user_phone/user_email is not available (for completed orders)
      setAddress(orderData.user_address || orderData.delivery_address || "");
      setPhone(orderData.user_phone || orderData.phone || "");
      setEmail(orderData.user_email || orderData.email || "");
      setSpecialNotes(orderData.special_notes || "");
      setDeliveryTime(orderData.delivery_time || "");
      setStatus(orderData.status || "");
      setLoading(false);
    });

    return unsubscribe;
  };

  const calculateTotal = (items) => {
    if (!items) return 0;
    return Object.values(items).reduce((total, item) => {
      return total + item.quantity * parseFloat(item.value);
    }, 0);
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


  const updateItemQuantity = async (itemId, quantity) => {
    if (!orderId || !order || !order.items || !order.items[itemId]) {
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    const updatedOrder = {
      ...order,
      items: {
        ...order.items,
        [itemId]: {
          ...order.items[itemId],
          quantity: parsedQuantity,
        },
      },
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

    if (!address || !address.trim()) {
      message.error("Моля, въведете адрес за доставка.");
      return;
    }

    if (!phone || !phone.trim()) {
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

    const updatedOrder = {
      ...order,
      status: 'in progress',
      delivery_address: address,
      phone: phone,
      email: email,
      special_notes: specialNotes,
      delivery_time: deliveryTime,
      order_number: orderNumber,
      total: order.total + 3
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
    };

    init();

    return () => {
      unsubscribe();
      unsubscribeWorkingHours();
    };
  }, [user]);

  if (loading) {
    return <p>Зареждане...</p>;
  }

  if (!order || !order.items || Object.keys(order.items).length === 0) {
    return (
      <section id="contact" className="contact section shopping-cart dark">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="container section-title" data-aos="fade-up">
            <h2>Ресторант-пицария Централ</h2>
            <p>
              <span className="description-title">Вашата количка е празна</span>
            </p>
            <Link href="/our-menu" className="btn btn-primary w-auto text-center py-1 px-3">
              Към меню
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const dataSource = order && order.items ? Object.keys(order.items).map((itemId) => ({
    id: itemId,
    name: order.items[itemId].name,
    quantity: order.items[itemId].quantity,
    image: order.items[itemId].image,
    value: order.items[itemId].value,
    sideDishName: order.items[itemId].sideDishName || null,
  })) : [];

  return (
    <>
      <section id="contact" className="contact section shopping-cart dark">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="container section-title" data-aos="fade-up">
            <h2>Ресторант-пицария Централ</h2>
            <p>
              <span className="description-title">Детайли на поръчката</span>
            </p>
            <div className="content box">
              <div className="row">
                <div className="col-lg-8 items-section">
                  {dataSource.map((item, key) => (
                    <div className="product row d-flex align-items-center flex-nowrap" key={key} style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #f0f0f0" }}>
                      <div className="col-md-5 product-name d-flex align-items-center">
                        <Image
                          src={item.image || "/images/no-image.png"}
                          alt={item.name}
                          width={80}
                          height={80}
                          style={{ marginRight: "10px", borderRadius: "8px" }}
                        />
                        <div>
                          <a href="#">{item.name}</a>
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
                        <span>{item.value ? parseFloat(item.value).toFixed(2) : "0.00"} лева</span>
                      </div>

                      <div className="col-md-2 total-price d-flex align-items-center justify-content-center">
                        <span>
                          {Number.isFinite(item.value * item.quantity) ? (item.value * item.quantity).toFixed(2) : "0.00"} лева
                        </span>
                        {!orderCompleted &&
                          <FaTimes
                            onClick={() => deleteItem(item.id)}
                            style={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                            title="Премахни артикула"
                          />
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-lg-4 summary-section">
                  <h3>Обобщение</h3>
                  <div className="summary-item">
                    <span>Сума:</span>
                    <span>{Number(order?.total || 0).toFixed(2)} лева</span>
                  </div>
                  <div className="summary-item">
                    <span>Доставка:</span>
                    <span>{order?.total > 0 ? "3.00 лева" : "0.00 лева"}</span>
                  </div>
                  <div className="summary-item">
                    <span>Общо:</span>
                    <span>{Number(order?.total > 0 ? order.total + 3 : order?.total || 0).toFixed(2)} лева</span>
                  </div>
                  {!orderCompleted &&
                    <>
                      <Tooltip title={
                        (!address || !address.trim() || !phone || !phone.trim()) 
                          ? "Въведете адрес и телефон като натиснете бутона Добави" 
                          : !isWithinWorkingHours() 
                            ? `Поръчките се приемат от ${workingHours.startHour}:00 до ${workingHours.endHour}:00 часа` 
                            : ""
                      }>
                        <span style={{ display: 'inline-block', width: '100%' }}>
                          <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={changeOrderStatus}
                            disabled={order?.status === 'in progress' || (order?.total || 0) <= 25 || !isWithinWorkingHours()}
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
                      {(order?.total || 0) < 25 && (
                        <>
                        <p style={{ fontSize: '15px', textAlign: 'left', coler: 'red' }}>
                          Минимална сума за поръчка 25 лв, добавете продукти за още {(25 - (order?.total || 0)).toFixed(2)} лева.
                        </p>
                        <Link href='/our-menu' className="btn btn-primary w-auto text-center py-1 px-3">Към меню</Link>
                        </>
                      )}
                    </>
                  }
                  <div className="contact-info">
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Адрес:</h5>
                      {isEditing ? (
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                      ) : (
                        <span>{address || ""}</span>
                      )}
                      {!orderCompleted &&
                        <Button style={{ float: "right" }} onClick={() => setIsEditing(!isEditing)}>{isEditing ? <CheckOutlined /> : (address && address.trim() ? "Редактирай" : "Добави")}</Button>
                      }
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Email:</h5>
                      {isEditingEmail ? (
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                      ) : (
                        <span>{email}</span>
                      )}
                      {!orderCompleted &&
                        <Button style={{ float: "right" }} onClick={() => setIsEditingEmail(!isEditingEmail)}>{isEditingEmail ? <CheckOutlined /> : (email && email.trim() ? "Редактирай" : "Добави")}</Button>
                      }
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Телефон:</h5>
                      {isEditingPhone ? (
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                      ) : (
                        <span>{phone || ""}</span>
                      )}
                      {!orderCompleted &&
                        <Button style={{ float: "right" }} onClick={() => setIsEditingPhone(!isEditingPhone)}>{isEditingPhone ? <CheckOutlined /> : (phone && phone.trim() ? "Редактирай" : "Добави")}</Button>
                      }
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Специални предпочитания/забележки:</h5>
                      {isEditingNotes ? (
                        <TextArea 
                          value={specialNotes} 
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="Например: без гъби, добавете пипер, без лук..."
                          rows={3}
                        />
                      ) : (
                        <span>{specialNotes || "Няма специални забележки"}</span>
                      )}
                      {!orderCompleted &&
                        <Button style={{ float: "right" }} onClick={() => setIsEditingNotes(!isEditingNotes)}>{isEditingNotes ? <CheckOutlined /> : (specialNotes && specialNotes.trim() ? "Редактирай" : "Добави")}</Button>
                      }
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <h5>Час за доставка (по избор):</h5>
                      {isEditingDeliveryTime ? (
                        <Input 
                          type="time"
                          value={deliveryTime} 
                          onChange={handleDeliveryTimeChange}
                          min={getMinDeliveryTime()}
                          max={`${workingHours.endHour - 1}:59`}
                        />
                      ) : (
                        <span>{deliveryTime || "Възможно най-скоро"}</span>
                      )}
                      {!orderCompleted &&
                        <Button style={{ float: "right" }} onClick={() => {
                          if (!isEditingDeliveryTime) {
                            // When opening for editing, ensure we have a valid time
                            if (!deliveryTime || !validateDeliveryTime(deliveryTime)) {
                              setDeliveryTime(getMinDeliveryTime());
                            }
                          }
                          setIsEditingDeliveryTime(!isEditingDeliveryTime);
                        }}>{isEditingDeliveryTime ? <CheckOutlined /> : (deliveryTime && deliveryTime.trim() ? "Редактирай" : "Добави")}</Button>
                      }
                      {isEditingDeliveryTime && (
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                          Доставката трябва да е минимум 1 час от сега и до {workingHours.endHour}:00 часа
                        </p>
                      )}
                    </div>
                  </div>
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
        @media (max-width: 768px) {
          .row {
            flex-direction: column;
          }
          .items-section, .summary-section {
            width: 100%;
          }
          .contact-info {
            text-align: center;
          }
        }
      `}
        </style>
      </section>
    </>
  );
}
