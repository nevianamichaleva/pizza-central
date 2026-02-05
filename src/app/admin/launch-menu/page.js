'use client'

import { default as showAToast } from '@/components/common/showAToast';
import CloudinaryUpload from '@/components/uploadForm';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Drawer, Form, Image, Input, Select, Space, Table } from "antd";
import dayjs from 'dayjs';
import { get, push, ref, remove, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { Option } = Select;

const LaunchMenu = () => {
  const { isAdmin } = useUser();
  const [image, setImage] = useState('');
  const [launchMenus, setLaunchMenus] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [launchMenu, setLaunchMenu] = useState(null);
  const [form] = Form.useForm();

  const weekDays = [
    { label: 'Понеделник', value: 'Понеделник' },
    { label: 'Вторник', value: 'Вторник' },
    { label: 'Сряда', value: 'Сряда' },
    { label: 'Четвъртък', value: 'Четвъртък' },
    { label: 'Петък', value: 'Петък' },
  ];
  const disabledDate = (current) => {
    const day = current.day();
    return day === 0 || day === 6;
  };

  const columns = [
    {
      title: "Действия",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => getRecord(record.id)}><EditOutlined /></a>
          <a><DeleteOutlined onClick={() => deleteRecord(record.id)} /></a>
        </Space>
      ),
    },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Ден от седмицата",
      dataIndex: "weekDay",
      key: "weekDay",
    },
    {
      title: "Изображение",
      dataIndex: "image",
      key: "image",
      render: (imageLink) => (
        <Image
          src={imageLink || "/images/no-image.png"}
          alt="Launch menu image"
          width={100}
          style={{ borderRadius: "8px" }}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (launchMenu) {
      openDrawer();
    }
  }, [launchMenu])

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    setLaunchMenu(null);
  };

  const fetchMenu = async () => {
    try {
      const menuRef = ref(rtdb, "launch-menu");
      const snapshot = await get(menuRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));
        setLaunchMenus(array);
      } else {
        showAToast('success', "Не са намерени менюта.")
      }
    } catch (error) {
      console.error("Firebase error:", error);
      showAToast('error', "Грешка при зареждане на менюта:");
    }
  };

  const addNewMenu = () => {
    setImage('');
    form.setFieldsValue({
      image: null,
      weekDay: null,
      description: '',
      dishes: [],
      date: dayjs(),
      id: null
    });
    openDrawer();
  }

  const handleAddRecord = async (values) => {
    if (!values.date) {
      values.date = dayjs();
    }
    const sanitizedDishes = (values.dishes || []).map((dish) => {
      const sanitizedDish = {
        name: dish.name || '',
        price: dish.price || '',
      };
      if (dish.weight !== undefined) {
        sanitizedDish.weight = dish.weight;
      }
      return sanitizedDish;
    });

    const menuRef = ref(rtdb, 'launch-menu');
    const data = {
      date: values.date.format('DD/MM/YYYY'),
      weekDay: values.weekDay,
      description: values.description,
      image: image || '',
      dishes: sanitizedDishes,
    };
    const newMenuRef = push(menuRef);
    set(newMenuRef, data)
      .then(() => {
        fetchMenu();
        showAToast("success", 'Добавенo успешно меню');
        closeDrawer();
      })
      .catch((error) => {
        showAToast("error", 'Грешка при добавяне на меню');
        console.error('Грешка при добавяне на меню: ', error);
      });
  }

  const handleEditRecord = async (values) => {
    if (!values.date) {
      values.date = dayjs();
    }
  
    const sanitizedDishes = (values.dishes || []).map((dish) => {
      const sanitizedDish = {
        name: dish.name || '',
        price: dish.price || '',
      };
      if (dish.weight !== undefined) {
        sanitizedDish.weight = dish.weight;
      }
      setLaunchMenu(null);
      return sanitizedDish;
    });
  
    if (!launchMenu) {
      showAToast("error", 'Липсва ID за редакция на менюто');
      return;
    }
  
    const menuRef = ref(rtdb, `launch-menu/${launchMenu}`); 
    const data = {
      date: values.date.format('DD/MM/YYYY'),
      weekDay: values.weekDay,
      description: values.description,
      image: image || '',
      dishes: sanitizedDishes,
    };
  
    set(menuRef, data)
      .then(() => {
        fetchMenu();
        showAToast("success", 'Менюто е редактирано успешно');
        closeDrawer();
      })
      .catch((error) => {
        showAToast("error", 'Грешка при редакция на менюто');
        console.error('Грешка при редакция на меню: ', error);
      });
  };
  

  const deleteRecord = async (recordId) => {
    try {
      const recordRef = ref(rtdb, `launch-menu/${recordId}`);
      await remove(recordRef);
      showAToast("success", 'Успешно изтриване');
    } catch (error) {
      showAToast("error", 'Грешка при изтриване');
      console.error("Error deleting record:", error);
    }
  };

  const handleViewMenu = (values, id) => {
    setImage(values.image);
    form.setFieldsValue({
      image: values.image,
      weekDay: values.weekDay,
      description: values.description,
      dishes: values.dishes,
      date: dayjs(values.date, 'DD/MM/YYYY'),
      id: id
    });
    
    setLaunchMenu(id);
  };

  const getRecord = async (recordId) => {
    const recordRef = ref(rtdb, `launch-menu/${recordId}`);
    const snapshot = await get(recordRef);

    if (snapshot.exists()) {
      handleViewMenu(snapshot.val(), recordId);
      return snapshot.val();
    } else {
      throw message.error("Менюто не е намерено");
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
            <span></span> <span className="description-title">Меню</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
          <div className="d-flex justify-content-center align-items-center mb-4" style={{ position: "relative" }}>
            <div>
              <Button type="primary" onClick={addNewMenu} style={{ marginRight: "10px" }}>
                Добави обедно меню
              </Button>
            </div>

          </div>

          <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
            <Table bordered dataSource={launchMenus} columns={columns} rowKey="id" />
          </div>
          <Drawer
            title={launchMenu ? "Редакция меню" : "Добави обедно меню"}
            placement="right"
            width={1200}
            onClose={closeDrawer}
            open={drawerVisible}
          >
            <Form
              form={form}
              onFinish={launchMenu ? handleEditRecord : handleAddRecord}
              layout="vertical"
              className="php-email-form"
            >
              <div className="row gy-4">
                <div className="col-md-6">
                  <Form.Item
                    name="date"
                    label="Дата"
                    rules={[{ required: false, message: 'Моля, изберете дата' }]}
                  >
                    <DatePicker
                      initialValue={dayjs()}
                      format="DD/MM/YYYY"
                      disabledDate={disabledDate}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="weekDay"
                    label="Ден от седмицата"
                    rules={[{ required: true, message: 'Моля, изберете ден от седмицата' }]}
                  >
                    <Select placeholder="Избери ден от седмицата" style={{ width: '100%' }}>
                      {weekDays.map((day) => (
                        <Option key={day.value} value={day.value}>
                          {day.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-6">
                  <div style={{ marginBottom: "16px" }}>
                    <h5>Добави снимка</h5>
                    <CloudinaryUpload setImage={setImage} />
                    <Input
                      placeholder="Изображение"
                      value={image}
                      hidden={true}
                      style={{ marginBottom: "16px" }}
                    />
                    {image && (
                      <div style={{ marginTop: '16px' }}>
                        <h4>Преглед:</h4>
                        <img
                          src={image}
                          alt="Преглед на изображение"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '4px'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="row gy-4">
                <div className="col-md-12">
                  <Form.Item
                    name="description"
                    label="Описание"
                    rules={[{ required: true, message: 'Моля, въведете описание' }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </div>
              </div>

              <Form.Item label="Списък с ястия">
                <Form.List name="dishes">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            rules={[{ required: true, message: 'Моля, въведете име на ястието' }]}
                          >
                            <Input placeholder="Име на ястието" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'weight']}
                          >
                            <Input placeholder="Грамаж (напр. 250g)" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            rules={[{ required: true, message: 'Моля, въведете цена' }]}
                          >
                            <Input placeholder="Цена (напр. 5.99)" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Добави ястие
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Form.Item>

              <div className="col-md-5 text-center">
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    {launchMenu ? 'Редакция' : 'Добави'}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Drawer>

        </div>
      </div>
    </section>
  );
};

export default LaunchMenu;
