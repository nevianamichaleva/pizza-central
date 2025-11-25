'use client';

import { useUser } from '@/context/UserContext';
import { Button, Card, Drawer, Input, message, Space, Table, Switch } from "antd";
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