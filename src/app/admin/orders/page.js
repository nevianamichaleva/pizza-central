'use client';

import { useUser } from '@/context/UserContext';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Input, message, Popconfirm, Select, Space, Switch, Table, Tabs } from "antd";
import { get, ref, remove, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';
import { generateOrderNumber } from '../../../utils/orderNumberUtils';

const AdminOrdersPage = () => {
    const { isAdmin } = useUser();
    const [orders, setOrders] = useState([]);
    const [workingHours, setWorkingHours] = useState({ startHour: 10, endHour: 22 });
    const [editingHours, setEditingHours] = useState({ startHour: 10, endHour: 22 });
    const [isEditingHours, setIsEditingHours] = useState(false);
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
            width: 150,
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
                    .sort((a, b) => {
                        // Sort by order_date in descending order (newest first)
                        const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
                        const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
                        
                        // If both have dates, sort by date (newest first)
                        if (dateA > 0 && dateB > 0) {
                            return dateB - dateA; // Descending order (newest first)
                        }
                        
                        // If only one has date, prioritize it
                        if (dateA > 0 && dateB === 0) return -1;
                        if (dateB > 0 && dateA === 0) return 1;
                        
                        // If neither has date, sort by Firebase key (which is chronologically sorted)
                        // Firebase keys are lexicographically sortable and newer keys come after older ones
                        return b.id.localeCompare(a.id); // Descending order (newest first)
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
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="container section-title" data-aos="fade-up">
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
                                            {Object.keys(selectedOrder.items).map(itemKey => {
                                                const item = selectedOrder.items[itemKey];
                                                return (
                                                    <div key={itemKey} style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        padding: '8px 0',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}>
                                                        <span><strong>{item.name}</strong> x{item.quantity}</span>
                                                        <span>{parseFloat(item.value || 0).toFixed(2)} лв</span>
                                                    </div>
                                                );
                                            })}
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
                                            const subtotal = total - deliveryFee + pickupDiscount;
                                            
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span>Сума на продукти:</span>
                                                        <span>{subtotal.toFixed(2)} лв</span>
                                                    </div>
                                                    {pickupDiscount > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#52c41a' }}>
                                                            <span>Отстъпка за вземане (10%):</span>
                                                            <span>-{pickupDiscount.toFixed(2)} лв</span>
                                                        </div>
                                                    )}
                                                    {deliveryFee > 0 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <span>Такса за доставка:</span>
                                                            <span>{deliveryFee.toFixed(2)} лв</span>
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
                                                        <span>{total.toFixed(2)} лв</span>
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