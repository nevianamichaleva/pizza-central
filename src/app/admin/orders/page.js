'use client';

import { useUser } from '@/context/UserContext';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Input, message, Popconfirm, Select, Space, Switch, Table, Tabs } from "antd";
import { get, ref, remove, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';
import {
    compareOrdersByDate,
    generateOrderNumber,
    getOrderNumberSortValue,
    parseOrderDateTimestamp,
} from '../../../utils/orderNumberUtils';

const AdminOrdersPage = () => {
    const { isAdmin } = useUser();
    const [orders, setOrders] = useState([]);
    
    // Currency conversion rate
    const EUR_RATE = 1.95583;
    
    // Format price in BGN and EUR
    const formatPrice = (priceInBGN) => {
        const bgn = parseFloat(priceInBGN || 0);
        const eur = (bgn / EUR_RATE).toFixed(2);
        const bgnStr = bgn.toFixed(2);
        return {
            bgn: bgnStr,
            eur,
            both: `${eur}€ (${bgnStr} лв)`,
            bothNeg: `-${eur}€ (-${bgnStr} лв)`,
        };
    };
    const [workingHours, setWorkingHours] = useState({ startHour: 10, endHour: 22 });
    const [editingHours, setEditingHours] = useState({ startHour: 10, endHour: 22 });
    const [isEditingHours, setIsEditingHours] = useState(false);
    // Delivery price tiers: up to X lv -> Y lv; above X lv -> Z lv (2 tiers only)
    const defaultDeliveryTiers = [
        { maxAmount: 25, fee: 5 },
        { maxAmount: null, fee: 3 }
    ];
    const [deliveryPriceTiers, setDeliveryPriceTiers] = useState(defaultDeliveryTiers);
    const [editingDeliveryTiers, setEditingDeliveryTiers] = useState(defaultDeliveryTiers);
    const [isEditingDeliveryTiers, setIsEditingDeliveryTiers] = useState(false);
    const [minOrderAmount, setMinOrderAmount] = useState(25);
    const [editingMinOrderAmount, setEditingMinOrderAmount] = useState(25);
    const [registeredUserDiscountPercent, setRegisteredUserDiscountPercent] = useState(0);
    const [editingRegisteredUserDiscountPercent, setEditingRegisteredUserDiscountPercent] = useState(0);
    const [adminEmail, setAdminEmail] = useState('');
    const [editingEmail, setEditingEmail] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [smtpConfig, setSmtpConfig] = useState({
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        smtpSecure: false,
        fromEmail: ''
    });
    const [editingSmtpConfig, setEditingSmtpConfig] = useState(smtpConfig);
    const [isEditingSmtp, setIsEditingSmtp] = useState(false);
    const columns = [
        {
            title: 'Номер на поръчка',
            key: 'order_number',
            width: 150,
            sorter: (a, b) => getOrderNumberSortValue(a) - getOrderNumberSortValue(b),
            sortDirections: ['descend', 'ascend'],
            showSorterTooltip: { title: 'Сортирай по номер' },
            render: (_, record) => (
                <div>
                    <strong style={{ color: '#1890ff' }}>
                        {generateOrderNumber(record)}
                    </strong>
                    {!record.order_number && (
                        <div style={{ fontSize: '10px', color: '#999' }}>
                            Чака изпращане
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Дата на поръчката',
            dataIndex: 'order_date',
            key: 'order_date',
            width: 180,
            sorter: (a, b) => parseOrderDateTimestamp(a) - parseOrderDateTimestamp(b),
            defaultSortOrder: 'descend',
            sortDirections: ['descend', 'ascend'],
            showSorterTooltip: { title: 'Сортирай по дата' },
            render: (value) => value || '—',
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
            width: 150,
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ 
                        width: '100%',
                        color: getStatusColor(status)
                    }}
                    onChange={(newStatus) => updateOrderStatus(record.id, newStatus)}
                    options={[
                        { 
                            value: 'pending', 
                            label: <span style={{ color: '#faad14' }}>🕐 Чакаща</span>
                        },
                        { 
                            value: 'in progress', 
                            label: <span style={{ color: '#1890ff' }}>🚚 В процес</span>
                        },
                        { 
                            value: 'delivered', 
                            label: <span style={{ color: '#52c41a' }}>✅ Доставена</span>
                        },
                        { 
                            value: 'cancelled', 
                            label: <span style={{ color: '#f5222d' }}>❌ Отказана</span>
                        }
                    ]}
                />
            ),
        },
        {
            title: 'Общо',
            dataIndex: 'total',
            key: 'total',
            render: (total) => {
                const price = formatPrice(total);
                return total ? price.both : '0.00€ (0.00 лв)';
            },
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
        {
            title: 'Действия',
            key: 'actions',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={() => showDrawer(record)}
                    >
                        Детайли
                    </Button>
                    <Popconfirm
                        title="Изтриване на поръчка"
                        description={`Сигурни ли сте, че искате да изтриете поръчка ${generateOrderNumber(record)}?`}
                        onConfirm={() => deleteOrder(record)}
                        okText="Да, изтрий"
                        cancelText="Отказ"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="text" 
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        />
                    </Popconfirm>
                </Space>
            ),
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
        fetchDeliveryPriceTiers();
        fetchAdminEmail();
        fetchSmtpConfig();
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

    const fetchDeliveryPriceTiers = async () => {
        try {
            const settingsRef = ref(rtdb, 'settings/deliveryPrice');
            const snapshot = await get(settingsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const raw = data?.tiers;
                const tiers = Array.isArray(raw)
                    ? raw
                    : raw && typeof raw === 'object'
                        ? Object.values(raw).sort((a, b) => (a.maxAmount || 9999) - (b.maxAmount || 9999))
                        : defaultDeliveryTiers;
                const normalized = tiers.length >= 2
                    ? [
                        { maxAmount: tiers[0].maxAmount != null ? Number(tiers[0].maxAmount) : 25, fee: Number(tiers[0].fee ?? 5) },
                        { maxAmount: null, fee: Number(tiers[1]?.fee ?? 3) }
                    ]
                    : defaultDeliveryTiers;
                setDeliveryPriceTiers(normalized);
                setEditingDeliveryTiers(normalized);
                const minOrder = data.minOrderAmount != null ? Number(data.minOrderAmount) : 25;
                setMinOrderAmount(minOrder);
                setEditingMinOrderAmount(minOrder);
                const regDiscount = data.registeredUserDiscountPercent != null ? Number(data.registeredUserDiscountPercent) : 0;
                setRegisteredUserDiscountPercent(regDiscount);
                setEditingRegisteredUserDiscountPercent(regDiscount);
            }
        } catch (error) {
            console.error('Error fetching delivery price tiers:', error);
        }
    };

    const saveDeliveryPriceTiers = async () => {
        try {
            const t0 = editingDeliveryTiers[0];
            const t1 = editingDeliveryTiers[1];
            const max0 = t0?.maxAmount === '' || t0?.maxAmount == null ? 25 : parseInt(Number(t0.maxAmount), 10);
            const fee0 = parseFloat(t0?.fee) || 0;
            const fee1 = parseFloat(t1?.fee) || 0;
            const tiers = [
                { maxAmount: max0, fee: fee0 },
                { maxAmount: null, fee: fee1 }
            ];
            if (tiers[0].maxAmount == null || tiers[0].maxAmount < 0 || tiers[0].fee < 0 || tiers[1].fee < 0) {
                message.error('Попълнете коректно границите и таксите за доставка.');
                return;
            }
            const minOrder = (editingMinOrderAmount === '' || editingMinOrderAmount == null) ? minOrderAmount : Number(editingMinOrderAmount);
            if (isNaN(minOrder) || minOrder < 0) {
                message.error('Минималната сума за доставка трябва да е положително число.');
                return;
            }
            const regDiscountPct = (editingRegisteredUserDiscountPercent === '' || editingRegisteredUserDiscountPercent == null)
                ? registeredUserDiscountPercent
                : Number(editingRegisteredUserDiscountPercent);
            const regDiscountClamped = Math.min(100, Math.max(0, isNaN(regDiscountPct) ? 0 : regDiscountPct));
            const settingsRef = ref(rtdb, 'settings/deliveryPrice');
            await set(settingsRef, { tiers, minOrderAmount: minOrder, registeredUserDiscountPercent: regDiscountClamped });
            setDeliveryPriceTiers(tiers);
            setEditingDeliveryTiers(tiers);
            setMinOrderAmount(minOrder);
            setEditingMinOrderAmount(minOrder);
            setRegisteredUserDiscountPercent(regDiscountClamped);
            setEditingRegisteredUserDiscountPercent(regDiscountClamped);
            setIsEditingDeliveryTiers(false);
            message.success('Цените на доставка и отстъпката са запазени успешно!');
        } catch (error) {
            console.error('Error saving delivery price tiers:', error);
            message.error('Грешка при запазване на цените за доставка');
        }
    };

    const cancelEditingDeliveryTiers = () => {
        setEditingDeliveryTiers(deliveryPriceTiers);
        setEditingMinOrderAmount(minOrderAmount);
        setEditingRegisteredUserDiscountPercent(registeredUserDiscountPercent);
        setIsEditingDeliveryTiers(false);
    };

    const fetchAdminEmail = async () => {
        try {
            const emailRef = ref(rtdb, 'settings/email');
            const snapshot = await get(emailRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                const email = data.adminEmail || data.email || '';
                setAdminEmail(email);
                setEditingEmail(email);
            }
        } catch (error) {
            console.error('Error fetching admin email:', error);
        }
    };

    const saveAdminEmail = async () => {
        try {
            if (!editingEmail || !editingEmail.includes('@')) {
                message.error('Моля, въведете валиден email адрес');
                return;
            }

            const emailRef = ref(rtdb, 'settings/email');
            await set(emailRef, {
                adminEmail: editingEmail,
                email: editingEmail
            });
            
            setAdminEmail(editingEmail);
            setIsEditingEmail(false);
            message.success('Email адресът е запазен успешно!');
        } catch (error) {
            console.error('Error saving admin email:', error);
            message.error('Грешка при запазване на email адреса');
        }
    };

    const cancelEditingEmail = () => {
        setEditingEmail(adminEmail);
        setIsEditingEmail(false);
    };

    const fetchSmtpConfig = async () => {
        try {
            const smtpRef = ref(rtdb, 'settings/email');
            const snapshot = await get(smtpRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                const config = {
                    smtpHost: data.smtpHost || '',
                    smtpPort: data.smtpPort || '587',
                    smtpUser: data.smtpUser || '',
                    smtpPassword: data.smtpPassword || '',
                    smtpSecure: data.smtpSecure || false,
                    fromEmail: data.fromEmail || data.smtpUser || ''
                };
                setSmtpConfig(config);
                setEditingSmtpConfig(config);
            }
        } catch (error) {
            console.error('Error fetching SMTP config:', error);
        }
    };

    const saveSmtpConfig = async () => {
        try {
            const emailRef = ref(rtdb, 'settings/email');
            const currentData = await get(emailRef);
            const existingData = currentData.exists() ? currentData.val() : {};
            
            await set(emailRef, {
                ...existingData,
                smtpHost: editingSmtpConfig.smtpHost,
                smtpPort: editingSmtpConfig.smtpPort,
                smtpUser: editingSmtpConfig.smtpUser,
                smtpPassword: editingSmtpConfig.smtpPassword,
                smtpSecure: editingSmtpConfig.smtpSecure,
                fromEmail: editingSmtpConfig.fromEmail
            });
            
            setSmtpConfig(editingSmtpConfig);
            setIsEditingSmtp(false);
            message.success('SMTP настройките са запазени успешно!');
        } catch (error) {
            console.error('Error saving SMTP config:', error);
            message.error('Грешка при запазване на SMTP настройките');
        }
    };

    const cancelEditingSmtp = () => {
        setEditingSmtpConfig(smtpConfig);
        setIsEditingSmtp(false);
    };

    const testEmailConfiguration = async () => {
        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testEmail: adminEmail || 'test@example.com'
                })
            });

            const result = await response.json();

            if (result.success) {
                message.success(`✅ ${result.message}`);
            } else {
                message.error(`❌ ${result.error}`);
                if (result.details) {
                    console.error('Email test details:', result.details);
                }
            }
        } catch (error) {
            console.error('Error testing email:', error);
            message.error('Грешка при тестване на мейл конфигурацията');
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = ref(rtdb, `orders/${orderId}`);
            const snapshot = await get(orderRef);
            
            if (snapshot.exists()) {
                const orderData = snapshot.val();
                await set(orderRef, {
                    ...orderData,
                    status: newStatus
                });
                
                message.success(`Статусът на поръчката е променен на "${getStatusLabel(newStatus)}"`);
                fetchOrders(); // Refresh the orders list
            }
        } catch (error) {
            console.error("Грешка при обновяване на статуса:", error);
            message.error("Грешка при обновяване на статуса на поръчката");
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': 'Чакаща',
            'in progress': 'В процес',
            'delivered': 'Доставена',
            'cancelled': 'Отказана'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': '#faad14',
            'in progress': '#1890ff',
            'delivered': '#52c41a',
            'cancelled': '#f5222d'
        };
        return colorMap[status] || '#d9d9d9';
    };

    const deleteOrder = async (order) => {
        if (!order || !order.id) {
            message.error('Невалидна поръчка');
            return;
        }
        
        try {
            const orderRef = ref(rtdb, `orders/${order.id}`);
            await remove(orderRef);
            message.success('Поръчката е изтрита успешно');
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            message.error('Грешка при изтриване на поръчката');
        }
    };

    const fetchOrders = async () => {
        try {
            const ordersRef = ref(rtdb, "orders");
            const snapshot = await get(ordersRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const array = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                    }))
                    .sort((a, b) => compareOrdersByDate(a, b, 'desc'));
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
            <div className="container">
                <div className="container section-title">
                    <h2>Ресторант-пицария Централ</h2>
                    <p>
                        <span></span> <span className="description-title">Нямате права за тази страница</span>
                    </p>
                </div>
            </div>
        </section>;
    }

    const tabItems = [
        {
            key: '1',
            label: '📋 Поръчки',
            children: (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <Table
                        bordered
                        dataSource={orders}
                        columns={columns}
                        rowKey="id"
                        scroll={{ x: 1200 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} от ${total} поръчки`,
                        }}
                    />
                </div>
            ),
        },
        {
            key: '2',
            label: '⚙️ Настройки',
            children: (
                <div>
                    <Card 
                        title="Работни часове за доставки" 
                        style={{ marginBottom: "20px" }}
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
                    <Card
                        title="Цени на доставка"
                        style={{ marginBottom: "20px" }}
                        extra={
                            !isEditingDeliveryTiers ? (
                                <Button type="primary" onClick={() => setIsEditingDeliveryTiers(true)}>
                                    Редактирай
                                </Button>
                            ) : (
                                <Space>
                                    <Button onClick={cancelEditingDeliveryTiers}>Отказ</Button>
                                    <Button type="primary" onClick={saveDeliveryPriceTiers}>
                                        Запази
                                    </Button>
                                </Space>
                            )
                        }
                    >
                        {!isEditingDeliveryTiers ? (
                            <div>
                                <p style={{ color: '#1890ff', fontSize: '14px', marginTop: '10px', marginBottom: '14px' }}>
                                    <strong>Минимална сума за доставка:</strong> {minOrderAmount} лв
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>До {deliveryPriceTiers[0]?.maxAmount ?? 25} лв:</strong> {deliveryPriceTiers[0]?.fee ?? 5} лв
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>Над {deliveryPriceTiers[0]?.maxAmount ?? 25} лв:</strong> {deliveryPriceTiers[1]?.fee ?? 3} лв
                                </p>
                                <p style={{ color: '#52c41a', fontSize: '14px', marginTop: '14px', marginBottom: '10px' }}>
                                    <strong>Отстъпка за регистрирани потребители:</strong> {registeredUserDiscountPercent}%
                                </p>
                            </div>
                        ) : (
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                                    <span><strong>Минимална сума за доставка:</strong></span>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={editingMinOrderAmount}
                                        onChange={(e) => setEditingMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                        style={{ width: 80 }}
                                    />
                                    <span><strong>лв</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <span><strong>До</strong></span>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={editingDeliveryTiers[0]?.maxAmount ?? 25}
                                        onChange={(e) => {
                                            const v = e.target.value === '' ? null : Number(e.target.value);
                                            setEditingDeliveryTiers(prev => {
                                                const next = [...prev];
                                                next[0] = { ...next[0], maxAmount: v };
                                                return next;
                                            });
                                        }}
                                        style={{ width: 80 }}
                                    />
                                    <span><strong>лв →</strong></span>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.5}
                                        value={editingDeliveryTiers[0]?.fee ?? 5}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value) || 0;
                                            setEditingDeliveryTiers(prev => {
                                                const next = [...prev];
                                                next[0] = { ...next[0], fee: v };
                                                return next;
                                            });
                                        }}
                                        style={{ width: 80 }}
                                    />
                                    <span><strong>лв</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <span><strong>Над</strong></span>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={editingDeliveryTiers[0]?.maxAmount ?? 25}
                                        style={{ width: 80 }}
                                        disabled
                                    />
                                    <span><strong>лв →</strong></span>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.5}
                                        value={editingDeliveryTiers[1]?.fee ?? 3}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value) || 0;
                                            setEditingDeliveryTiers(prev => {
                                                const next = [...prev];
                                                if (!next[1]) next[1] = { maxAmount: null, fee: 3 };
                                                next[1] = { ...next[1], fee: v };
                                                return next;
                                            });
                                        }}
                                        style={{ width: 80 }}
                                    />
                                    <span><strong>лв</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                                    <span><strong>Отстъпка за регистрирани потребители (%):</strong></span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={editingRegisteredUserDiscountPercent}
                                        onChange={(e) => setEditingRegisteredUserDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))}
                                        style={{ width: 80 }}
                                    />
                                    <span style={{ color: '#666', fontSize: '13px' }}>върху продукти + такса доставка (при доставка)</span>
                                </div>
                            </Space>
                        )}
                    </Card>
                </div>
            ),
        },
        {
            key: '3',
            label: '📧 Email настройки',
            children: (
                <div>
                    <Card 
                        title="Email за известия за поръчки" 
                        style={{ marginBottom: "20px" }}
                        extra={
                            !isEditingEmail ? (
                                <Button type="primary" onClick={() => setIsEditingEmail(true)}>
                                    Редактирай
                                </Button>
                            ) : (
                                <Space>
                                    <Button onClick={cancelEditingEmail}>Отказ</Button>
                                    <Button type="primary" onClick={saveAdminEmail}>
                                        Запази
                                    </Button>
                                </Space>
                            )
                        }
                    >
                        {!isEditingEmail ? (
                            <div>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>Email адрес:</strong> {adminEmail || 'Не е настроен'}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    На този email адрес ще се изпращат известия при получаване на нова поръчка.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <label style={{ margin: '0 12px 0 0', display: 'block', marginBottom: '10px' }}>
                                    <strong>Email адрес за известия:</strong>
                                </label>
                                <Input
                                    type="email"
                                    value={editingEmail}
                                    onChange={(e) => setEditingEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    style={{ width: '100%', maxWidth: '400px' }}
                                />
                            </div>
                        )}
                    </Card>
                    <Card 
                        title="SMTP настройки за изпращане на email" 
                        style={{ marginBottom: "20px" }}
                        extra={
                            !isEditingSmtp ? (
                                <Button type="primary" onClick={() => setIsEditingSmtp(true)}>
                                    Редактирай
                                </Button>
                            ) : (
                                <Space>
                                    <Button onClick={cancelEditingSmtp}>Отказ</Button>
                                    <Button type="primary" onClick={saveSmtpConfig}>
                                        Запази
                                    </Button>
                                </Space>
                            )
                        }
                    >
                        {!isEditingSmtp ? (
                            <div>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>SMTP Host:</strong> {smtpConfig.smtpHost || 'Не е настроен'}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>SMTP Port:</strong> {smtpConfig.smtpPort || '587'}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>SMTP User:</strong> {smtpConfig.smtpUser || 'Не е настроен'}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    <strong>From Email:</strong> {smtpConfig.fromEmail || 'Не е настроен'}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                                    За да се изпращат email известия, моля конфигурирайте SMTP настройките или използвайте environment variables.
                                </p>
                                <div style={{ marginTop: '15px' }}>
                                    <Button 
                                        type="default" 
                                        onClick={testEmailConfiguration}
                                        disabled={!smtpConfig.smtpHost && !process.env.SMTP_HOST}
                                    >
                                        🧪 Тествай мейл конфигурацията
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        <strong>SMTP Host:</strong>
                                    </label>
                                    <Input
                                        value={editingSmtpConfig.smtpHost}
                                        onChange={(e) => setEditingSmtpConfig({ ...editingSmtpConfig, smtpHost: e.target.value })}
                                        placeholder="smtp.gmail.com"
                                        style={{ width: '100%', maxWidth: '400px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        <strong>SMTP Port:</strong>
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingSmtpConfig.smtpPort}
                                        onChange={(e) => setEditingSmtpConfig({ ...editingSmtpConfig, smtpPort: e.target.value })}
                                        placeholder="587"
                                        style={{ width: '100%', maxWidth: '400px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        <strong>SMTP User:</strong>
                                    </label>
                                    <Input
                                        value={editingSmtpConfig.smtpUser}
                                        onChange={(e) => setEditingSmtpConfig({ ...editingSmtpConfig, smtpUser: e.target.value })}
                                        placeholder="your-email@gmail.com"
                                        style={{ width: '100%', maxWidth: '400px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        <strong>SMTP Password:</strong>
                                    </label>
                                    <Input.Password
                                        value={editingSmtpConfig.smtpPassword}
                                        onChange={(e) => setEditingSmtpConfig({ ...editingSmtpConfig, smtpPassword: e.target.value })}
                                        placeholder="Your password or app password"
                                        style={{ width: '100%', maxWidth: '400px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        <strong>From Email:</strong>
                                    </label>
                                    <Input
                                        type="email"
                                        value={editingSmtpConfig.fromEmail}
                                        onChange={(e) => setEditingSmtpConfig({ ...editingSmtpConfig, fromEmail: e.target.value })}
                                        placeholder="noreply@example.com"
                                        style={{ width: '100%', maxWidth: '400px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>
                                        <strong>Secure (SSL/TLS):</strong>
                                    </label>
                                    <Switch
                                        checked={editingSmtpConfig.smtpSecure}
                                        onChange={(checked) => setEditingSmtpConfig({ ...editingSmtpConfig, smtpSecure: checked })}
                                    />
                                </div>
                            </Space>
                        )}
                    </Card>
                </div>
            ),
        },
    ];

    return (
        <section id="contact" className="contact section">
            <div className="container">
                <div className="container section-title">
                    <h2>Административен панел</h2>
                    <p>
                        <span></span> <span className="description-title">Управление на поръчки</span>
                    </p>
                    <div style={{ marginBottom: "15px" }}>
                        <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                            <i className="bi bi-arrow-left"></i> Върни се в Административния панел
                        </Link>
                    </div>
                    
                    <Tabs 
                        defaultActiveKey="1" 
                        items={tabItems}
                        size="large"
                        style={{ marginTop: "20px" }}
                    />
                    
                    <Drawer
                        title={`Детайли на поръчка: ${selectedOrder ? generateOrderNumber(selectedOrder) : 'N/A'}`}
                        open={visible}
                        onClose={onClose}
                        width={700}
                    >
                        {selectedOrder && (
                            <div style={{ padding: '10px 0' }}>
                                <div style={{ marginBottom: '30px' }}>
                                    <h3>Основна информация</h3>
                                    <div style={{ 
                                        backgroundColor: '#f0f9ff', 
                                        padding: '12px', 
                                        borderRadius: '6px',
                                        marginBottom: '15px',
                                        border: '1px solid #bae7ff'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '16px' }}>
                                            <strong>Номер на поръчка:</strong> 
                                            <span style={{ 
                                                color: '#1890ff',
                                                marginLeft: '8px',
                                                fontWeight: 'bold',
                                                fontSize: '18px'
                                            }}>
                                                {generateOrderNumber(selectedOrder)}
                                            </span>
                                        </p>
                                    </div>
                                    <p><strong>Дата на поръчката:</strong> {selectedOrder.order_date || 'Не е посочена'}</p>
                                    <p><strong>Статус:</strong> 
                                        <span style={{ 
                                            color: getStatusColor(selectedOrder.status),
                                            marginLeft: '8px',
                                            fontWeight: 'bold'
                                        }}>
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                    </p>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <h3>Информация за клиента</h3>
                                    <p><strong>Email:</strong> {selectedOrder.user_email || selectedOrder.email || 'Не е посочен'}</p>
                                    <p><strong>Телефон:</strong> {selectedOrder.user_phone || selectedOrder.phone || 'Не е посочен'}</p>
                                    <p><strong>Адрес за доставка:</strong> {selectedOrder.user_address || selectedOrder.delivery_address || 'Не е посочен'}</p>
                                </div>

                                {(selectedOrder.special_notes || selectedOrder.delivery_time) && (
                                    <div style={{ marginBottom: '30px' }}>
                                        <h3>Специални изисквания</h3>
                                        {selectedOrder.special_notes && (
                                            <div style={{ marginBottom: '15px' }}>
                                                <strong>Забележки:</strong>
                                                <div style={{ 
                                                    backgroundColor: '#f9f9f9', 
                                                    padding: '10px', 
                                                    borderRadius: '4px',
                                                    marginTop: '5px'
                                                }}>
                                                    {selectedOrder.special_notes}
                                                </div>
                                            </div>
                                        )}
                                        {selectedOrder.delivery_time && (
                                            <p><strong>Желан час за доставка:</strong> {selectedOrder.delivery_time}</p>
                                        )}
                                    </div>
                                )}

                                <div style={{ marginBottom: '30px' }}>
                                    <h3>Поръчани продукти</h3>
                                    {selectedOrder.items && Object.keys(selectedOrder.items).length > 0 ? (
                                        <div>
                                            {(() => {
                                                // Separate products from packaging items
                                                const products = [];
                                                const packagingItems = [];
                                                
                                                Object.entries(selectedOrder.items).forEach(([itemKey, item]) => {
                                                    if (item.isPackaging && item.hiddenInCart) {
                                                        packagingItems.push({ key: itemKey, ...item });
                                                    } else if (!item.isPackaging) {
                                                        products.push({ key: itemKey, ...item });
                                                    }
                                                });
                                                
                                                return products.map(product => {
                                                    // Find packaging items linked to this product
                                                    const linkedPackaging = packagingItems.filter(pack => pack.linkedToItemId === product.key);
                                                    
                                                    // product.value already includes hidden linked packaging (matches cart/menu)
                                                    const unitPrice = parseFloat(product.value || 0);
                                                    const productTotal = unitPrice * product.quantity;
                                                    
                                                    return (
                                                        <div key={product.key}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                padding: '8px 0',
                                                                borderBottom: '1px solid #f0f0f0'
                                                            }}>
                                                                <span><strong>{product.name}</strong> x{product.quantity}</span>
                                                                <span>{formatPrice(productTotal).both}</span>
                                                            </div>
                                                            {/* Show packaging items on separate lines */}
                                                            {linkedPackaging.map(pack => (
                                                                    <div key={pack.key} style={{ 
                                                                        padding: '8px 0 8px 20px',
                                                                        borderBottom: '1px solid #f0f0f0',
                                                                        opacity: 0.8
                                                                    }}>
                                                                        <span>└ {pack.name} x{pack.quantity} <em style={{ fontWeight: 400 }}>(включена в цената)</em></span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    ) : (
                                        <p>Няма продукти в поръчката</p>
                                    )}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Финансова информация</h3>
                                    <div style={{ 
                                        backgroundColor: '#f6ffed', 
                                        padding: '15px', 
                                        borderRadius: '4px',
                                        border: '1px solid #d9f7be'
                                    }}>
                                        {(() => {
                                            // Calculate subtotal (products before discount/delivery)
                                            const total = parseFloat(selectedOrder.total || 0);
                                            const deliveryFee = parseFloat(selectedOrder.delivery_fee || 0);
                                            const pickupDiscount = parseFloat(selectedOrder.pickup_discount || 0);
                                            const registeredUserDiscount = parseFloat(selectedOrder.registered_user_discount || 0);
                                            const subtotal = total - deliveryFee + pickupDiscount + registeredUserDiscount;
                                            
                                            const subtotalFormatted = formatPrice(subtotal);
                                            const pickupDiscountFormatted = formatPrice(pickupDiscount);
                                            const registeredUserDiscountFormatted = formatPrice(registeredUserDiscount);
                                            const deliveryFeeFormatted = formatPrice(deliveryFee);
                                            const totalFormatted = formatPrice(total);
                                            
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span>Сума на продукти:</span>
                                                        <span>{subtotalFormatted.both}</span>
                                                    </div>
                                                    {pickupDiscount > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#52c41a' }}>
                                                            <span>Отстъпка за вземане (10%):</span>
                                                            <span>{pickupDiscountFormatted.bothNeg}</span>
                                                        </div>
                                                    )}
                                                    {(deliveryFee > 0 || selectedOrder.order_type === 'delivery') && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <span>Такса за доставка:</span>
                                                            <span>{deliveryFeeFormatted.both}</span>
                                                        </div>
                                                    )}
                                                    {registeredUserDiscount > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#52c41a' }}>
                                                            <span>Отстъпка регистрирани ({selectedOrder.registered_user_discount_percent != null ? selectedOrder.registered_user_discount_percent : ''}% пр.+дост.):</span>
                                                            <span>{registeredUserDiscountFormatted.bothNeg}</span>
                                                        </div>
                                                    )}
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        borderTop: '1px solid #d9f7be',
                                                        paddingTop: '5px'
                                                    }}>
                                                        <span>Общо:</span>
                                                        <span>{totalFormatted.both}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                    <Button onClick={onClose} type="primary" size="large">
                                        Затвори
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Drawer>
                </div>
            </div>
        </section>
    )
}

export default AdminOrdersPage;