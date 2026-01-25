'use client';

import { default as showAToast } from '@/components/common/showAToast';
import { useTranslations } from '@/context/TranslationsContext';
import { useUser } from '@/context/UserContext';
import initialTranslations from '@/locales/central-menu.json';
import { EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, Space, Table } from "antd";
import { get, ref, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { TextArea } = Input;

// Encode key for Firebase (replace forbidden characters)
const encodeKey = (key) => {
  return key
    .replace(/\./g, '__DOT__')
    .replace(/#/g, '__HASH__')
    .replace(/\$/g, '__DOLLAR__')
    .replace(/\//g, '__SLASH__')
    .replace(/\[/g, '__LBRACKET__')
    .replace(/\]/g, '__RBRACKET__');
};

// Decode key from Firebase
const decodeKey = (encodedKey) => {
  return encodedKey
    .replace(/__RBRACKET__/g, ']')
    .replace(/__LBRACKET__/g, '[')
    .replace(/__SLASH__/g, '/')
    .replace(/__DOLLAR__/g, '$')
    .replace(/__HASH__/g, '#')
    .replace(/__DOT__/g, '.');
};

const AdminTranslationsPage = () => {
  const { isAdmin } = useUser();
  const { translations, refetch } = useTranslations();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyText, setKeyText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [translationsList, setTranslationsList] = useState([]);

  const languages = ['en', 'de', 'ro'];

  useEffect(() => {
    if (translations && Object.keys(translations).length > 0) {
      buildTranslationsList();
    }
  }, [translations, selectedLanguage]);

  const buildTranslationsList = () => {
    const list = [];
    const langTranslations = translations[selectedLanguage] || {};
    
    // Get all unique keys from all languages (keys are already decoded from context)
    const allKeys = new Set();
    languages.forEach(lang => {
      const langData = translations[lang] || {};
      Object.keys(langData).forEach(key => {
        allKeys.add(key);
      });
    });

    allKeys.forEach(key => {
      list.push({
        key: key,
        [selectedLanguage]: langTranslations[key] || '',
      });
    });

    setTranslationsList(list);
  };

  const columns = [
    {
      title: "Ключ (Български текст)",
      dataIndex: "key",
      key: "key",
      width: '40%',
      render: (text) => (
        <div style={{ wordBreak: 'break-word' }}>{text}</div>
      ),
    },
    {
      title: `Превод (${selectedLanguage.toUpperCase()})`,
      dataIndex: selectedLanguage,
      key: selectedLanguage,
      width: '40%',
      render: (text) => (
        <div style={{ wordBreak: 'break-word' }}>{text || <span style={{ color: '#999' }}>Няма превод</span>}</div>
      ),
    },
    {
      title: "Действия",
      dataIndex: "action",
      key: "action",
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => editTranslation(record.key)}><EditOutlined /></a>
        </Space>
      ),
    },
  ];

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setSelectedKey(null);
    setKeyText('');
    setTranslationText('');
    setDrawerVisible(false);
  };

  const handleAddTranslation = () => {
    setSelectedKey(null);
    setKeyText('');
    setTranslationText('');
    openDrawer();
  };

  const editTranslation = (key) => {
    setSelectedKey(key);
    setKeyText(key);
    const langTranslations = translations[selectedLanguage] || {};
    // Key is already decoded in the list, so we can use it directly
    setTranslationText(langTranslations[key] || '');
    openDrawer();
  };

  const handleSubmit = async () => {
    if (!keyText.trim()) {
      showAToast('error', 'Моля, въведете ключ (български текст)!');
      return;
    }

    if (!translationText.trim()) {
      showAToast('error', 'Моля, въведете превод!');
      return;
    }

    try {
      const translationsRef = ref(rtdb, `translations/central-menu/${selectedLanguage}`);
      const snapshot = await get(translationsRef);
      const currentTranslations = snapshot.exists() ? snapshot.val() : {};

      const encodedKey = encodeKey(keyText);
      const updatedTranslations = {
        ...currentTranslations,
        [encodedKey]: translationText.trim(),
      };

      await set(translationsRef, updatedTranslations);
      showAToast("success", 'Преводът е запазен успешно');
      refetch();
      closeDrawer();
    } catch (error) {
      console.error('Error saving translation:', error);
      showAToast("error", 'Грешка при запазване на превода');
    }
  };

  const initializeTranslations = async () => {
    if (!confirm('Сигурни ли сте, че искате да инициализирате преводите? Това ще презапише всички съществуващи преводи!')) {
      return;
    }

    try {
      // Encode all keys in initial translations
      const encodedTranslations = {};
      Object.keys(initialTranslations).forEach(lang => {
        encodedTranslations[lang] = {};
        Object.keys(initialTranslations[lang]).forEach(key => {
          const encodedKey = encodeKey(key);
          encodedTranslations[lang][encodedKey] = initialTranslations[lang][key];
        });
      });

      const translationsRef = ref(rtdb, 'translations/central-menu');
      await set(translationsRef, encodedTranslations);
      showAToast("success", 'Преводите са инициализирани успешно');
      refetch();
    } catch (error) {
      console.error('Error initializing translations:', error);
      showAToast("error", 'Грешка при инициализиране на преводите');
    }
  };

  if (!isAdmin) {
    return (
      <section id="contact" className="contact section">
        <div className="container">
          <div className="container section-title">
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
      <div className="container">
        <div className="container section-title">
          <h2>Управление на преводи</h2>
          <p>
            <span></span> <span className="description-title">Central Menu</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
        </div>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Език:</span>
          {languages.map(lang => (
            <Button
              key={lang}
              type={selectedLanguage === lang ? 'primary' : 'default'}
              onClick={() => setSelectedLanguage(lang)}
            >
              {lang.toUpperCase()}
            </Button>
          ))}
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTranslation}>
            Добави превод
          </Button>
          <Button icon={<UploadOutlined />} onClick={initializeTranslations}>
            Инициализирай преводите (от JSON)
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={translationsList}
          rowKey="key"
          pagination={{ pageSize: 20 }}
        />

        <Drawer
          title={selectedKey ? "Редактирай превод" : "Добави превод"}
          placement="right"
          onClose={closeDrawer}
          open={drawerVisible}
          width={600}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Ключ (Български текст):
              </label>
              <Input
                value={keyText}
                onChange={(e) => setKeyText(e.target.value)}
                placeholder="Въведете българския текст"
                disabled={!!selectedKey}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Превод ({selectedLanguage.toUpperCase()}):
              </label>
              <TextArea
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
                placeholder="Въведете превода"
                rows={4}
              />
            </div>

            <Button type="primary" onClick={handleSubmit} block>
              {selectedKey ? "Запази промените" : "Добави превод"}
            </Button>
          </div>
        </Drawer>
      </div>
    </section>
  );
};

export default AdminTranslationsPage;

