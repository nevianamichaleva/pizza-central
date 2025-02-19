"use client"

import { Button, InputNumber } from "antd";
import { get, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import { rtdb } from "../../../lib/firebase";
import showAToast from "../../components/common/showAToast";

export default function Order() {
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [address, setAddress] = useState(null);
  const [phone, setPhone] = useState(null);
  const [email, setEmail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const fetchOrder = async () => {
    const orderRef = ref(rtdb, `orders/${orderId}`);
    const snapshot = await get(orderRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      setOrder(data);
      setAddress(data.user_address);
      setPhone(data.user_phone);
      setEmail(data.user_email)
      setStatus(data.status);
    }
    setLoading(false);
  };

  const calculateTotal = (items) => {
    let total = 0;
    Object.values(items).forEach(item => {
      total += item.quantity * parseFloat(item.value);
    });
    return total;
  };

  const updateItemQuantity = async (itemId, quantity) => {
    const updatedOrder = { ...order };
    updatedOrder.items[itemId].quantity = quantity;

    const newTotal = calculateTotal(updatedOrder.items);
    updatedOrder.total = newTotal;

    await update(ref(rtdb, `orders/${orderId}`), updatedOrder);
    setOrder(updatedOrder);
    message.success("Количеството е променено!");
  };

  const deleteItem = async (itemId) => {
    const updatedOrder = { ...order };
    delete updatedOrder.items[itemId];

    const newTotal = calculateTotal(updatedOrder.items);
    updatedOrder.total = newTotal;

    await update(ref(rtdb, `orders/${orderId}`), updatedOrder);
    setOrder(updatedOrder);
    message.success("Продуктът е изтрит!");
  };

  const changeOrderStatus = async () => {
    await update(ref(rtdb, `orders/${orderId}`), {
      ...order,
      status: 'in progress',
      delivery_address: address,
      phone: '',
      email: ''
    });
    setStatus('in progress');
    localStorage.removeItem('cartId');
    showAToast("success", "Поръчката е изпратена, очаквайте обаждане");
  };

  useEffect(() => {
    setOrderId(localStorage.getItem('cartId'))
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <p>Зареждане...</p>;
  }

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      render: (text, record) => (
        <img
          src={record.image}
          alt="product"
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
      ),
    },
    {
      title: '',
      dataIndex: 'name',
    },
    {
      title: '',
      render: (text, record) => (
        <InputNumber
          min={1}
          defaultValue={record.quantity}
          onChange={(value) => updateItemQuantity(record.id, value)}
        />
      ),
    },
    {
      title: '',
      render: (text, record) => <span>${record.value}</span>,
    },
    {
      title: '',
      render: (text, record) => (
        <Button style={{ border: "none" }} danger onClick={() => deleteItem(record.id)}>
          <span style={{ fontSize: "20px", fontWeight: '900' }}>x</span>
        </Button>
      ),
    },
  ];
  const dataSource = order && order.items ? Object.keys(order.items).map((itemId) => ({
    id: itemId,
    name: order.items[itemId].name,
    quantity: order.items[itemId].quantity,
    image: order.items[itemId].image,
    value: order.items[itemId].value,
  })) : [];

  return (
    <section class="shopping-cart dark">
      <div class="container">
        <div class="block-heading">
          <h2>Детайли на поръчката</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc quam urna, dignissim nec auctor in, mattis vitae leo.</p>
        </div>
        <div class="content">
          <div class="row">
            <div class="col-md-12 col-lg-8">
              <div class="items">
                <div class="product">
                  <div class="row">
                    <div class="col-md-3">
                      <img class="img-fluid mx-auto d-block image" src="assets/img/image.jpg"/>
                    </div>
                    <div class="col-md-8">
                      <div class="info">
                        <div class="row">
                          <div class="col-md-5 product-name">
                            <div class="product-name">
                              <a href="#">Lorem Ipsum dolor</a>
                              <div class="product-info">
                                <div>Display: <span class="value">5 inch</span></div>
                                <div>RAM: <span class="value">4GB</span></div>
                                <div>Memory: <span class="value">32GB</span></div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 quantity">
                            <label for="quantity">Quantity:</label>
                            <input id="quantity" type="number" value="1" class="form-control quantity-input"/>
                          </div>
                          <div class="col-md-3 price">
                            <span>$120</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="product">
                  <div class="row">
                    <div class="col-md-3">
                      <img class="img-fluid mx-auto d-block image" src="assets/img/image.jpg"/>
                    </div>
                    <div class="col-md-8">
                      <div class="info">
                        <div class="row">
                          <div class="col-md-5 product-name">
                            <div class="product-name">
                              <a href="#">Lorem Ipsum dolor</a>
                              <div class="product-info">
                                <div>Display: <span class="value">5 inch</span></div>
                                <div>RAM: <span class="value">4GB</span></div>
                                <div>Memory: <span class="value">32GB</span></div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 quantity">
                            <label for="quantity">Quantity:</label>
                            <input id="quantity" type="number" value="1" class="form-control quantity-input"/>
                          </div>
                          <div class="col-md-3 price">
                            <span>$120</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="product">
                  <div class="row">
                    <div class="col-md-3">
                      <img class="img-fluid mx-auto d-block image" src="assets/img/image.jpg"/>
                    </div>
                    <div class="col-md-8">
                      <div class="info">
                        <div class="row">
                          <div class="col-md-5 product-name">
                            <div class="product-name">
                              <a href="#">Lorem Ipsum dolor</a>
                              <div class="product-info">
                                <div>Display: <span class="value">5 inch</span></div>
                                <div>RAM: <span class="value">4GB</span></div>
                                <div>Memory: <span class="value">32GB</span></div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 quantity">
                            <label for="quantity">Quantity:</label>
                            <input id="quantity" type="number" value="1" class="form-control quantity-input"/>
                          </div>
                          <div class="col-md-3 price">
                            <span>$120</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-4">
              <div class="summary">
                <h3>Summary</h3>
                <div class="summary-item"><span class="text">Subtotal</span><span class="price">$360</span></div>
                <div class="summary-item"><span class="text">Discount</span><span class="price">$0</span></div>
                <div class="summary-item"><span class="text">Shipping</span><span class="price">$0</span></div>
                <div class="summary-item"><span class="text">Total</span><span class="price">$360</span></div>
                <button type="button" class="btn btn-primary btn-lg btn-block">Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

{/* <section id="contact" className="contact section">
<div className="container" data-aos="fade-up" data-aos-delay="100">
  <div className="container section-title" data-aos="fade-up">
    <h2>Ресторант-пицария Централ</h2>
    <p>
      <span></span> <span className="description-title">Детайли на поръчката</span>
    </p>
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={false}
        style={{ marginBottom: '20px' }}
      />
      <div style={{ textAlign: "justify" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>
            Адрес за достaвка:
            {isEditing ? (
              <>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '200px', marginLeft: '10px' }}
                />
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => setIsEditing(false)}
                  style={{ marginLeft: '10px' }}
                />
              </>
            ) : (
              <span style={{ marginLeft: '10px' }}>{address}</span>
            )}
          </h4>
          {!isEditing && (
            <Button type="primary" onClick={() => setIsEditing(true)} style={{ marginLeft: '10px' }}>
              Въведи друг адрес
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>
            Email:
            {isEditingEmail ? (
              <>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '200px', marginLeft: '10px' }}
                />
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => setIsEditingEmail(false)}
                  style={{ marginLeft: '10px' }}
                />
              </>
            ) : (
              <span style={{ marginLeft: '10px' }}>{email}</span>
            )}
          </h4>
          {!isEditingEmail && (
            <Button type="primary" onClick={() => setIsEditingEmail(true)} style={{ marginLeft: '10px' }}>
              Смени email
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>
            Телефон:
            {isEditingPhone ? (
              <>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '200px', marginLeft: '10px' }}
                />
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => setIsEditingPhone(false)}
                  style={{ marginLeft: '10px' }}
                />
              </>
            ) : (
              <span style={{ marginLeft: '10px' }}>{phone}</span>
            )}
          </h4>
          {!isEditingPhone && (
            <Button type="primary" onClick={() => setIsEditingPhone(true)} style={{ marginLeft: '10px' }}>
              Смени телефона
            </Button>
          )}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Общо: {order?.total.toFixed(2)} лева</h3>
        <Button type="primary" onClick={changeOrderStatus} disabled={status === 'in progress'}>
          Поръчай
        </Button>
      </div>

    </div>
  </div>
</div>
</section> */}
  );
}
