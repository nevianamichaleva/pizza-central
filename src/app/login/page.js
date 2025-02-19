"use client"

import { Button, Form, Input, Spin } from "antd";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginUser } from '../../../lib/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [status, setStatus] = useState('');

  const handleSubmit = async (values) => {
    setError('');
    try {
      await loginUser(values.email, values.password);
      setStatus('success');
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="container section-title" data-aos="fade-up">
          <h2>Моля, въведете данни за вход</h2>
          <p>
            <span></span> <span className="description-title">Здравей!</span>
          </p>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Form
          name="loginForm"
          onFinish={handleSubmit}
          layout="vertical"
          className="php-email-form"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          <div className="row gy-4">
            <div className="col-md-6">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Моля въведете вашия имейл" },
                  { type: "email", message: "Моля въведете валиден имейл" },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                name="password"
                label="Парола"
                rules={[
                  { required: true, message: "Моля въведете вашата парола" },
                  { min: 6, message: "Паролата трябва да бъде поне 6 символа" },
                ]}
              >
                <Input.Password placeholder="Парола" style={{ height: "42px" }} />
              </Form.Item>
            </div>

            <div className="col-md-12 text-center">
              {status === "loading" && <Spin tip="Зареждане ..." />}
              {error && <div className="error-message">Има грешка, опитайте отново</div>}
              {status === "success" && <div className="sent-message">Успешен вход</div>}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Вход
                </Button>
              </Form.Item>
            </div>
          </div>
        </Form>
        <div className="container section-title" style={{ marginTop: "15px" }} data-aos="fade-up">
          <h2>Още ли нямате акаунт?</h2> <a href='/signup'>Регистрирайте се</a>
        </div>
      </div>
    </section>
  );
};

export default Login;
