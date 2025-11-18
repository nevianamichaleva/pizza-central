'use client';

import { default as showAToast } from '@/components/common/showAToast';
import CloudinaryUpload from '@/components/uploadForm';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Image, Input, Select, Space, Table } from "antd";
import { get, push, ref, remove, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { Option } = Select;

const AdminNewDishesPage = () => {
  const { isAdmin } = useUser();
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [form] = Form.useForm();
  const [image, setImage] = useState('');

  const columns = [
    {
      title: "Действия",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => editDish(record)}><EditOutlined /></a>
          <a><DeleteOutlined onClick={() => deleteDish(record.id)} /></a>
        </Space>
      ),
    },
    {
      title: "Име",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Категория",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Продукт",
      dataIndex: "productId",
      key: "productId",
      render: (productId, record) => {
        if (!productId) return '-';
        const product = products.find(p => p.id === productId);
        return product ? `${product.name} (${parseFloat(product.price || 0).toFixed(2)} лв)` : '-';
      },
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text) => text ? (text.length > 100 ? text.substring(0, 100) + '...' : text) : '',
    },
    {
      title: "Изображение",
      dataIndex: "img",
      key: "img",
      render: (imageLink) => (
        <Image
          src={imageLink || "/images/no-image.png"}
          alt="Dish image"
          width={100}
          style={{ borderRadius: "8px" }}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchDishes();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = ref(rtdb, "products");
      const snapshot = await get(productsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));
        setProducts(array);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (selectedDish) {
      openDrawer();
    }
  }, [selectedDish]);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedDish(null);
    setImage('');
    form.resetFields();
  };

  const fetchDishes = async () => {
    try {
      const dishesRef = ref(rtdb, "new-dishes");
      const snapshot = await get(dishesRef);

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
        setDishes(array);
      } else {
        setDishes([]);
      }
    } catch (error) {
      console.error("Firebase error:", error);
      showAToast('error', "Грешка при зареждане на нови предложения");
    }
  };

  const addNewDish = () => {
    form.setFieldsValue({
      name: '',
      title: '',
      description: '',
      productId: null,
      img: null,
      id: null
    });
    setImage('');
    setSelectedDish(null);
    openDrawer();
  };

  const editDish = (dish) => {
    form.setFieldsValue({
      name: dish.name,
      title: dish.title,
      description: dish.description,
      productId: dish.productId || null,
      img: dish.img,
      id: dish.id
    });
    setImage(dish.img || '');
    setSelectedDish(dish);
  };

  const handleSubmit = async (values) => {
    try {
      if (!values.productId) {
        showAToast("error", "Моля, изберете продукт");
        return;
      }

      const dishData = {
        name: values.name,
        title: values.title,
        description: values.description,
        productId: values.productId,
        img: image || '',
        social: {
          twitter: "",
          facebook: "",
          instagram: "",
          linkedin: "",
        },
      };

      if (selectedDish && selectedDish.id) {
        // Update existing dish
        const dishRef = ref(rtdb, `new-dishes/${selectedDish.id}`);
        await set(dishRef, dishData);
        showAToast("success", 'Предложението е обновено успешно');
      } else {
        // Add new dish
        const dishesRef = ref(rtdb, 'new-dishes');
        const newDishRef = push(dishesRef);
        await set(newDishRef, dishData);
        showAToast("success", 'Предложението е добавено успешно');
      }

      fetchDishes();
      closeDrawer();
    } catch (error) {
      console.error('Error saving dish:', error);
      showAToast("error", 'Грешка при запазване на предложението');
    }
  };

  const deleteDish = async (dishId) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това предложение?')) {
      return;
    }

    try {
      const dishRef = ref(rtdb, `new-dishes/${dishId}`);
      await remove(dishRef);
      showAToast("success", 'Предложението е изтрито успешно');
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      showAToast("error", 'Грешка при изтриване на предложението');
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
            <span></span> <span className="description-title">Управление на нови предложения</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
          <Button type="primary" onClick={addNewDish} style={{ marginBottom: '20px' }}>
            Добави ново предложение
          </Button>
          <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
            <Table
              bordered
              dataSource={dishes}
              columns={columns}
              rowKey="id"
            />
          </div>
          <Drawer
            title={selectedDish ? "Редактиране на предложение" : "Добавяне на ново предложение"}
            visible={drawerVisible}
            onClose={closeDrawer}
            width={600}
          >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="name"
                label="Име на ястието"
                rules={[{ required: true, message: "Моля, въведете име" }]}
              >
                <Input placeholder="Име на ястието" />
              </Form.Item>

              <Form.Item
                name="title"
                label="Категория"
                rules={[{ required: true, message: "Моля, въведете категория" }]}
              >
                <Input placeholder="Например: Основни ястия" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Описание"
                rules={[{ required: true, message: "Моля, въведете описание" }]}
              >
                <Input.TextArea rows={4} placeholder="Описание на ястието" />
              </Form.Item>

              <Form.Item
                name="productId"
                label="Продукт"
                rules={[{ required: true, message: "Моля, изберете продукт" }]}
              >
                <Select
                  showSearch
                  placeholder="Изберете продукт"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map((product) => (
                    <Option key={product.id} value={product.id}>
                      {product.name} - {parseFloat(product.price || 0).toFixed(2)} лв
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="img"
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

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {selectedDish ? "Обнови" : "Добави"}
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

export default AdminNewDishesPage;

