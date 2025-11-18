'use client';

import { useUser } from '@/context/UserContext';
import { Button, Card, Drawer, Input, message, Space, Table } from "antd";
import { get, ref, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

const AdminOrdersPage = () => {
    const { isAdmin } = useUser();
    const [orders, setOrders] = useState([]);
    const [workingHours, setWorkingHours] = useState({ startHour: 10, endHour: 22 });
    const [editingHours, setEditingHours] = useState({ startHour: 10, endHour: 22 });
    const [isEditingHours, setIsEditingHours] = useState(false);
    const columns = [
        {
            title: 'Дата на поръчката',
            dataIndex: 'order_date',
            key: 'order_date',
        },
        {
            title: 'Адрес за доставка',
            dataIndex: 'delivery_address',
            key: 'delivery_address',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Общо',
            dataIndex: 'total',
            key: 'total',
            render: (total) => total ? parseFloat(total).toFixed(2) : '0.00',
        },
        {
            title: 'Имейл на потребителя',
            dataIndex: 'user_email',
            key: 'user_email',
        },
        {
            title: 'Телефон на потребителя',
            dataIndex: 'user_phone',
            key: 'user_phone',
        },
        {
            title: 'Адрес на потребителя',
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
        fetchWorkingHours();
    }, []);

    const fetchWorkingHours = async () => {
        try {
            const settingsRef = ref(rtdb, 'settings/workingHours');
            const snapshot = await get(settingsRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                setWorkingHours({
                    startHour: data.startHour || 10,
                    endHour: data.endHour || 22
                });
                setEditingHours({
                    startHour: data.startHour || 10,
                    endHour: data.endHour || 22
                });
            }
        } catch (error) {
            console.error('Error fetching working hours:', error);
        }
    };

    const saveWorkingHours = async () => {
        try {
            const startHour = parseInt(editingHours.startHour);
            const endHour = parseInt(editingHours.endHour);

            // Validation
            if (isNaN(startHour) || startHour < 0 || startHour > 23) {
                message.error('Началният час трябва да е между 0 и 23');
                return;
            }

            if (isNaN(endHour) || endHour < 0 || endHour > 23) {
                message.error('Крайният час трябва да е между 0 и 23');
                return;
            }

            if (startHour >= endHour) {
                message.error('Началният час трябва да е по-малък от крайния час');
                return;
            }

            const settingsRef = ref(rtdb, 'settings/workingHours');
            await set(settingsRef, {
                startHour: startHour,
                endHour: endHour
            });
            setWorkingHours({ startHour, endHour });
            setIsEditingHours(false);
            message.success('Работните часове са запазени успешно!');
        } catch (error) {
            console.error('Error saving working hours:', error);
            message.error('Грешка при запазване на работните часове');
        }
    };

    const cancelEditingHours = () => {
        setEditingHours(workingHours);
        setIsEditingHours(false);
    };

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
                    }))
                    .sort((a, b) => {
                        // Sort by order_date in descending order (newest first)
                        const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
                        const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
                        return dateB - dateA; // Descending order
                    });
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
                    <div style={{ marginBottom: "15px" }}>
                        <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                            <i className="bi bi-arrow-left"></i> Върни се в Административния панел
                        </Link>
                    </div>
                    <Card 
                        title="Работни часове за доставки" 
                        style={{ marginBottom: "20px", marginTop: "20px" }}
                        extra={
                            !isEditingHours ? (
                                <Button type="primary" onClick={() => setIsEditingHours(true)}>
                                    Редактирай
                                </Button>
                            ) : (
                                <Space>
                                    <Button onClick={cancelEditingHours}>Отказ</Button>
                                    <Button type="primary" onClick={saveWorkingHours}>
                                        Запази
                                    </Button>
                                </Space>
                            )
                        }
                    >
                        {!isEditingHours ? (
                            <div>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}><strong>Начален час:</strong> {workingHours.startHour}:00</p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}><strong>Краен час:</strong> {workingHours.endHour}:00</p>
                                <p style={{ color: 'red', fontSize: '18px', marginTop: '10px' }}>
                                    Поръчките се приемат от {workingHours.startHour}:00 до {workingHours.endHour}:00 часа
                                </p>
                            </div>
                        ) : (
                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                <div>
                                    <label style={{ margin: '0 12px 0 0' }}>
                                        <strong>Начален час (0-23):</strong>
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={editingHours.startHour}
                                        onChange={(e) => setEditingHours({ ...editingHours, startHour: e.target.value })}
                                        style={{ width: '30%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ margin: '0 12px 0 0' }}>
                                        <strong>Краен час (0-23):</strong>
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={editingHours.endHour}
                                        onChange={(e) => setEditingHours({ ...editingHours, endHour: e.target.value })}
                                        style={{ width: '30%' }}
                                    />
                                </div>
                            </Space>
                        )}
                    </Card>
                    <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
                        <Table
                            onRow={(record) => ({
                                onClick: () => showDrawer(record),
                            })}
                            bordered
                            dataSource={orders}
                            columns={columns} />
                    </div>
                    <Drawer
                        title={`Детайли на поръчка ID: ${selectedOrder ? selectedOrder.key : ''}`}
                        visible={visible}
                        onClose={onClose}
                        width={600}
                    >
                        {selectedOrder && (
                            <>
                                <p><strong>Дата на поръчката:</strong> {selectedOrder.order_date}</p>
                                <p><strong>Адрес за доставка:</strong> {selectedOrder.delivery_address}</p>
                                <p><strong>Статус:</strong> {selectedOrder.status}</p>
                                <p><strong>Общо:</strong> {selectedOrder.total ? parseFloat(selectedOrder.total).toFixed(2) : '0.00'}</p>
                                <p><strong>Продукти:</strong></p>
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
                        <Button onClick={onClose} type="primary">Затвори</Button>
                    </Drawer>
                </div>
            </div>
        </section>
    )
}

export default AdminOrdersPage;