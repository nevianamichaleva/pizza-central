'use client'

import { default as showAToast } from '@/components/common/showAToast';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, message, Space, Table } from "antd";
import { get, push, ref, remove, set, update } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const PackagingManagement = () => {
  const { isAdmin } = useUser();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [packaging, setPackaging] = useState(null);
  const [packagingList, setPackagingList] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

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
      title: "Име",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
      render: (price) => {
        const priceFloat = parseFloat(price);
        if (priceFloat % 1 === 0) {
          return `${priceFloat.toFixed(0)} лв.`;
        }
        return `${priceFloat.toFixed(2)} лв.`;
      },
    },
  ];

  useEffect(() => {
    fetchPackaging();
  }, []);

  useEffect(() => {
    if (packaging) {
      openDrawer();
    }
  }, [packaging]);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    handleViewPackaging(null, null);
    setDrawerVisible(false);
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    
    if (!name || !price) {
      showAToast('error', 'Моля, попълнете всички полета!');
      return;
    }

    const packagingRef = ref(rtdb, 'packaging');
    const newPackagingRef = push(packagingRef);
    
    set(newPackagingRef, {
      name: name.trim(),
      price: parseFloat(price),
    })
      .then(() => {
        closeDrawer();
        showAToast('success', "Опаковката е добавена успешно!");
        fetchPackaging();
      })
      .catch((error) => {
        showAToast('error', "Грешка при добавяне на опаковка!");
        console.error('Error adding packaging: ', error);
      });
  };

  const fetchPackaging = async () => {
    try {
      const packagingRef = ref(rtdb, "packaging");
      const snapshot = await get(packagingRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));
        setPackagingList(array);
      } else {
        setPackagingList([]);
      }
    } catch (error) {
      showAToast('error', "Грешка при зареждане на опаковки:");
      console.error("Error fetching packaging:", error);
    }
  };

  const getFilteredPackaging = () => {
    let filtered = packagingList;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.price?.toString().includes(searchText)
      );
    }

    return filtered;
  };

  const getRecord = async (recordId) => {
    const recordRef = ref(rtdb, `packaging/${recordId}`);
    const snapshot = await get(recordRef);

    if (snapshot.exists()) {
      handleViewPackaging(snapshot.val(), recordId);
      return snapshot.val();
    } else {
      message.error("Опаковката не е намерена");
    }
  };

  const updateRecord = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      showAToast('error', 'Моля, попълнете всички полета!');
      return;
    }

    const updatedData = {
      name: name.trim(),
      price: parseFloat(price),
    };

    try {
      const recordRef = ref(rtdb, `packaging/${packaging}`);
      await update(recordRef, updatedData);

      await fetchPackaging();
      closeDrawer();
      showAToast('success', "Опаковката е редактирана!");
    } catch (error) {
      showAToast('error', "Грешка при редакция:");
      console.error("Error updating packaging:", error);
    }
  };

  const handleViewPackaging = (values, id) => {
    const {
      name = '',
      price = ''
    } = values || {};

    setName(name);
    setPrice(price.toString());

    setPackaging(id);
  };

  const deleteRecord = async (recordId) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази опаковка?')) {
      return;
    }

    try {
      const recordRef = ref(rtdb, `packaging/${recordId}`);
      await remove(recordRef);
      showAToast('success', `Опаковката е изтрита успешно.`);
      fetchPackaging();
    } catch (error) {
      showAToast('error', `Грешка при изтриване.`);
      console.error("Error deleting packaging:", error);
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
            <span></span> <span className="description-title">Управление на опаковки</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4" style={{ gap: "15px" }}>
            <div className="d-flex flex-wrap gap-2">
              <Button type="primary" onClick={openDrawer}>
                Добави опаковка
              </Button>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Input
              placeholder="Търси по име или цена..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: "500px" }}
              prefix={<SearchOutlined />}
            />
          </div>

          <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
            <Table 
              bordered 
              dataSource={getFilteredPackaging()} 
              columns={columns}
              rowKey="id"
            />
          </div>

          <Drawer
            title={packaging ? `Редакция на ${name}` : "Добави опаковка"}
            placement="right"
            width={600}
            onClose={closeDrawer}
            open={drawerVisible}
          >
            <form onSubmit={packaging ? updateRecord : handleAddRecord} className="php-email-form">
              <div className="row gy-4">
                <div className="col-md-12">
                  <label htmlFor="name" style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                    Име на опаковката
                  </label>
                  <Input
                    placeholder="Например: Кутия, Пакет, и т.н."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginBottom: "16px" }}
                    required
                  />
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-12">
                  <label htmlFor="price" style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                    Цена (лв.)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ marginBottom: "16px" }}
                    required
                  />
                </div>
              </div>
              <div className="col-md-5 text-center">
                <Button type="primary" htmlType="submit" block>
                  {packaging ? 'Запази' : 'Добави'}
                </Button>
              </div>
            </form>
          </Drawer>
        </div>
      </div>
    </section>
  );
};

export default PackagingManagement;


