'use client'

import Message from '@/components/common/showAToast';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Drawer, Image, Input, Select, Space, Table, message } from "antd";
import axios from 'axios';
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
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [image, setImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [parent, setParent] = useState('');
  const [catName, setCatName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
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
      title: "Меню",
      dataIndex: "category",
      key: "category",
      render: (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return <span>{category ? category.name : ""}</span>;
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
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (product) {
      openDrawer();
    }
  }, [product])

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    handleViewProduct(null, null);
    setDrawerVisible(false);
  }
  const openMenuDrawer = () => setMenuDrawerVisible(true);
  const closeMenuDrawer = () => setMenuDrawerVisible(false);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const productsRef = ref(rtdb, 'products');

    const newProductRef = push(productsRef);
    set(newProductRef, {
      name: name,
      price: price,
      description: description,
      ingredients: ingredients,
      category: category,
      subcategory: subcategory,
      image: image
    })
      .then(() => {
        message.success('Добавен успешно продукт');
      })
      .catch((error) => {
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
        console.log(data)
        const categoryArray = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));

        setCategories(categoryArray);
      } else {
        message.error("Не са намерени елементи в менюто.");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      console.log(file)
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    // e.prevent.default();
    if (!selectedImage) {
      setUploadStatus("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("Image uploaded successfully!");
      } else {
        setUploadStatus("Failed to upload the image.");
      }
    } catch (error) {
      console.error("Error uploading the image:", error);
      setUploadStatus("Error uploading the image.");
    }
  };

  const uploadImageToImageKit = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('publicKey', 'public_9KjbiohjLr2DXh3nSqv9o/WrqvE=');

    try {
      const response = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
      console.log('Uploaded image URL:', response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
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
        message.error("Не са намерени продукти.");
      }
    } catch (error) {
      console.error("Грешка при зареждане на продукти:", error);
    }
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

    const updatedData = {
      name: name,
      price: price,
      description: description,
      ingredients: ingredients,
      category: category,
      subcategory: subcategory,
      image: image,
    };

    try {
      const recordRef = ref(rtdb, `products/${product}`);
      await update(recordRef, updatedData);

      await fetchProducts();

      message.success("Продуктът е редактиран!");
    } catch (error) {
      console.error("Грешка при редакция:", error);
      message.error("Грешка при редакция. Моля опитайте отново.");
    }
  };

  const handleViewProduct = (values, id) => {
    const {
      name = null,
      price = null,
      description = null,
      ingredients = null,
      category = null,
      subcategory = null,
      image = null
    } = values || {};

    setName(name);
    setPrice(price);
    setDescription(description);
    setIngredients(ingredients);
    setCategory(category);
    setSubcategory(subcategory);
    setImage(image);

    setProduct(id);
  };

  const deleteRecord = async (recordId) => {
    try {
      const recordRef = ref(rtdb, `products/${recordId}`);
      await remove(recordRef);
      console.log(`Record with ID ${recordId} has been deleted.`);
      <Message type="success" text="Успешно изтриване" />
      fetchProducts();
    } catch (error) {
      console.error("Error deleting record:", error);
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
          <div className="d-flex justify-content-center align-items-center mb-4" style={{ position: "relative" }}>
            <div>
              <Button type="primary" onClick={openDrawer} style={{ marginRight: "10px" }}>
                Добави продукт
              </Button>
              <Button type="primary" onClick={openMenuDrawer}>
                Добави в менюто
              </Button>
            </div>

            <div style={{ position: "absolute", right: "0" }}>
              <Link href="/admin/menu">
                Отиди в Меню <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
          <Table style={{ marginTop: "20px" }} bordered dataSource={products} columns={columns} />

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
                    placeholder="Избери в кое меню"
                    value={category}
                    onChange={(value) => setCategory(value)}
                    style={{ width: "100%", marginBottom: "16px" }}
                  >
                    {categories
                      .filter((category) => category.parent === '' || category.parent === undefined)
                      .map((filteredCategory) => (
                        <Option key={filteredCategory.name + filteredCategory.id} value={filteredCategory.id}>
                          {filteredCategory.name}
                        </Option>
                      ))}
                  </Select>
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
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginBottom: "16px" }}
                  />
                </div>
              </div>
              <div className="row gy-4">
                <div className="col-md-6">
                  <div style={{ marginBottom: "16px" }}>
                    <h2>Upload Image</h2>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {preview && (
                      <div style={{ marginTop: "10px" }}>
                        <h4>Image Preview:</h4>
                        <Image src={preview} alt="Preview" width={100} />
                      </div>
                    )}
                    <Button type="default" onClick={uploadImageToImageKit} style={{ marginTop: "10px" }}>
                      Upload
                    </Button>
                    {uploadStatus && <p>{uploadStatus}</p>}
                  </div>
                </div>
                <div className="col-md-6">
                  <Input
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    style={{ marginBottom: "16px" }}
                  />
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
