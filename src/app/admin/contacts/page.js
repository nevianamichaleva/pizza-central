'use client';

import { useUser } from '@/context/UserContext';
import { Button, Drawer, Input, Modal, Space, Table, Tag, message } from "antd";
import { get, ref, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { rtdb } from '../../../../lib/firebase';

const AdminContactsPage = () => {
    const { isAdmin } = useUser();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replySubject, setReplySubject] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    
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
            title: "Относно",
            dataIndex: "subject",
            key: "subject",
            width: 150,
            ellipsis: true,
            responsive: ['lg'],
        },
        {
            title: "Съобщение",
            dataIndex: "message",
            key: "message",
            width: 200,
            render: (text) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '',
            ellipsis: true,
            responsive: ['lg'],
        },
        {
            title: "Статус",
            dataIndex: "replied",
            key: "replied",
            width: 120,
            render: (replied, record) => (
                <Tag color={replied ? 'green' : 'orange'}>
                    {replied ? 'Отговорено' : 'Чака отговор'}
                </Tag>
            ),
        },
        {
            title: "Действия",
            key: "actions",
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={() => showContactDetails(record)}
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
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const contactsRef = ref(rtdb, "contacts");
            const snapshot = await get(contactsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const array = Object.entries(data)
                    .map(([key, value]) => ({
                        id: key,
                        ...value,
                        // Firebase keys are chronological, so we can use them for sorting
                    }))
                    .sort((a, b) => {
                        // Sort by Firebase key in descending order (newest first)
                        return b.id.localeCompare(a.id);
                    });
                setContacts(array);
            } else {
                message.info("Няма изпратени съобщения.");
            }
        } catch (error) {
            console.error("Грешка при зареждане на съобщения:", error);
            message.error("Грешка при зареждане на съобщения.");
        }
    };

    const showContactDetails = (contact) => {
        setSelectedContact(contact);
        setIsDetailDrawerVisible(true);
    };

    const showReplyModal = (contact) => {
        setSelectedContact(contact);
        setReplySubject(`Re: ${contact.subject || 'Вашето съобщение'}`);
        setReplyMessage('');
        setIsReplyModalVisible(true);
    };

    const handleReply = async () => {
        if (!selectedContact || !replyMessage.trim()) {
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
                    contactData: selectedContact,
                    replyMessage: replyMessage.trim(),
                    replySubject: replySubject.trim(),
                    smtpConfig: smtpConfig
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update contact in Firebase with reply information
                const replyData = {
                    replied: true,
                    replyDate: new Date().toISOString(),
                    replyMessage: replyMessage.trim(),
                    replySubject: replySubject.trim(),
                    repliedBy: 'admin'
                };

                await set(ref(rtdb, `contacts/${selectedContact.id}`), {
                    ...selectedContact,
                    ...replyData
                });

                message.success(result.message);
                setIsReplyModalVisible(false);
                setReplyMessage('');
                setReplySubject('');
                setSelectedContact(null);
                // Refresh contacts list
                fetchContacts();
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
        setSelectedContact(null);
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
                        <span></span> <span className="description-title">Получени съобщения</span>
                    </p>
                    <div style={{ marginBottom: "15px" }}>
                        <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                            <i className="bi bi-arrow-left"></i> Върни се в Административния панел
                        </Link>
                    </div>
                    <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
                        <Table 
                            bordered 
                            dataSource={contacts} 
                            columns={columns} 
                            rowKey="id"
                            scroll={{ x: 800 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} от ${total} съобщения`,
                            }}
                        />
                    </div>

                    {/* Reply Modal */}
                    <Modal
                        title={`Отговор на съобщение от ${selectedContact?.name || 'Неизвестен'}`}
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
                                placeholder="Re: Вашето съобщение"
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
                        {selectedContact && (
                            <div style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: '12px', 
                                borderRadius: '4px',
                                marginTop: '16px'
                            }}>
                                <h4>Оригинално съобщение:</h4>
                                <p><strong>От:</strong> {selectedContact.name} ({selectedContact.email})</p>
                                <p><strong>Относно:</strong> {selectedContact.subject}</p>
                                <p><strong>Съобщение:</strong> {selectedContact.message}</p>
                            </div>
                        )}
                    </Modal>

                    {/* Contact Details Drawer */}
                    <Drawer
                        title="Детайли на съобщението"
                        placement="right"
                        onClose={() => setIsDetailDrawerVisible(false)}
                        open={isDetailDrawerVisible}
                        width={500}
                    >
                        {selectedContact && (
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Информация за контакта</h3>
                                    <p><strong>Име:</strong> {selectedContact.name || 'Не е посочено'}</p>
                                    <p><strong>Email:</strong> {selectedContact.email || 'Не е посочен'}</p>
                                    <p><strong>Телефон:</strong> {selectedContact.phone || 'Не е посочен'}</p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Съобщение</h3>
                                    <p><strong>Относно:</strong> {selectedContact.subject || 'Няма тема'}</p>
                                    <div style={{ 
                                        backgroundColor: '#f9f9f9', 
                                        padding: '12px', 
                                        borderRadius: '4px',
                                        marginTop: '8px'
                                    }}>
                                        {selectedContact.message || 'Няма съобщение'}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3>Статус</h3>
                                    <Tag color={selectedContact.replied ? 'green' : 'orange'} style={{ fontSize: '14px' }}>
                                        {selectedContact.replied ? 'Отговорено' : 'Чака отговор'}
                                    </Tag>
                                </div>

                                {selectedContact.replied && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3>Информация за отговора</h3>
                                        <p><strong>Дата на отговор:</strong> {
                                            selectedContact.replyDate ? 
                                            new Date(selectedContact.replyDate).toLocaleString('bg-BG') : 
                                            'Неизвестна'
                                        }</p>
                                        <p><strong>Тема на отговора:</strong> {selectedContact.replySubject || 'Няма тема'}</p>
                                        <div style={{ 
                                            backgroundColor: '#e6f7ff', 
                                            padding: '12px', 
                                            borderRadius: '4px',
                                            marginTop: '8px'
                                        }}>
                                            <strong>Отговор:</strong><br/>
                                            {selectedContact.replyMessage || 'Няма съобщение за отговор'}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '30px' }}>
                                    <Button 
                                        type="primary" 
                                        onClick={() => {
                                            setIsDetailDrawerVisible(false);
                                            showReplyModal(selectedContact);
                                        }}
                                        style={{ marginRight: '8px' }}
                                    >
                                        {selectedContact.replied ? 'Отговори отново' : 'Отговори'}
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

export default AdminContactsPage;

