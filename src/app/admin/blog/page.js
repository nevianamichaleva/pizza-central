'use client';

import { default as showAToast } from '@/components/common/showAToast';
import CloudinaryUpload from '@/components/uploadForm';
import { useUser } from '@/context/UserContext';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Drawer, Form, Image, Input, Select, Space, Table, Tag } from "antd";
import { get, push, ref, remove, set } from 'firebase/database';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../../lib/firebase';

const { Option } = Select;
const { TextArea } = Input;

const AdminBlogPage = () => {
  const { isAdmin } = useUser();
  const [posts, setPosts] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [form] = Form.useForm();
  const [image, setImage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const columns = [
    {
      title: "Действия",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => editPost(record)}><EditOutlined /></a>
          <a><DeleteOutlined onClick={() => deletePost(record.id)} /></a>
        </Space>
      ),
    },
    {
      title: "Заглавие",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => slug || '-',
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          published: 'green',
          draft: 'orange',
          archived: 'red',
        };
        const textMap = {
          published: 'Публикувана',
          draft: 'Чернова',
          archived: 'Архивирана',
        };
        return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: "Дата на публикуване",
      dataIndex: "published_at",
      key: "published_at",
      render: (date) => date ? moment(date).format('DD.MM.YYYY HH:mm') : '-',
      sorter: (a, b) => {
        if (!a.published_at) return 1;
        if (!b.published_at) return -1;
        return moment(a.published_at).unix() - moment(b.published_at).unix();
      },
    },
    {
      title: "Изображение",
      dataIndex: "image",
      key: "image",
      render: (imageLink) => (
        <Image
          src={imageLink || "/images/no-image.png"}
          alt="Post image"
          width={100}
          style={{ borderRadius: "8px" }}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsRef = ref(rtdb, "blog_posts");
      const snapshot = await get(postsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const array = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .sort((a, b) => {
            // Sort by published_at or creation order (newest first)
            if (a.published_at && b.published_at) {
              return moment(b.published_at).unix() - moment(a.published_at).unix();
            }
            return b.id.localeCompare(a.id);
          });
        setPosts(array);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Firebase error:", error);
      showAToast('error', "Грешка при зареждане на статии");
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedPost(null);
    setImage('');
    form.resetFields();
  };

  const addNewPost = () => {
    form.setFieldsValue({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image: null,
      image_caption: '',
      status: 'draft',
      published_at: null,
      seo_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
      id: null
    });
    setImage('');
    setSelectedPost(null);
    openDrawer();
  };

  const editPost = (post) => {
    form.setFieldsValue({
      title: post.title,
      slug: post.slug || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      image: post.image,
      image_caption: post.image_caption || '',
      status: post.status || 'draft',
      published_at: post.published_at ? moment(post.published_at) : null,
      seo_title: post.seo_title || '',
      meta_description: post.meta_description || '',
      meta_keywords: post.meta_keywords || '',
      canonical_url: post.canonical_url || '',
      id: post.id
    });
    setImage(post.image || '');
    setSelectedPost(post);
    openDrawer();
  };

  const handleSubmit = async (values) => {
    try {
      const slug = values.slug || generateSlug(values.title);

      const postData = {
        title: values.title,
        slug: slug,
        content: values.content || '',
        excerpt: values.excerpt || '',
        image: image || '',
        image_caption: values.image_caption || '',
        status: values.status || 'draft',
        published_at: values.published_at ? values.published_at.toISOString() : null,
        seo_title: values.seo_title || '',
        meta_description: values.meta_description || '',
        meta_keywords: values.meta_keywords || '',
        canonical_url: values.canonical_url || '',
        created_at: selectedPost?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (selectedPost && selectedPost.id) {
        // Update existing post
        const postRef = ref(rtdb, `blog_posts/${selectedPost.id}`);
        await set(postRef, postData);
        showAToast("success", 'Статията е обновена успешно');
      } else {
        // Add new post
        const postsRef = ref(rtdb, 'blog_posts');
        const newPostRef = push(postsRef);
        await set(newPostRef, postData);
        showAToast("success", 'Статията е добавена успешно');
      }

      fetchPosts();
      closeDrawer();
    } catch (error) {
      console.error('Error saving post:', error);
      showAToast("error", 'Грешка при запазване на статията');
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази статия?')) {
      return;
    }

    try {
      const postRef = ref(rtdb, `blog_posts/${postId}`);
      await remove(postRef);
      showAToast("success", 'Статията е изтрита успешно');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showAToast("error", 'Грешка при изтриване на статията');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchText || 
      post.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      post.slug?.toLowerCase().includes(searchText.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            <span></span> <span className="description-title">Управление на блог статии</span>
          </p>
          <div style={{ marginBottom: "15px" }}>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1890ff", fontWeight: 500 }}>
              <i className="bi bi-arrow-left"></i> Върни се в Административния панел
            </Link>
          </div>
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4" style={{ gap: "15px" }}>
            <Button type="primary" onClick={addNewPost}>
              Добави нова статия
            </Button>
          </div>

          <div style={{ marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <Input
              placeholder="Търси по заглавие, slug или описание..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: "400px", flex: 1 }}
              prefix={<SearchOutlined />}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "200px" }}
            >
              <Option value="all">Всички статуси</Option>
              <Option value="published">Публикувани</Option>
              <Option value="draft">Чернови</Option>
              <Option value="archived">Архивирани</Option>
            </Select>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', marginTop: "20px" }}>
            <Table
              bordered
              dataSource={filteredPosts}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
          
          <Drawer
            title={selectedPost ? "Редактиране на статия" : "Добавяне на нова статия"}
            open={drawerVisible}
            onClose={closeDrawer}
            width={800}
            style={{ zIndex: 1000 }}
          >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="title"
                label="Заглавие"
                rules={[{ required: true, message: "Моля, въведете заглавие" }]}
              >
                <Input 
                  placeholder="Заглавие на статията" 
                  onChange={(e) => {
                    const title = e.target.value;
                    const currentSlug = form.getFieldValue('slug');
                    // Auto-generate slug only if slug field is empty
                    if (!currentSlug) {
                      form.setFieldsValue({ slug: generateSlug(title) });
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug (URL)"
                rules={[{ required: true, message: "Моля, въведете slug" }]}
                extra="URL-френдли идентификатор за статията (автоматично се генерира от заглавието)"
              >
                <Input placeholder="moia-statia" />
              </Form.Item>

              <Form.Item
                name="excerpt"
                label="Кратко описание / Preview"
                rules={[{ required: true, message: "Моля, въведете кратко описание" }]}
                extra="Кратко описание, което ще се показва в списъка със статии"
              >
                <TextArea rows={3} placeholder="Кратко описание на статията" />
              </Form.Item>

              <Form.Item
                name="content"
                label="Основно съдържание"
                rules={[{ required: true, message: "Моля, въведете съдържание" }]}
                extra="Можете да използвате HTML или Markdown"
              >
                <TextArea rows={12} placeholder="Основното съдържание на статията..." />
              </Form.Item>

              <Form.Item
                name="image"
                label="Основна снимка"
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
                name="image_caption"
                label="Текст под снимката"
                extra="Заглавие, източник или обяснение за снимката (незадължително)"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Например: Източник: Unsplash или Заглавие на снимката" 
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Статус"
                rules={[{ required: true, message: "Моля, изберете статус" }]}
              >
                <Select>
                  <Option value="draft">Чернова</Option>
                  <Option value="published">Публикувана</Option>
                  <Option value="archived">Архивирана</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="published_at"
                label="Дата на публикуване"
                extra="Оставете празно, за да се използва текущата дата при публикуване"
              >
                <DatePicker 
                  showTime 
                  format="DD.MM.YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginTop: '20px' }}>
                <h4>SEO Настройки</h4>
                
                <Form.Item
                  name="seo_title"
                  label="SEO Заглавие"
                  extra="Ако е празно, ще се използва основното заглавие"
                >
                  <Input placeholder="SEO оптимизирано заглавие" />
                </Form.Item>

                <Form.Item
                  name="meta_description"
                  label="Meta Описание"
                  extra="Кратко описание за търсачките (150-160 символа)"
                >
                  <TextArea rows={3} placeholder="Meta описание за SEO" maxLength={160} showCount />
                </Form.Item>

                <Form.Item
                  name="meta_keywords"
                  label="Meta Ключови думи"
                  extra="Ключови думи, разделени със запетая"
                >
                  <Input placeholder="ключова дума 1, ключова дума 2, ключова дума 3" />
                </Form.Item>

                <Form.Item
                  name="canonical_url"
                  label="Canonical URL"
                  extra="Каноничен URL за статията (ако е празно, ще се използва автоматично генерираният)"
                >
                  <Input placeholder="https://example.com/blog/moia-statia" />
                </Form.Item>
              </div>

              <Form.Item style={{ marginTop: '20px' }}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {selectedPost ? "Обнови" : "Добави"}
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

export default AdminBlogPage;

