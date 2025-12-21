'use client'

import EditableTable from '@/components/EditableTable';
import { useUser } from '@/context/UserContext';
import { Button, Drawer, Image, Input, Select, Switch, message } from "antd";
import { get, push, ref, remove, set, update } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { Option } = Select;

const AddCategory = () => {
  const { isAdmin } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [image, setImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [parent, setParent] = useState('');
  const [catName, setCatName] = useState('');
  const [forDelivery, setForDelivery] = useState(true);
  const [forRestaurant, setForRestaurant] = useState(true);
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState('active');
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const openMenuDrawer = () => {
    setForDelivery(true);
    setForRestaurant(true);
    setOrder(0);
    setStatus('active');
    setMenuDrawerVisible(true);
  };
  const closeMenuDrawer = () => {
    setCatName('');
    setParent('');
    setForDelivery(true);
    setForRestaurant(true);
    setOrder(0);
    setStatus('active');
    setMenuDrawerVisible(false);
  };

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

  const deleteRecord = async (recordId) => {
    try {
      const recordRef = ref(rtdb, `category/${recordId}`);
      await remove(recordRef);
      console.log(`Record with ID ${recordId} has been deleted.`);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const catRef = ref(rtdb, 'category');

    const newCatRef = push(catRef);
    set(newCatRef, {
      name: catName,
      parent: parent,
      forDelivery: forDelivery !== false,
      forRestaurant: forRestaurant !== false,
      order: order || 0,
      status: status || 'active'
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
          }))
          .sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 0;
            const orderB = b.order !== undefined ? b.order : 0;
            return orderA - orderB;
          });

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

  const handleSave = async (updatedRecord) => {
    const orderValue = updatedRecord.order !== undefined && updatedRecord.order !== null 
      ? (typeof updatedRecord.order === 'string' ? parseInt(updatedRecord.order) || 0 : updatedRecord.order)
      : 0;
    
    const updatedData = {
      name: updatedRecord.name,
      parent: updatedRecord.parent,
      forDelivery: updatedRecord.forDelivery !== false,
      forRestaurant: updatedRecord.forRestaurant !== false,
      order: orderValue,
      status: updatedRecord.status || 'active'
    };
    try {
      const recordRef = ref(rtdb, `category/${updatedRecord.id}`);
      await update(recordRef, updatedData);

      await fetchCategories();

      message.success("Успешна редакция!");
    } catch (error) {
      console.error("Грешка при редакция:", error);
      message.error("Грешка при редакция. Моля опитайте отново.");
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
            <span></span> <span className="description-title">Меню</span>
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
              <Link href="/admin/products" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
                Отиди в Продукти <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <EditableTable data={categories} categories={categories} onSave={handleSave} onDelete={deleteRecord} />;
          <Drawer
            title={"Добави продукт"}
            placement="right"
            width={1200}
            onClose={closeDrawer}
            open={drawerVisible}
          >
            <form onSubmit={handleAddRecord} className="php-email-form">
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
                        <Option key={filteredCategory.id} value={filteredCategory.id}>
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
                        <Option key={filteredSubCategory.id} value={filteredSubCategory.id}>
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
                    <Button type="default" onClick={handleUpload} style={{ marginTop: "10px" }}>
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
                  {'Добави'}
                </Button>
              </div>
            </form>
          </Drawer>

          <Drawer
            title={"Добави опция в менюто"}
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
                      <Option key={category.id} value={category.id}>
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
                <div className="col-md-6">
                  <Input
                    type="number"
                    placeholder="Номер по ред"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-md-12">
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Switch
                      checked={forDelivery}
                      onChange={setForDelivery}
                    />
                    <span>Доставка (ще се показва в our-menu)</span>
                  </div>
                </div>
                <div className="col-md-12">
                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Switch
                      checked={forRestaurant}
                      onChange={setForRestaurant}
                    />
                    <span>Ресторант (ще се показва в central-menu)</span>
                  </div>
                </div>
                <div className="col-md-12">
                  <label style={{ display: "block", marginBottom: "8px" }}>
                    <strong>Статус:</strong>
                  </label>
                  <Select
                    value={status}
                    onChange={setStatus}
                    style={{ width: "100%" }}
                  >
                    <Option value="active">Активна</Option>
                    <Option value="inactive">Неактивна</Option>
                    <Option value="archived">Архивирана</Option>
                  </Select>
                </div>
                <div className="col-md-5 text-center">
                  <Button type="primary" htmlType="submit" block>
                    {"Добави"}
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

export default AddCategory;
