'use client';

import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { get, push, ref, set } from 'firebase/database';
import moment from 'moment';
import { useState } from 'react';
import { rtdb } from '../../lib/firebase';
import FormAntiBotFields from './FormAntiBotFields';
import showAToast from "./common/showAToast";
import { useFormAntiBot } from '@/hooks/useFormAntiBot';

const BookTableSection = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const {
    setTurnstileToken,
    honeypotRef,
    turnstileRef,
    validateBeforeSubmit,
    resetAfterSubmit,
    submitBlocked,
    turnstileConfigured,
  } = useFormAntiBot();

  const handleSubmit = async (values) => {
    // Prevent double submission
    if (submitting) {
      return;
    }

    const gate = validateBeforeSubmit();
    if (!gate.ok) {
      if (gate.honeypot) {
        showAToast('success', 'Вашата резервация е успешна. Очаквайте нашето обаждане за да обсъдим подробностите!');
        form.resetFields();
      }
      return;
    }

    setSubmitting(true);
    const bookingData = {
      name: values.name || '',
      email: values.email || '',
      message: values.message || '',
      phone: values.phone || '',
      people: values.people || 0,
      date: values.date ? values.date.format('DD-MM-YYYY') : '',
      time: values.time || '', // time is now a string like "HH:mm"
    };

    try {
      const bookingRef = ref(rtdb, 'booking');
      const newBookingRef = push(bookingRef);

      await set(newBookingRef, bookingData);

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
            const response = await fetch('/api/send-booking-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingData: bookingData,
                adminEmail: adminEmail,
                smtpConfig: smtpConfig,
                antiBot: gate.antiBot,
                turnstileToken: gate.turnstileToken,
              }),
            });

            const result = await response.json();
            if (!result.success && !result.logged) {
              console.error('Failed to send email notification:', result);
            }
          } catch (adminEmailError) {
            console.error('Error sending admin email notification:', adminEmailError);
            // Don't block the booking process if admin email fails
          }
        } else {
          console.log('No admin email configured, skipping admin email notification');
        }

        // Send confirmation email to customer (always try if email exists)
        if (bookingData.email) {
          try {
            const confirmationResponse = await fetch('/api/send-booking-confirmation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingData: bookingData,
                smtpConfig: smtpConfig,
                antiBot: gate.antiBot,
                turnstileToken: gate.turnstileToken,
              }),
            });

            const confirmationResult = await confirmationResponse.json();
            if (!confirmationResult.success && !confirmationResult.logged) {
              console.error('Failed to send confirmation email:', confirmationResult);
            }
          } catch (confirmationError) {
            console.error('Error sending confirmation email:', confirmationError);
            // Don't block the booking process if confirmation email fails
          }
        }
      } catch (error) {
        console.error('Error sending email notifications:', error);
        // Don't block the booking process if email fails
      }

      setTimeout(() => {
        showAToast('success', 'Вашата резервация е успешна. Очаквайте нашето обаждане за да обсъдим подробностите!');
        form.resetFields();
        resetAfterSubmit();
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      showAToast('error', 'Неуспешна резервация, моля опитайте отново или се обадете на телефон +359 895 516 401');
      setSubmitting(false);
    }
  };

  const disableOldDates = (current) => {
    return current && current.isBefore(moment().startOf('day'), 'day');
  };

  // Generate time options every 30 minutes from 10:00 to 22:30
  const generateTimeOptions = () => {
    const options = [];
    const startHour = 10;
    const endHour = 22; // Last hour is 22 (for 22:00 and 22:30)
    
    for (let hour = startHour; hour <= endHour; hour++) {
      // Add :00 option
      const time00 = `${hour.toString().padStart(2, '0')}:00`;
      options.push({ value: time00, label: time00 });
      
      // Add :30 option for all hours (including 22:30 as the last option)
      if (hour < 23) { // We stop at 22:30, so hour 23 doesn't exist
        const time30 = `${hour.toString().padStart(2, '0')}:30`;
        options.push({ value: time30, label: time30 });
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <section id="book-a-table" className="book-a-table section">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Запази маса</h2>
        <p>
          <span>Резервирайте</span> <span className="description-title">престоя си при нас</span>
        </p>
        <h2 style={{color: 'red'}}><span style={{fontWeight: '900'}}>10% отстъпка</span> за резервации от неделя до четвъртък</h2>
      </div>

      <div className="container">
        <div className="row g-0">
          {/* Reservation Image */}
          <div
            className="col-lg-4 reservation-img"
            style={{ backgroundImage: 'url(/images/reservation.jpg)' }}
          ></div>

          {/* Reservation Form */}
          <div className="col-lg-8 d-flex align-items-center reservation-form-bg" style={{ padding: "25px" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="reservation-form"
              style={{ position: 'relative', width: '100%' }}
            >
              <div className="row gy-4">
                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="name"
                    label="Вашето име"
                    rules={[{ required: true, message: "Моля въведете лице, на чието име е резервацията" }]}
                  >
                    <Input placeholder="Имена" className="form-control" />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="email"
                    label="Вашия email"
                    rules={[
                      { required: true, message: "Моля въведете email" },
                      { type: "email", message: "Моля, въведете валиден email" },
                    ]}
                  >
                    <Input placeholder="Вашия email" className="form-control" />
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
                    name="date"
                    label="Дата"
                    rules={[{ required: true, message: "Изберете дата на резервацията" }]}
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
                    name="time"
                    label="Час"
                    rules={[{ required: true, message: "Изберете час за резервацията" }]}
                  >
                    <Select
                      style={{ width: "100%", height: "39px" }}
                      placeholder="Изберете час"
                      className="form-control"
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={timeOptions}
                    />
                  </Form.Item>
                </div>

                <div className="col-lg-4 col-md-6">
                  <Form.Item
                    name="people"
                    label="За колко човека?"
                    rules={[{ required: true, message: "Моля, въведере брой на хората" }]}
                  >
                    <InputNumber 
                      style={{ 
                        width: "100%", 
                        height: "38px",
                        lineHeight: "38px"
                      }} 
                      placeholder="Брой хора" 
                      min={1} 
                      className="form-control" 
                    />
                  </Form.Item>
                </div>
              </div>

              <Form.Item name="message" label="Съобщение">
                <Input.TextArea rows={5} placeholder="Някакви специални изисквания, напишете ги тук" className="form-control" />
              </Form.Item>

              <div style={{ marginBottom: '15px', fontSize: '14px', textAlign: 'center', lineHeight: '1.6' }}>
                С потвърждаването на резервацията Вие се съгласявате с нашите{' '}
                <a href="/obshti-usloviya" target="_blank" rel="noopener noreferrer" style={{ color: '#ce1212', textDecoration: 'underline' }}>
                  Общи условия
                </a>
                {' '}и{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#ce1212', textDecoration: 'underline' }}>
                  Политика за личните данни
                </a>
              </div>

              <FormAntiBotFields
                honeypotRef={honeypotRef}
                turnstileRef={turnstileRef}
                setTurnstileToken={setTurnstileToken}
                turnstileConfigured={turnstileConfigured}
              />

              <div className="text-center mt-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={submitting || submitBlocked}
                >
                  Запази
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookTableSection;
