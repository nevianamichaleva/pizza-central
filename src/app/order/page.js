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

    await update(ref(rtdb, `orders/${orderId}`), {
      ...order,
      status: 'in progress',
      delivery_address: address,
      phone: phone,
      email: email,
      total: order.total + 3
    });

    setStatus('in progress');
    setOrderCompleted(true);
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
    showAToast("success", "Поръчката е изпратена, очаквайте обаждане");
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
                    <div className="product row d-flex align-items-center flex-nowrap" key={key}>
                      <div className="col-md-5 product-name d-flex align-items-center">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          style={{ marginRight: "10px" }}
                        />
                        <a href="#">{item.name}</a>
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
                  </div>
                </div>
              </div>
            </div>
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
