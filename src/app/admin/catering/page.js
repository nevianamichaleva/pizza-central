'use client';

import { useUser } from '@/context/UserContext';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import { get, ref, remove, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

const AdminCateringPage = () => {
    const { isAdmin } = useUser();
    const [cateringRequests, setCateringRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replySubject, setReplySubject] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [editingNotes, setEditingNotes] = useState({});
    const [notesValues, setNotesValues] = useState({});

    const eventTypeLabels = {
        'firmeno': 'Фирмено събитие',
        'rozhden-den': 'Рожден ден',
        'krushtene': 'Кръщене',
        'chastno-parti': 'Частно парти',
        'sreshta': 'Среща/Обучение',
        'prezentatsiya': 'Презентация',
        'kokteyl': 'Коктейл',
        'drugo': 'Друго',
    };

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
            title: "Дата на събитието",
            dataIndex: "date",
            key: "date",
            width: 120,
        },
        {
            title: "Брой гости",
            dataIndex: "people",
            key: "people",
            width: 100,
            responsive: ['lg'],
        },
        {
            title: "Вид събитие",
            dataIndex: "eventType",
            key: "eventType",
            width: 150,
            render: (eventType) => eventTypeLabels[eventType] || eventType || 'Не е посочено',
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
                                    placeholder="Детайли за меню, цени, специални изисквания..."
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
                        onChange={(newStatus) => updateCateringStatus(record.id, newStatus)}
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
                                value: 'in-progress', 
                                label: <span style={{ color: '#1890ff' }}>🔄 В процес</span>
                            },
                            { 
                                value: 'completed', 
                                label: <span style={{ color: '#722ed1' }}>✅ Завършена</span>
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
            width: 240,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={() => showCateringDetails(record)}
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
                    <Popconfirm
                        title="Изтриване на заявка"
                        description={`Сигурни ли сте, че искате да изтриете заявката от ${record.name} за ${record.date || 'неизвестна дата'}?`}
                        onConfirm={() => deleteCateringRequest(record)}
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

    useEffect(() => {
        fetchCateringRequests();
    }, []);

    const fetchCateringRequests = async () => {
        try {
            const cateringRef = ref(rtdb, "catering");
            const snapshot = await get(cateringRef);

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
                        const parseDate = (dateStr) => {
                            if (!dateStr) return 0;
                            
                            // Parse DD-MM-YYYY format
                            const parts = dateStr.split('-');
                            if (parts.length !== 3) return 0;
                            
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                            const year = parseInt(parts[2], 10);
                            
                            if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;
                            
                            return new Date(year, month, day).getTime();
                        };
                        
                        const dateA = parseDate(a.date);
                        const dateB = parseDate(b.date);
                        
                        // If dates are not valid, use createdAt or Firebase key
                        if (!dateA && !dateB) {
                            if (a.createdAt && b.createdAt) {
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            }
                            return b.id.localeCompare(a.id); // Descending order for keys
                        }
                        
                        return dateB - dateA; // Descending order (newest first)
                    });
                setCateringRequests(array);
            } else {
                message.info("Няма кетъринг заявки.");
            }
        } catch (error) {
            console.error("Грешка при зареждане на кетъринг заявки:", error);
            message.error("Грешка при зареждане на кетъринг заявки");
        }
    };

    const updateCateringStatus = async (requestId, newStatus) => {
        try {
            const requestRef = ref(rtdb, `catering/${requestId}`);
            const snapshot = await get(requestRef);
            
            if (snapshot.exists()) {
                const requestData = snapshot.val();
                await set(requestRef, {
                    ...requestData,
                    status: newStatus
                });
                
                message.success(`Статусът на заявката е променен на "${getStatusLabel(newStatus)}"`);
                fetchCateringRequests(); // Refresh the requests list
            }
        } catch (error) {
            console.error("Грешка при обновяване на статуса:", error);
            message.error("Грешка при обновяване на статуса на заявката");
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': 'Чака отговор',
            'confirmed': 'Потвърдена',
            'in-progress': 'В процес',
            'completed': 'Завършена',
            'cancelled': 'Отказана'
        };
        return statusMap[status] || 'Чака отговор';
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': '#faad14',
            'confirmed': '#52c41a',
            'in-progress': '#1890ff',
            'completed': '#722ed1',
            'cancelled': '#f5222d'
        };
        return colorMap[status] || '#faad14';
    };

    const startEditingNotes = (requestId, currentNotes) => {
        setEditingNotes({ ...editingNotes, [requestId]: true });
        setNotesValues({ ...notesValues, [requestId]: currentNotes || '' });
    };

    const cancelEditingNotes = (requestId) => {
        setEditingNotes({ ...editingNotes, [requestId]: false });
        setNotesValues({ ...notesValues, [requestId]: '' });
    };

    const saveNotes = async (requestId) => {
        try {
            const requestRef = ref(rtdb, `catering/${requestId}`);
            const snapshot = await get(requestRef);
            
            if (snapshot.exists()) {
                const requestData = snapshot.val();
                await set(requestRef, {
                    ...requestData,
                    adminNotes: notesValues[requestId] || ''
                });
                
                setEditingNotes({ ...editingNotes, [requestId]: false });
                message.success('Бележките са запазени успешно!');
                fetchCateringRequests(); // Refresh the requests list
            }
        } catch (error) {
            console.error("Грешка при запазване на бележки:", error);
            message.error("Грешка при запазване на бележките");
        }
    };

    const showCateringDetails = (request) => {
        setSelectedRequest(request);
        setIsDetailDrawerVisible(true);
    };

    const showReplyModal = (request) => {
        setSelectedRequest(request);
        setReplySubject(`Re: Кетъринг заявка за ${request.date || 'неизвестна дата'}`);
        setReplyMessage('');
        setIsReplyModalVisible(true);
    };

    const handleReply = async () => {
        if (!selectedRequest || !replyMessage.trim()) {
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
                        ...selectedRequest,
                        subject: `Кетъринг заявка за ${selectedRequest.date || 'неизвестна дата'}`,
                        email: selectedRequest.email || ''
                    },
                    replyMessage: replyMessage.trim(),
                    replySubject: replySubject.trim(),
                    smtpConfig: smtpConfig
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update request in Firebase with reply information
                const replyData = {
                    replied: true,
                    replyDate: new Date().toISOString(),
                    replyMessage: replyMessage.trim(),
                    replySubject: replySubject.trim(),
                    repliedBy: 'admin'
                };

                await set(ref(rtdb, `catering/${selectedRequest.id}`), {
                    ...selectedRequest,
                    ...replyData
                });

                message.success(result.message);
                setIsReplyModalVisible(false);
                setReplyMessage('');
                setReplySubject('');
                setSelectedRequest(null);
                // Refresh requests list
                fetchCateringRequests();
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
        setSelectedRequest(null);
    };

    const deleteCateringRequest = async (request) => {
        if (!request || !request.id) {
            message.error('Невалидна заявка');
            return;
        }
        
        try {
            const requestRef = ref(rtdb, `catering/${request.id}`);
            await remove(requestRef);
            message.success('Заявката е изтрита успешно');
            fetchCateringRequests();
        } catch (error) {
            console.error('Error deleting catering request:', error);
            message.error('Грешка при изтриване на заявката');
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

    return (
        <section id="contact" className="contact section">
            <div className="container">
                <div className="container section-title">
                    <h2>Административен панел</h2>
                    
                    <p>
                        <span></span> <span className="description-title">Кетъринг заявки</span>
                    </p>
                    <div style={{ marginBottom: "15px" }}>
                        <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                            <i className="bi bi-arrow-left"></i> Върни се в Административния панел
                        </Link>
                    </div>
                    <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
                        <Table 
                            bordered 
                            dataSource={cateringRequests} 
                            columns={columns} 
                            rowKey="id"
                            scroll={{ x: 800 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} от ${total} заявки`,
                            }}
                        />
                    </div>

                    {/* Reply Modal */}
                    <Modal
                        title={`Отговор на кетъринг заявка от ${selectedRequest?.name || 'Неизвестен'}`}
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
                                placeholder="Re: Кетъринг заявка за..."
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
                        {selectedRequest && (
                            <div style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: '12px', 
                                borderRadius: '4px',
                                marginTop: '16px'
                            }}>
                                <h4>Оригинална заявка:</h4>
                                <p><strong>От:</strong> {selectedRequest.name} ({selectedRequest.email || 'Няма email'})</p>
                                <p><strong>Телефон:</strong> {selectedRequest.phone}</p>
                                <p><strong>Дата на събитието:</strong> {selectedRequest.date}</p>
                                <p><strong>Брой гости:</strong> {selectedRequest.people}</p>
                                <p><strong>Вид събитие:</strong> {eventTypeLabels[selectedRequest.eventType] || selectedRequest.eventType || 'Не е посочено'}</p>
                                {selectedRequest.message && (
                                    <p><strong>Описание:</strong> {selectedRequest.message}</p>
                                )}
                            </div>
                        )}
                    </Modal>

                    {/* Catering Request Details Drawer */}
                    <Drawer
                        title="Детайли на кетъринг заявката"
                        placement="right"
                        onClose={() => setIsDetailDrawerVisible(false)}
                        open={isDetailDrawerVisible}
                        width={500}
                    >
                        {selectedRequest && (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Информация за клиента</h3>
                                    <p><strong>Име:</strong> {selectedRequest.name || 'Не е посочено'}</p>
                                    <p><strong>Email:</strong> {selectedRequest.email || 'Не е посочен'}</p>
                                    <p><strong>Телефон:</strong> {selectedRequest.phone || 'Не е посочен'}</p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Детайли на заявката</h3>
                                    <p><strong>Дата на събитието:</strong> {selectedRequest.date || 'Не е посочена'}</p>
                                    <p><strong>Брой гости:</strong> {selectedRequest.people || 'Не е посочен'}</p>
                                    <p><strong>Вид събитие:</strong> {eventTypeLabels[selectedRequest.eventType] || selectedRequest.eventType || 'Не е посочено'}</p>
                                    {selectedRequest.message && (
                                        <div style={{ marginTop: '15px' }}>
                                            <strong>Допълнителни уточнения:</strong>
                                            <div style={{ 
                                                backgroundColor: '#f9f9f9', 
                                                padding: '10px', 
                                                borderRadius: '4px',
                                                marginTop: '5px'
                                            }}>
                                                {selectedRequest.message}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedRequest.adminNotes && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3>Админ бележки</h3>
                                        <div style={{ 
                                            backgroundColor: '#fff7e6', 
                                            padding: '12px', 
                                            borderRadius: '4px',
                                            border: '1px solid #ffd591'
                                        }}>
                                            {selectedRequest.adminNotes}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Статус</h3>
                                    <Tag color={getStatusColor(selectedRequest.status || 'pending')} style={{ fontSize: '14px' }}>
                                        {getStatusLabel(selectedRequest.status || 'pending')}
                                    </Tag>
                                </div>

                                {selectedRequest.replied && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3>Информация за отговора</h3>
                                        <p><strong>Дата на отговор:</strong> {
                                            selectedRequest.replyDate ? 
                                            new Date(selectedRequest.replyDate).toLocaleString('bg-BG') : 
                                            'Неизвестна'
                                        }</p>
                                        <p><strong>Тема на отговора:</strong> {selectedRequest.replySubject || 'Няма тема'}</p>
                                        <div style={{ 
                                            backgroundColor: '#e6f7ff', 
                                            padding: '12px', 
                                            borderRadius: '4px',
                                            marginTop: '8px'
                                        }}>
                                            <strong>Отговор:</strong><br/>
                                            {selectedRequest.replyMessage || 'Няма съобщение за отговор'}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '30px' }}>
                                    <Button 
                                        type="primary" 
                                        onClick={() => {
                                            setIsDetailDrawerVisible(false);
                                            showReplyModal(selectedRequest);
                                        }}
                                        style={{ marginRight: '8px' }}
                                    >
                                        {selectedRequest.replied ? 'Отговори отново' : 'Отговори'}
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

export default AdminCateringPage;

