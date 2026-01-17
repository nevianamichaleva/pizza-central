'use client';

import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { get, push, ref, set } from 'firebase/database';
import moment from 'moment';
import { useState } from 'react';
import { rtdb } from '../../lib/firebase';
import showAToast from "./common/showAToast";

const { TextArea } = Input;

const CateringForm = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const eventTypes = [
    { value: 'firmeno', label: 'Фирмено събитие' },
    { value: 'rozhden-den', label: 'Рожден ден' },
    { value: 'krushtene', label: 'Кръщене' },
    { value: 'chastno-parti', label: 'Частно парти' },
    { value: 'sreshta', label: 'Среща/Обучение' },
    { value: 'prezentatsiya', label: 'Презентация' },
    { value: 'kokteyl', label: 'Коктейл' },
    { value: 'drugo', label: 'Друго' },
  ];

  const handleSubmit = async (values) => {
    // Prevent double submission
    if (submitting) {
      return;
    }

    setSubmitting(true);
    const cateringData = {
      name: values.name || '',
      phone: values.phone || '',
      email: values.email || '',
      date: values.date ? values.date.format('DD-MM-YYYY') : '',
      people: values.people || 0,
      eventType: values.eventType || '',
      message: values.message || '',
      createdAt: new Date().toISOString(),
    };

    try {
      const cateringRef = ref(rtdb, 'catering');
      const newCateringRef = push(cateringRef);

      await set(newCateringRef, cateringData);

      // Send email notifications
      try {
        // Get SMTP config from Firebase settings
        const emailRef = ref(rtdb, 'settings/email');
        const emailSnapshot = await get(emailRef);
        let adminEmail = null;
        let smtpConfig = null;
        
        if (emailSnapshot.exists()) {
          const emailData = emailSnapshot.val();
          adminEmail = emailData.adminEmail || emailData.email;
          smtpConfig = {
            smtpHost: emailData.smtpHost,
            smtpPort: emailData.smtpPort,
            smtpUser: emailData.smtpUser,
            smtpPassword: emailData.smtpPassword,
            smtpSecure: emailData.smtpSecure,
            fromEmail: emailData.fromEmail
          };
        }

        // Send email notification to admin
        if (adminEmail) {
          try {
            const response = await fetch('/api/send-catering-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cateringData: cateringData,
                adminEmail: adminEmail,
                smtpConfig: smtpConfig,
              }),
            });

            const result = await response.json();
            if (!result.success && !result.logged) {
              console.error('Failed to send email notification:', result);
            }
          } catch (adminEmailError) {
            console.error('Error sending admin email notification:', adminEmailError);
            // Don't block the catering process if admin email fails
          }
        } else {
          console.log('No admin email configured, skipping admin email notification');
        }
      } catch (error) {
        console.error('Error sending email notifications:', error);
        // Don't block the catering process if email fails
      }

      setTimeout(() => {
        showAToast('success', 'Вашата заявка е изпратена успешно! Ще се свържем с вас скоро, за да уговорим час за консултация и уточняване на детайли и цени.');
        form.resetFields();
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting catering request:', error);
      showAToast('error', 'Неуспешна заявка, моля опитайте отново или се обадете на телефон 0895 516 401');
      setSubmitting(false);
    }
  };

  const disableOldDates = (current) => {
    return current && current.isBefore(moment().startOf('day'), 'day');
  };

  return (
    <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="catering-form"
      >
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <Form.Item
              name="name"
              label="Вашето име"
              rules={[{ required: true, message: "Моля въведете вашето име" }]}
            >
              <Input placeholder="Имена" className="form-control" />
            </Form.Item>
          </div>

          <div className="col-lg-4 col-md-6">
            <Form.Item
              name="phone"
              label="Телефон"
              rules={[{ required: true, message: "Въведете телефон за връзка" }]}
            >
              <Input placeholder="Телефон" className="form-control" />
            </Form.Item>
          </div>

          <div className="col-lg-4 col-md-6">
            <Form.Item
              name="email"
              label="Email (по избор)"
              rules={[
                { type: "email", message: "Моля, въведете валиден email" },
              ]}
            >
              <Input placeholder="Вашия email" className="form-control" />
            </Form.Item>
          </div>

          <div className="col-lg-4 col-md-6">
            <Form.Item
              name="date"
              label="Дата на събитието"
              rules={[{ required: true, message: "Изберете дата на събитието" }]}
            >
              <DatePicker
                disabledDate={disableOldDates}
                style={{ width: "100%", height: "38px" }}
                placeholder="Изберете дата"
                format="DD.MM.YYYY"
              />
            </Form.Item>
          </div>

          <div className="col-lg-4 col-md-6">
            <Form.Item
              name="people"
              label="Брой гости"
              rules={[{ required: true, message: "Моля, въведете брой на гостите" }]}
            >
              <InputNumber 
                style={{ 
                  width: "100%", 
                  height: "38px",
                  lineHeight: "38px"
                }} 
                placeholder="Брой гости" 
                min={1} 
                className="form-control" 
              />
            </Form.Item>
          </div>

          <div className="col-lg-4 col-md-6">
            <Form.Item
              name="eventType"
              label="Вид събитие"
              rules={[{ required: true, message: "Изберете вид събитие" }]}
            >
              <Select
                style={{ width: "100%", height: "39px" }}
                placeholder="Изберете вид събитие"
                className="form-control"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={eventTypes}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item 
          name="message" 
          label="Допълнителни уточнения"
        >
          <TextArea 
            rows={5} 
            placeholder="Можете да споделите допълнителни детайли за събитието, предпочитания за меню, специални изисквания и т.н." 
            className="form-control" 
          />
        </Form.Item>

        <div style={{ marginBottom: '15px', fontSize: '14px', textAlign: 'center', lineHeight: '1.6' }}>
          С потвърждаването на заявката Вие се съгласявате с нашите{' '}
          <a href="/obshti-usloviya" target="_blank" rel="noopener noreferrer" style={{ color: '#ce1212', textDecoration: 'underline' }}>
            Общи условия
          </a>
          {' '}и{' '}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#ce1212', textDecoration: 'underline' }}>
            Политика за личните данни
          </a>
        </div>

        <div className="text-center mt-3">
          <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting} style={{
            backgroundColor: '#ce1212',
            borderColor: '#ce1212',
            height: '45px',
            fontSize: '16px',
            fontWeight: '600',
            padding: '0 40px'
          }}>
            Изпрати заявка
          </Button>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '14px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          След изпращане на заявката, ще се свържем с вас в най-кратък срок, за да уговорим час за консултация и уточняване на детайли и цени.
        </p>
      </Form>
  );
};

export default CateringForm;

