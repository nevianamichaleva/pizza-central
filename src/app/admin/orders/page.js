'use client';

import { useUser } from '@/context/UserContext';
import { Button, Drawer, Table } from "antd";
import { get, ref } from 'firebase/database';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

const AdminOrdersPage = () => {
    const { isAdmin } = useUser();
    const [orders, setOrders] = useState([]);
    const columns = [
        {
            title: 'Order Date',
            dataIndex: 'order_date',
            key: 'order_date',
        },
        {
            title: 'Delivery Address',
            dataIndex: 'delivery_address',
            key: 'delivery_address',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
        },
        {
            title: 'User Email',
            dataIndex: 'user_email',
            key: 'user_email',
        },
        {
            title: 'User Phone',
            dataIndex: 'user_phone',
            key: 'user_phone',
        },
        {
            title: 'User Address',
            dataIndex: 'user_address',
            key: 'user_address',
        },
    ];
    const [visible, setVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Function to show the drawer
    const showDrawer = (order) => {
        setSelectedOrder(order);
        setVisible(true);
    };

    // Function to hide the drawer
    const onClose = () => {
        setVisible(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const ordersRef = ref(rtdb, "orders");
            const snapshot = await get(ordersRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(data);
                const array = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                    }));
                setOrders(array);
            } else {
                message.error("Няма поръчки.");
            }
        } catch (error) {
            console.error("Грешка при зареждане на поръчки:", error);
        }
    };

    if (!isAdmin) {
        return <section id="contact" className="contact section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="container section-title" data-aos="fade-up">
                    <h2>Ресторант-пицария Централ</h2>
                    <p>
                        <span></span> <span className="description-title">Нямате права за тази страница</span>
                    </p>
                </div>
            </div>
        </section>;
    }

    return (
        <section id="contact" className="contact section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="container section-title" data-aos="fade-up">
                    <h2>Административен панел</h2>
                    <p>
                        <span></span> <span className="description-title">Направени поръчки</span>
                    </p>
                    <div className="d-flex justify-content-center align-items-center mb-4" style={{ position: "relative" }}>

                    </div>
                    <Table style={{ marginTop: "20px" }}
                        onRow={(record) => ({
                            onClick: () => showDrawer(record),
                        })}
                        bordered
                        dataSource={orders}
                        columns={columns} />
                    <Drawer
                        title={`Order Details for Order ID: ${selectedOrder ? selectedOrder.key : ''}`}
                        visible={visible}
                        onClose={onClose}
                        width={600}
                    >
                        {selectedOrder && (
                            <>
                                <p><strong>Order Date:</strong> {selectedOrder.order_date}</p>
                                <p><strong>Delivery Address:</strong> {selectedOrder.delivery_address}</p>
                                <p><strong>Status:</strong> {selectedOrder.status}</p>
                                <p><strong>Total:</strong> {selectedOrder.total}</p>
                                <p><strong>Items:</strong></p>
                                <ul>
                                    {Object.keys(selectedOrder.items).map(itemKey => {
                                        const item = selectedOrder.items[itemKey];
                                        return (
                                            <li key={itemKey}>
                                                <strong>{item.name}</strong> (x{item.quantity}) - {item.value}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                        <Button onClick={onClose} type="primary">Close</Button>
                    </Drawer>
                </div>
            </div>
        </section>
    )
}

export default AdminOrdersPage;