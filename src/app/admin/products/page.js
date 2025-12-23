'use client'

import { default as Message, default as showAToast } from '@/components/common/showAToast';
import CloudinaryUpload from '@/components/uploadForm';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Image, Input, message, Select, Space, Switch, Table, Tabs } from "antd";
import { get, push, ref, remove, set, update } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { Option } = Select;

const AddProduct = () => {
  const { isAdmin } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [subcategory, setSubcategory] = useState('');
  const [image, setImage] = useState('');
  const [requiresSideDish, setRequiresSideDish] = useState(false);
  const [isSideDish, setIsSideDish] = useState(false);
  const [forDelivery, setForDelivery] = useState(true);
  const [forRestaurant, setForRestaurant] = useState(true);
  const [product, setProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [parent, setParent] = useState('');
  const [catName, setCatName] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [packagingList, setPackagingList] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState([]);
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
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => <span>{slug || <span style={{ color: "#999" }}>Няма</span>}</span>,
    },
    {
      title: "Меню",
      dataIndex: "categories",
      key: "categories",
      render: (categoriesArray, record) => {
        // Support both old format (category) and new format (categories array)
        const categoryIds = categoriesArray && Array.isArray(categoriesArray) && categoriesArray.length > 0 
          ? categoriesArray 
          : (record.category ? [record.category] : []);
        
        const categoryNames = categoryIds
          .map(id => {
            const cat = categories.find((c) => c.id === id);
            return cat ? cat.name : null;
          })
          .filter(Boolean);
        
        return <span>{categoryNames.length > 0 ? categoryNames.join(', ') : ""}</span>;
      },
    },
    {
      title: "Подменю",
      dataIndex: "subcategory",
      key: "subcategory",
      render: (subId) => {
        const category = categories.find((cat) => cat.id === subId);
        return <span>{category ? category.name : ""}</span>;
      },
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text) => <span dangerouslySetInnerHTML={{ __html: text }} />,
    },
    {
      title: "Цена",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Съставки",
      dataIndex: "ingredients",
      key: "ingredients",
    },
    {
      title: "Изображение",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Image
          src={image || "/images/no-image.png"}
          alt="Product"
          width={100}
          style={{ borderRadius: "8px" }}
        />
      ),
    },
    {
      title: "Опаковки",
      dataIndex: "packagingIds",
      key: "packagingIds",
      render: (packagingIds) => {
        if (!packagingIds || (Array.isArray(packagingIds) && packagingIds.length === 0)) {
          return <span style={{ color: "#999" }}>Няма</span>;
        }
        const ids = Array.isArray(packagingIds) ? packagingIds : [packagingIds];
        const packagingNames = ids
          .map(id => {
            const pkg = packagingList.find(p => p.id === id);
            return pkg ? pkg.name : null;
          })
          .filter(Boolean);
        return <span>{packagingNames.join(', ') || 'Няма'}</span>;
      },
    },
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchPackaging();
  }, []);

  useEffect(() => {
    if (product) {
      openDrawer();
    }
  }, [product])

  const openDrawer = () => setDrawerVisible(true);
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const closeDrawer = () => {
    handleViewProduct(null, null);
    setRequiresSideDish(false);
    setIsSideDish(false);
    setForDelivery(true);
    setForRestaurant(true);
    setSelectedPackaging([]);
    setSelectedCategories([]);
    setSlug('');
    setDrawerVisible(false);
  }
  const openMenuDrawer = () => setMenuDrawerVisible(true);
  const closeMenuDrawer = () => setMenuDrawerVisible(false);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const productsRef = ref(rtdb, 'products');

    const newProductRef = push(productsRef);
    const productSlug = slug || generateSlug(name);
    set(newProductRef, {
      name: name,
      price: price,
      description: description,
      ingredients: ingredients,
      slug: productSlug,
      categories: selectedCategories && selectedCategories.length > 0 ? selectedCategories : [],
      subcategory: subcategory,
      image: image,
      requiresSideDish: requiresSideDish || false,
      isSideDish: isSideDish || false,
      forDelivery: forDelivery !== false,
      forRestaurant: forRestaurant !== false,
      packagingIds: selectedPackaging && selectedPackaging.length > 0 ? selectedPackaging : []
    })
      .then(() => {
        closeDrawer();
        showAToast('success', "Добавен успешно продукт!");
      })
      .catch((error) => {
        showAToast('success', "Грешка при добавяне на продукт!");
        console.error('Error adding product: ', error);
      });
  }

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const catRef = ref(rtdb, 'category');
    // Pushing a new record
    const newCatRef = push(catRef);
    set(newCatRef, {
      name: catName,
      parent: parent
    })
      .then(() => {
        fetchCategories();
        console.log('Category added successfully');
      })
      .catch((error) => {
        console.error('Error adding category: ', error);
      });
  }

  const fetchCategories = async () => {
    try {
      const categoriesRef = ref(rtdb, "category");
      const snapshot = await get(categoriesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const categoryArray = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));

        setCategories(categoryArray);
      } else {
        showAToast('error', "Не са намерени елементи в менюто.");
      }
    } catch (error) {
      showAToast('error', "Грешка при зареждане на менюто.");
      console.error("Error fetching categories:", error);
    }
  };

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
        showAToast('success', "Не са намерени продукти.")
      }
    } catch (error) {
      showAToast('error', "Грешка при зареждане на продукти:");
    }
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
      console.error("Error fetching packaging:", error);
    }
  };

  // Get filtered products based on active tab and search
  const getFilteredProducts = () => {
    let filtered = products;

    // Filter by category tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(product => {
        // Support both old format (category) and new format (categories array)
        const productCategories = product.categories && Array.isArray(product.categories) && product.categories.length > 0
          ? product.categories
          : (product.category ? [product.category] : []);
        return productCategories.includes(activeTab);
      });
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.ingredients?.toLowerCase().includes(searchLower) ||
        product.price?.toString().includes(searchText)
      );
    }

    return filtered;
  };

  // Get main categories (categories without parent)
  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent || cat.parent === '');
  };

  const getRecord = async (recordId) => {
    const recordRef = ref(rtdb, `products/${recordId}`);
    const snapshot = await get(recordRef);

    if (snapshot.exists()) {
      handleViewProduct(snapshot.val(), recordId);
      return snapshot.val();
    } else {
      throw message.error("Продуктът не е намерен");
    }
  };

  const updateRecord = async (e) => {
    e.preventDefault();

    const productSlug = slug || generateSlug(name);
    const updatedData = {
      name: name,
      price: price,
      description: description,
      ingredients: ingredients,
      slug: productSlug,
      categories: selectedCategories && selectedCategories.length > 0 ? selectedCategories : [],
      subcategory: subcategory,
      image: image,
      requiresSideDish: requiresSideDish || false,
      isSideDish: isSideDish || false,
      forDelivery: forDelivery !== false,
      forRestaurant: forRestaurant !== false,
      packagingIds: selectedPackaging && selectedPackaging.length > 0 ? selectedPackaging : []
    };

    try {
      const recordRef = ref(rtdb, `products/${product}`);
      await update(recordRef, updatedData);

      await fetchProducts();

      showAToast('success', "Продуктът е редактиран!");
    } catch (error) {
      showAToast('error', "Грешка при редакция:", error);
      message.error("Грешка при редакция. Моля опитайте отново.");
    }
  };

  const handleViewProduct = (values, id) => {
    const {
      name = null,
      price = null,
      description = null,
      ingredients = null,
      slug = null,
      category = null,
      categories = null,
      subcategory = null,
      image = null,
      requiresSideDish = false,
      isSideDish = false,
      forDelivery = true,
      forRestaurant = true,
      packagingIds = []
    } = values || {};

    setName(name);
    setPrice(price);
    setDescription(description);
    setIngredients(ingredients);
    setSlug(slug || '');
    // Support both old format (category) and new format (categories array)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      setSelectedCategories(categories);
    } else if (category) {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]);
    }
    setCategory(category); // Keep for backward compatibility
    setSubcategory(subcategory);
    setImage(image);
    setRequiresSideDish(requiresSideDish);
    setIsSideDish(isSideDish);
    setForDelivery(forDelivery !== false);
    setForRestaurant(forRestaurant !== false);
    setSelectedPackaging(Array.isArray(packagingIds) ? packagingIds : (packagingIds ? [packagingIds] : []));

    setProduct(id);
  };

  const deleteRecord = async (recordId) => {
    try {
      const recordRef = ref(rtdb, `products/${recordId}`);
      await remove(recordRef);
      showAToast('success', `Запис с ID ${recordId} е изтрит.`);
      <Message type="success" text="Успешно изтриване" />
      fetchProducts();
    } catch (error) {
      showAToast('error', `Грешка при изтриване.`);
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
            <span></span> <span className="description-title">Продукти</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4" style={{ gap: "15px" }}>
            <div className="d-flex flex-wrap gap-2">
              <Button type="primary" onClick={openDrawer}>
                Добави продукт
              </Button>
              <Button type="primary" onClick={openMenuDrawer}>
                Добави в менюто
              </Button>
            </div>

            <div>
              <Link href="/admin/menu" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                Отиди в Меню <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Input
              placeholder="Търси по име, описание, съставки или цена..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: "500px" }}
              prefix={<SearchOutlined />}
            />
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: `Всички (${products.length})`,
              },
              ...getMainCategories().map(category => ({
                key: category.id,
                label: `${category.name} (${products.filter(p => {
                  // Support both old format (category) and new format (categories array)
                  const productCategories = p.categories && Array.isArray(p.categories) && p.categories.length > 0
                    ? p.categories
                    : (p.category ? [p.category] : []);
                  return productCategories.includes(category.id);
                }).length})`,
              }))
            ]}
          />

          <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
            <Table 
              bordered 
              dataSource={getFilteredProducts()} 
              columns={columns}
              rowKey="id"
            />
          </div>

          <Drawer
            title={product ? `Редакция на ${name}` : "Добави продукт"}
            placement="right"
            width={1200}
            onClose={closeDrawer}
            open={drawerVisible}
          >
            <form onSubmit={product ? updateRecord : handleAddRecord} className="php-email-form">
              <div className="row gy-4">
                <div className="col-md-6">
                  <Select
                    mode="multiple"
                    placeholder="Избери в кои менюта"
                    value={selectedCategories}
                    onChange={(value) => setSelectedCategories(value)}
                    style={{ width: "100%", marginBottom: "16px" }}
                    allowClear
                  >
                    {categories
                      .filter((category) => category.parent === '' || category.parent === undefined)
                      .map((filteredCategory) => (
                        <Option key={filteredCategory.name + filteredCategory.id} value={filteredCategory.id}>
                          {filteredCategory.name}
                        </Option>
                      ))}
                  </Select>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "-10px", marginBottom: "16px" }}>
                    Един продукт може да се показва в повече от една категория
                  </p>
                </div>
                <div className="col-md-6">
                  <Select
                    placeholder="Избери подменю"
                    value={subcategory}
                    onChange={(value) => setSubcategory(value)}
                    style={{ width: "100%", marginBottom: "16px" }}
                  >
                    {categories.filter((subcat) => subcat.parent === category)
                      .map((filteredSubCategory) => (
                        <Option key={filteredSubCategory.name + filteredSubCategory.id} value={filteredSubCategory.id}>
                          {filteredSubCategory.name}
                        </Option>
                      ))}
                  </Select>
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-12">
                  <Input
                    placeholder="Име на продукта"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Auto-generate slug if empty
                      if (!slug) {
                        setSlug(generateSlug(e.target.value));
                      }
                    }}
                    style={{ marginBottom: "16px" }}
                  />
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-12">
                  <label htmlFor="slug-input" style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                    Slug (URL адрес) - за страница с детайли на продукта
                  </label>
                  <Input
                    id="slug-input"
                    placeholder="Автоматично генерира се от името"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{ marginBottom: "16px" }}
                  />
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "-10px", marginBottom: "16px" }}>
                    Ако има slug, ще се показва бутон "Виж повече" на продукта в менюто
                  </p>
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
                  <Input.TextArea
                    placeholder="Описание"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{ marginBottom: "16px" }}
                  />
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-12">
                  <Input.TextArea
                    placeholder="Съставки"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={4}
                    style={{ marginBottom: "16px" }}
                  />
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-6">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ marginBottom: "16px" }}
                  />
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-6">
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Switch
                      checked={requiresSideDish}
                      onChange={setRequiresSideDish}
                    />
                    <span>Изисква избор на гарнитура</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Switch
                      checked={isSideDish}
                      onChange={setIsSideDish}
                    />
                    <span>Това е гарнитура (няма да се показва в менюто)</span>
                  </div>
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-6">
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Switch
                      checked={forDelivery}
                      onChange={setForDelivery}
                    />
                    <span>Доставка (ще се показва в our-menu)</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Switch
                      checked={forRestaurant}
                      onChange={setForRestaurant}
                    />
                    <span>Ресторант (ще се показва в central-menu)</span>
                  </div>
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-12">
                  <label htmlFor="packaging" style={{ marginBottom: "8px", display: "block", fontWeight: 500 }}>
                    Видове опаковки
                  </label>
                  <Select
                    mode="multiple"
                    placeholder="Избери видове опаковки (например: кутия за ястие, кутия за сос)"
                    value={selectedPackaging}
                    onChange={setSelectedPackaging}
                    style={{ width: "100%", marginBottom: "16px" }}
                    allowClear
                  >
                    {packagingList.map((packaging) => (
                      <Option key={packaging.id} value={packaging.id}>
                        {packaging.name} ({parseFloat(packaging.price).toFixed(2)} лв.)
                      </Option>
                    ))}
                  </Select>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "-10px", marginBottom: "16px" }}>
                    Едно ястие може да има няколко вида опаковки (например: кутия за ястие и кутия за сос)
                  </p>
                </div>
              </div>
              <div className="col-md-5 text-center">
                <Button type="primary" htmlType="submit" block>
                  {product ? 'Запази' : 'Добави'}
                </Button>
              </div>
            </form>
          </Drawer>

          <Drawer
            title="Добави опция в менюто"
            placement="right"
            onClose={closeMenuDrawer}
            open={menuDrawerVisible}
            width={700}
          >
            <form onSubmit={handleAddCategory} className="php-email-form">
              <div className="row gy-4">
                <div className="col-md-6">
                  <Select
                    id="category-select"
                    value={parent}
                    onChange={setParent}
                    placeholder="-- Избери категория --"
                    style={{ width: "100%" }}
                  >
                    <Option value="">-- Избери категория --</Option>
                    {categories.map((category) => (
                      <Option key={category.name + category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="col-md-6">
                  <Input
                    placeholder="Име на категория"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                  />
                </div>
                <div className="col-md-5 text-center">
                  <Button type="primary" htmlType="submit" block>
                    Добави
                  </Button>
                </div>
              </div>

            </form>
          </Drawer>
        </div>
      </div>
    </section>
  );
};

export default AddProduct;
