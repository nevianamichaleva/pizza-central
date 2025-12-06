'use client';

import { useUser } from '@/context/UserContext';
import { Button, Drawer, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { get, ref, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

const AdminBookingsPage = () => {
    const { isAdmin } = useUser();
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replySubject, setReplySubject] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [editingNotes, setEditingNotes] = useState({});
    const [notesValues, setNotesValues] = useState({});
    const columns = [
        {
            title: "Име",
            dataIndex: "name",
            key: "name",
            width: 120,
            ellipsis: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 180,
            ellipsis: true,
        },
        {
            title: "Телефон",
            dataIndex: "phone",
            key: "phone",
            width: 120,
            ellipsis: true,
            responsive: ['md'],
        },
        {
            title: "Дата",
            dataIndex: "date",
            key: "date",
            width: 100,
        },
        {
            title: "Час",
            dataIndex: "time",
            key: "time",
            width: 80,
            responsive: ['lg'],
        },
        {
            title: "Брой човека",
            dataIndex: "people",
            key: "people",
            width: 100,
            responsive: ['lg'],
        },
        {
            title: "Описание",
            dataIndex: "message",
            key: "message",
            width: 200,
            render: (text) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '',
            ellipsis: true,
            responsive: ['lg'],
        },
        {
            title: "Админ бележки",
            dataIndex: "adminNotes",
            key: "adminNotes",
            width: 200,
            render: (notes, record) => {
                const isEditing = editingNotes[record.id];
                const currentValue = notesValues[record.id] || notes || '';
                
                return (
                    <div style={{ minHeight: '32px' }}>
                        {isEditing ? (
                            <div>
                                <Input.TextArea
                                    value={currentValue}
                                    onChange={(e) => setNotesValues({ 
                                        ...notesValues, 
                                        [record.id]: e.target.value 
                                    })}
                                    placeholder="Маса №5, прозорец, специални изисквания..."
                                    rows={2}
                                    style={{ marginBottom: '8px' }}
                                />
                                <div>
                                    <Button 
                                        type="primary" 
                                        size="small"
                                        onClick={() => saveNotes(record.id)}
                                        style={{ marginRight: '8px' }}
                                    >
                                        Запази
                                    </Button>
                                    <Button 
                                        size="small"
                                        onClick={() => cancelEditingNotes(record.id)}
                                    >
                                        Отказ
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => startEditingNotes(record.id, notes)}
                                style={{ 
                                    cursor: 'pointer',
                                    minHeight: '20px',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    border: '1px dashed #d9d9d9',
                                    color: notes ? '#000' : '#999'
                                }}
                                title="Кликнете за редактиране"
                            >
                                {notes || 'Добавете бележки...'}
                            </div>
                        )}
                    </div>
                );
            },
            responsive: ['md'],
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status, record) => {
                const currentStatus = status || 'pending';
                return (
                    <Select
                        value={currentStatus}
                        style={{ 
                            width: '100%',
                            color: getStatusColor(currentStatus)
                        }}
                        onChange={(newStatus) => updateBookingStatus(record.id, newStatus)}
                        options={[
                            { 
                                value: 'pending', 
                                label: <span style={{ color: '#faad14' }}>🕐 Чака отговор</span>
                            },
                            { 
                                value: 'confirmed', 
                                label: <span style={{ color: '#52c41a' }}>✅ Потвърдена</span>
                            },
                            { 
                                value: 'cancelled', 
                                label: <span style={{ color: '#f5222d' }}>❌ Отказана</span>
                            }
                        ]}
                    />
                );
            },
        },
        {
            title: "Действия",
            key: "actions",
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={() => showBookingDetails(record)}
                    >
                        Детайли
                    </Button>
                    <Button 
                        type={record.replied ? "default" : "primary"}
                        size="small"
                        onClick={() => showReplyModal(record)}
                    >
                        {record.replied ? 'Отговори отново' : 'Отговори'}
                    </Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const bookingRef = ref(rtdb, "booking");
            const snapshot = await get(bookingRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const array = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                    }))
                    .sort((a, b) => {
                        // Sort by date in descending order (newest first)
                        // Date format is DD-MM-YYYY
                        const parseDate = (dateStr, timeStr) => {
                            if (!dateStr) return 0;
                            
                            // Parse DD-MM-YYYY format
                            const parts = dateStr.split('-');
                            if (parts.length !== 3) return 0;
                            
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                            const year = parseInt(parts[2], 10);
                            
                            if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;
                            
                            let date = new Date(year, month, day);
                            
                            // Add time if available (format HH:mm)
                            if (timeStr) {
                                const timeParts = timeStr.split(':');
                                if (timeParts.length === 2) {
                                    const hours = parseInt(timeParts[0], 10);
                                    const minutes = parseInt(timeParts[1], 10);
                                    if (!isNaN(hours) && !isNaN(minutes)) {
                                        date.setHours(hours, minutes, 0, 0);
                                    }
                                }
                            }
                            
                            return date.getTime();
                        };
                        
                        const dateA = parseDate(a.date, a.time);
                        const dateB = parseDate(b.date, b.time);
                        
                        // If dates are not valid, use Firebase key (which is chronologically sorted)
                        if (!dateA && !dateB) {
                            return b.id.localeCompare(a.id); // Descending order for keys
                        }
                        
                        return dateB - dateA; // Descending order (newest first)
                    });
                setBookings(array);
            } else {
                message.error("Няма резервации.");
            }
        } catch (error) {
            console.error("Грешка при зареждане на резервации:", error);
        }
    };

    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const bookingRef = ref(rtdb, `booking/${bookingId}`);
            const snapshot = await get(bookingRef);
            
            if (snapshot.exists()) {
                const bookingData = snapshot.val();
                await set(bookingRef, {
                    ...bookingData,
                    status: newStatus
                });
                
                message.success(`Статусът на резервацията е променен на "${getStatusLabel(newStatus)}"`);
                fetchBookings(); // Refresh the bookings list
            }
        } catch (error) {
            console.error("Грешка при обновяване на статуса:", error);
            message.error("Грешка при обновяване на статуса на резервацията");
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': 'Чака отговор',
            'confirmed': 'Потвърдена',
            'cancelled': 'Отказана'
        };
        return statusMap[status] || 'Чака отговор';
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': '#faad14',
            'confirmed': '#52c41a',
            'cancelled': '#f5222d'
        };
        return colorMap[status] || '#faad14';
    };

    const startEditingNotes = (bookingId, currentNotes) => {
        setEditingNotes({ ...editingNotes, [bookingId]: true });
        setNotesValues({ ...notesValues, [bookingId]: currentNotes || '' });
    };

    const cancelEditingNotes = (bookingId) => {
        setEditingNotes({ ...editingNotes, [bookingId]: false });
        setNotesValues({ ...notesValues, [bookingId]: '' });
    };

    const saveNotes = async (bookingId) => {
        try {
            const bookingRef = ref(rtdb, `booking/${bookingId}`);
            const snapshot = await get(bookingRef);
            
            if (snapshot.exists()) {
                const bookingData = snapshot.val();
                await set(bookingRef, {
                    ...bookingData,
                    adminNotes: notesValues[bookingId] || ''
                });
                
                setEditingNotes({ ...editingNotes, [bookingId]: false });
                message.success('Бележките са запазени успешно!');
                fetchBookings(); // Refresh the bookings list
            }
        } catch (error) {
            console.error("Грешка при запазване на бележки:", error);
            message.error("Грешка при запазване на бележките");
        }
    };

    const showBookingDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDetailDrawerVisible(true);
    };

    const showReplyModal = (booking) => {
        setSelectedBooking(booking);
        setReplySubject(`Re: Резервация за ${booking.date || 'неизвестна дата'}`);
        setReplyMessage('');
        setIsReplyModalVisible(true);
    };

    const handleReply = async () => {
        if (!selectedBooking || !replyMessage.trim()) {
            message.error('Моля въведете съобщение за отговор');
            return;
        }

        setIsReplying(true);
        try {
            // Get SMTP config from Firebase
            let smtpConfig = null;
            try {
                const smtpRef = ref(rtdb, 'settings/email');
                const smtpSnapshot = await get(smtpRef);
                
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
            } catch (error) {
                console.error('Error fetching SMTP config:', error);
            }

            // Send email via API
            const response = await fetch('/api/reply-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactData: {
                        ...selectedBooking,
                        subject: `Резервация за ${selectedBooking.date || 'неизвестна дата'}`
                    },
                    replyMessage: replyMessage.trim(),
                    replySubject: replySubject.trim(),
                    smtpConfig: smtpConfig
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update booking in Firebase with reply information
                const replyData = {
                    replied: true,
                    replyDate: new Date().toISOString(),
                    replyMessage: replyMessage.trim(),
                    replySubject: replySubject.trim(),
                    repliedBy: 'admin'
                };

                await set(ref(rtdb, `booking/${selectedBooking.id}`), {
                    ...selectedBooking,
                    ...replyData
                });

                message.success(result.message);
                setIsReplyModalVisible(false);
                setReplyMessage('');
                setReplySubject('');
                setSelectedBooking(null);
                // Refresh bookings list
                fetchBookings();
            } else {
                message.error(result.error || 'Грешка при изпращане на отговора');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            message.error('Грешка при изпращане на отговора');
        } finally {
            setIsReplying(false);
        }
    };

    const handleCancelReply = () => {
        setIsReplyModalVisible(false);
        setReplyMessage('');
        setReplySubject('');
        setSelectedBooking(null);
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
                        <span></span> <span className="description-title">Направени резервации</span>
                    </p>
                    <div style={{ marginBottom: "15px" }}>
                        <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                            <i className="bi bi-arrow-left"></i> Върни се в Административния панел
                        </Link>
                    </div>
                    <div className="d-flex justify-content-center align-items-center mb-4" style={{ position: "relative" }}>

                    </div>
                    <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
                        <Table 
                            bordered 
                            dataSource={bookings} 
                            columns={columns} 
                            rowKey="id"
                            scroll={{ x: 800 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} от ${total} резервации`,
                            }}
                        />
                    </div>

                    {/* Reply Modal */}
                    <Modal
                        title={`Отговор на резервация от ${selectedBooking?.name || 'Неизвестен'}`}
                        open={isReplyModalVisible}
                        onOk={handleReply}
                        onCancel={handleCancelReply}
                        confirmLoading={isReplying}
                        okText="Изпрати отговор"
                        cancelText="Отказ"
                        width={600}
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Тема на отговора:
                            </label>
                            <Input
                                value={replySubject}
                                onChange={(e) => setReplySubject(e.target.value)}
                                placeholder="Re: Резервация за..."
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Съобщение за отговор:
                            </label>
                            <Input.TextArea
                                rows={6}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Въведете вашия отговор тук..."
                            />
                        </div>
                        {selectedBooking && (
                            <div style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: '12px', 
                                borderRadius: '4px',
                                marginTop: '16px'
                            }}>
                                <h4>Оригинална резервация:</h4>
                                <p><strong>От:</strong> {selectedBooking.name} ({selectedBooking.email})</p>
                                <p><strong>Телефон:</strong> {selectedBooking.phone}</p>
                                <p><strong>Дата:</strong> {selectedBooking.date} в {selectedBooking.time}</p>
                                <p><strong>Брой човека:</strong> {selectedBooking.people}</p>
                                <p><strong>Описание:</strong> {selectedBooking.message}</p>
                            </div>
                        )}
                    </Modal>

                    {/* Booking Details Drawer */}
                    <Drawer
                        title="Детайли на резервацията"
                        placement="right"
                        onClose={() => setIsDetailDrawerVisible(false)}
                        open={isDetailDrawerVisible}
                        width={500}
                    >
                        {selectedBooking && (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Информация за клиента</h3>
                                    <p><strong>Име:</strong> {selectedBooking.name || 'Не е посочено'}</p>
                                    <p><strong>Email:</strong> {selectedBooking.email || 'Не е посочен'}</p>
                                    <p><strong>Телефон:</strong> {selectedBooking.phone || 'Не е посочен'}</p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Детайли на резервацията</h3>
                                    <p><strong>Дата:</strong> {selectedBooking.date || 'Не е посочена'}</p>
                                    <p><strong>Час:</strong> {selectedBooking.time || 'Не е посочен'}</p>
                                    <p><strong>Брой човека:</strong> {selectedBooking.people || 'Не е посочен'}</p>
                                    {selectedBooking.message && (
                                        <div style={{ marginTop: '15px' }}>
                                            <strong>Описание:</strong>
                                            <div style={{ 
                                                backgroundColor: '#f9f9f9', 
                                                padding: '10px', 
                                                borderRadius: '4px',
                                                marginTop: '5px'
                                            }}>
                                                {selectedBooking.message}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedBooking.adminNotes && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3>Админ бележки</h3>
                                        <div style={{ 
                                            backgroundColor: '#fff7e6', 
                                            padding: '12px', 
                                            borderRadius: '4px',
                                            border: '1px solid #ffd591'
                                        }}>
                                            {selectedBooking.adminNotes}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Статус</h3>
                                    <Tag color={getStatusColor(selectedBooking.status || 'pending')} style={{ fontSize: '14px' }}>
                                        {getStatusLabel(selectedBooking.status || 'pending')}
                                    </Tag>
                                </div>

                                {selectedBooking.replied && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3>Информация за отговора</h3>
                                        <p><strong>Дата на отговор:</strong> {
                                            selectedBooking.replyDate ? 
                                            new Date(selectedBooking.replyDate).toLocaleString('bg-BG') : 
                                            'Неизвестна'
                                        }</p>
                                        <p><strong>Тема на отговора:</strong> {selectedBooking.replySubject || 'Няма тема'}</p>
                                        <div style={{ 
                                            backgroundColor: '#e6f7ff', 
                                            padding: '12px', 
                                            borderRadius: '4px',
                                            marginTop: '8px'
                                        }}>
                                            <strong>Отговор:</strong><br/>
                                            {selectedBooking.replyMessage || 'Няма съобщение за отговор'}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '30px' }}>
                                    <Button 
                                        type="primary" 
                                        onClick={() => {
                                            setIsDetailDrawerVisible(false);
                                            showReplyModal(selectedBooking);
                                        }}
                                        style={{ marginRight: '8px' }}
                                    >
                                        {selectedBooking.replied ? 'Отговори отново' : 'Отговори'}
                                    </Button>
                                    <Button onClick={() => setIsDetailDrawerVisible(false)}>
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

export default AdminBookingsPage;