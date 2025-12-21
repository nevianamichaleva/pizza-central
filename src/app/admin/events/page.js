'use client';

import { default as showAToast } from '@/components/common/showAToast';
import CloudinaryUpload from '@/components/uploadForm';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Image, Input, Select, Space, Table, Tag } from "antd";
import { get, push, ref, remove, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { Option } = Select;

const AdminEventsPage = () => {
  const { isAdmin } = useUser();
  const [events, setEvents] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();
  const [image, setImage] = useState('');

  const columns = [
    {
      title: "Действия",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => editEvent(record)}><EditOutlined /></a>
          <a><DeleteOutlined onClick={() => deleteEvent(record.id)} /></a>
        </Space>
      ),
    },
    {
      title: "Заглавие",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text) => text ? (text.length > 100 ? text.substring(0, 100) + '...' : text) : '',
    },
    {
      title: "Изображение",
      dataIndex: "image",
      key: "image",
      render: (imageLink) => (
        <Image
          src={imageLink || "/images/no-image.png"}
          alt="Event image"
          width={100}
          style={{ borderRadius: "8px" }}
        />
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          'active': { text: 'Активно', color: 'green' },
          'inactive': { text: 'Неактивно', color: 'red' },
          'archived': { text: 'Архивирано', color: 'orange' }
        };
        const currentStatus = status || 'active';
        return (
          <Tag color={statusMap[currentStatus]?.color || 'default'}>
            {statusMap[currentStatus]?.text || currentStatus}
          </Tag>
        );
      },
    },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      openDrawer();
    }
  }, [selectedEvent]);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedEvent(null);
    setImage('');
    form.resetFields();
  };

  const fetchEvents = async () => {
    try {
      const eventsRef = ref(rtdb, "events");
      const snapshot = await get(eventsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .sort((a, b) => {
            // Sort by creation order (newest first) - using Firebase key
            return b.id.localeCompare(a.id);
          });
        setEvents(array);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Firebase error:", error);
      showAToast('error', "Грешка при зареждане на събития");
    }
  };

  const addNewEvent = () => {
    form.setFieldsValue({
      title: '',
      description: '',
      slug: '',
      image: null,
      status: 'active',
      id: null
    });
    setImage('');
    setSelectedEvent(null);
    openDrawer();
  };

  const editEvent = (event) => {
    form.setFieldsValue({
      title: event.title,
      description: event.description,
      slug: event.slug,
      image: event.image,
      status: event.status || 'active',
      id: event.id
    });
    setImage(event.image || '');
    setSelectedEvent(event);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (values) => {
    try {
      const slug = values.slug || generateSlug(values.title);
      const eventData = {
        title: values.title,
        description: values.description,
        slug: slug,
        image: image || '',
        status: values.status || 'active',
      };

      if (selectedEvent && selectedEvent.id) {
        // Update existing event
        const eventRef = ref(rtdb, `events/${selectedEvent.id}`);
        await set(eventRef, eventData);
        showAToast("success", 'Събитието е обновено успешно');
      } else {
        // Add new event
        const eventsRef = ref(rtdb, 'events');
        const newEventRef = push(eventsRef);
        await set(newEventRef, eventData);
        showAToast("success", 'Събитието е добавено успешно');
      }

      fetchEvents();
      closeDrawer();
    } catch (error) {
      console.error('Error saving event:', error);
      showAToast("error", 'Грешка при запазване на събитието');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това събитие?')) {
      return;
    }

    try {
      const eventRef = ref(rtdb, `events/${eventId}`);
      await remove(eventRef);
      showAToast("success", 'Събитието е изтрито успешно');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      showAToast("error", 'Грешка при изтриване на събитието');
    }
  };

  if (!isAdmin) {
    return (
      <section id="contact" className="contact section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="container section-title" data-aos="fade-up">
            <h2>Ресторант-пицария Централ</h2>
            <p>
              <span></span> <span className="description-title">Нямате права за тази страница</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="container section-title" data-aos="fade-up">
          <h2>Административен панел</h2>
          
          <p>
            <span></span> <span className="description-title">Управление на събития</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
          <Button type="primary" onClick={addNewEvent} style={{ marginBottom: '20px' }}>
            Добави ново събитие
          </Button>
          <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
            <Table
              bordered
              dataSource={events}
              columns={columns}
              rowKey="id"
            />
          </div>
          <Drawer
            title={selectedEvent ? "Редактиране на събитие" : "Добавяне на ново събитие"}
            visible={drawerVisible}
            onClose={closeDrawer}
            width={600}
          >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="title"
                label="Заглавие"
                rules={[{ required: true, message: "Моля, въведете заглавие" }]}
              >
                <Input placeholder="Заглавие на събитието" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Описание"
                rules={[{ required: true, message: "Моля, въведете описание" }]}
              >
                <Input.TextArea rows={4} placeholder="Описание на събитието" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug (URL идентификатор)"
              >
                <Input placeholder="Автоматично се генерира от заглавието" />
              </Form.Item>

              <Form.Item
                name="image"
                label="Изображение"
              >
                <CloudinaryUpload setImage={setImage} />
                {image && (
                  <div style={{ marginTop: '10px' }}>
                    <Image
                      src={image}
                      alt="Preview"
                      width={200}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="status"
                label="Статус"
                rules={[{ required: true, message: "Моля, изберете статус" }]}
              >
                <Select>
                  <Option value="active">Активно</Option>
                  <Option value="inactive">Неактивно</Option>
                  <Option value="archived">Архивирано</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {selectedEvent ? "Обнови" : "Добави"}
                  </Button>
                  <Button onClick={closeDrawer}>Отказ</Button>
                </Space>
              </Form.Item>
            </Form>
          </Drawer>
        </div>
      </div>
    </section>
  );
};

export default AdminEventsPage;

