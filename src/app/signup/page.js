"use client"

import { Button, Checkbox, Form, Input } from "antd";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerUserWithAdditionalData } from '../../../lib/auth';

const Register = () => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (values) => {
    setError('');
    let additionalData = {phone: values.phone, address: values.address};
    try {
      await registerUserWithAdditionalData(values.email, values.password, additionalData);
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <div className="container section-title">
          <div className="container section-title">
            <h2>Моля, въведете вашите данни</h2>
            <p>
              <span></span> <span className="description-title">Регистрация</span>
            </p>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="php-email-form"
           
           
          >
            <div className="row gy-4">
              <div className="col-md-6">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Моля, въведете вашия Email" },
                    { type: "email", message: "Моля, въведете валиден Email адрес" },
                  ]}
                >
                  <Input placeholder="Email" className="form-control"/>
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  name="password"
                  label="Парола"
                  rules={[
                    { required: true, message: "Моля, въведете вашата Парола" },
                    { min: 6, message: "Паролата трябва да бъде поне 6 символа" },
                  ]}
                >
                  <Input.Password placeholder="Парола" style={{height: "42px"}} />
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  name="phone"
                  label="Телефон"
                  rules={[
                    { required: true, message: "Моля, въведете вашия Телефон" },
                    { pattern: /^[0-9]+$/, message: "Телефонът трябва да съдържа само цифри" },
                  ]}
                >
                  <Input placeholder="Телефон" className="form-control"/>
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  name="address"
                  label="Адрес"
                  rules={[{ required: true, message: "Моля, въведете вашия Адрес" }]}
                >
                  <Input placeholder="Адрес" className="form-control"/>
                </Form.Item>
              </div>
              <div className="col-md-12">
                <Form.Item
                  name="privacyPolicy"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Моля, потвърдете, че сте запознати с Политиката за личните данни')),
                    },
                  ]}
                >
                  <Checkbox>
                    Запознат/а съм с{' '}
                    <Link href="/privacy-policy" target="_blank" style={{ color: '#ce1212', textDecoration: 'underline' }}>
                      Политиката за личните данни
                    </Link>
                  </Checkbox>
                </Form.Item>
              </div>
              <div className="col-md-12 text-center">
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Регистрация
                  </Button>
                </Form.Item>
              </div>
            </div>
          </Form>
          <div className="container section-title" style={{ marginTop: "15px" }}>
            <h2>Вече имате акаунт?</h2> <a href='/login'>Вход</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
