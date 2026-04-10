'use client';

import { get, push, ref, set } from 'firebase/database';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { validateContactAntiBot } from '@/lib/contactAntiBot';
import { rtdb } from '../../lib/firebase';
import showAToast from './common/showAToast';

const Contact = (props) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
  });

  const [status, setStatus] = useState('');
  const formOpenedAtRef = useRef(0);
  const honeypotRef = useRef(null);

  useEffect(() => {
    if (props.part) return;
    formOpenedAtRef.current = Date.now();
  }, [props.part]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const openedAt = formOpenedAtRef.current;
    const antiBot = {
      hpWebsite: (honeypotRef.current?.value ?? '').trim(),
      formOpenedAt: openedAt,
    };
    const gate = validateContactAntiBot(antiBot);
    if (!gate.ok) {
      if (gate.code === 'honeypot') {
        showAToast('success', 'Благодарим, че се свързахте с нас. Очаквайте нашето обаждане за да обсъдим подробностите!');
        setStatus('success');
        return;
      }
      if (gate.code === 'fast') {
        showAToast('error', 'Моля изчакайте няколко секунди и опитайте отново.');
        return;
      }
      if (gate.code === 'stale') {
        showAToast('error', 'Формата е изтекла. Презаредете страницата и опитайте отново.');
        return;
      }
      showAToast('error', 'Невалидна заявка. Презаредете страницата и опитайте отново.');
      return;
    }

    const contactData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      phone: formData.phone
    };

    try {
      const contactsRef = ref(rtdb, 'contacts');
      const newContactRef = push(contactsRef);
      await set(newContactRef, contactData);

      // Send email notification
      try {
        // Get admin email from Firebase settings
        const emailRef = ref(rtdb, 'settings/email');
        const emailSnapshot = await get(emailRef);
        let adminEmail = null;

        if (emailSnapshot.exists()) {
          const emailData = emailSnapshot.val();
          adminEmail = emailData.adminEmail || emailData.email;
        }

        if (adminEmail) {
          // Also get SMTP config to send to API
          const smtpRef = ref(rtdb, 'settings/email');
          const smtpSnapshot = await get(smtpRef);
          let smtpConfig = null;

          if (smtpSnapshot.exists()) {
            const smtpData = smtpSnapshot.val();
            smtpConfig = {
              smtpHost: smtpData.smtpHost,
              smtpPort: smtpData.smtpPort,
              smtpUser: smtpData.smtpUser,
              smtpPassword: smtpData.smtpPassword,
              smtpSecure: smtpData.smtpSecure,
              fromEmail: smtpData.fromEmail
            };
          }

          const response = await fetch('/api/send-contact-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contactData: contactData,
              adminEmail: adminEmail,
              smtpConfig: smtpConfig,
              antiBot,
            }),
          });

          const result = await response.json();
          if (!result.success && !result.logged) {
            console.error('Failed to send email notification:', result);
          }
        } else {
          console.log('No admin email configured, skipping email notification');
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
        // Don't block the contact process if email fails
      }

      showAToast('success', 'Благодарим, че се свързахте с нас. Очаквайте нашето обаждане за да обсъдим подробностите!');
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', phone: '' });
      if (honeypotRef.current) honeypotRef.current.value = '';
      formOpenedAtRef.current = Date.now();
    } catch (error) {
      console.error('Грешка при изпращане на съобщение: ', error);
      setStatus('error');
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="contact section">
      <div className="container section-title">
        <h2>Контакти</h2>
        <p>
          <span></span> <span className="description-title">Обърнете се към нас</span>
        </p>
        <p style={{ fontSize: '15px', color: '#666', marginTop: '8px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          При поръчки: 5% за регистрирани, 10% при вземане от място.{' '}
          <Link href="/faq" style={{ color: '#ce1212', textDecoration: 'underline' }}>Повече в FAQ</Link>
        </p>
      </div>

      {!props.part && (
        <div className="container">
          <form onSubmit={handleSubmit} className="php-email-form" style={{ position: 'relative' }}>
            {/* Honeypot: не попълвайте; ботовете често попълват скрити полета. */}
            <input
              ref={honeypotRef}
              type="text"
              name="company_website"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
            <div className="row gy-4">
              <div className="col-md-6">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Вашето име"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Вашия email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  placeholder="Вашия телефон"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  name="subject"
                  placeholder="Относно"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-12">
                <textarea
                  className="form-control"
                  name="message"
                  rows="6"
                  placeholder="Съобщение"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-12 text-center">
                {status === 'loading' && <div className="loading">Зареждане ...</div>}
                {status === 'error' && <div className="error-message">Има грешка, опитайте отново</div>}
                {status === 'success' && <div className="sent-message">Вашето съобщение беше изпратено. Благодарим Ви</div>}
                <button type="submit">Изпрати</button>
              </div>
            </div>
          </form>
        </div>
      )}
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>Адрес</h3>
                <p>гр. Добрич ул. Независимост 4</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-telephone flex-shrink-0"></i>
              <div>
                <h3>Телефон</h3>
                <p>+359 895 516 401 | +359 893 315 201</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-envelope flex-shrink-0"></i>
              <div>
                <h3>Email</h3>
                <p>pizzacentraldobrich@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center">
              <i className="icon bi bi-clock flex-shrink-0"></i>
              <div>
                <h3>Работно време</h3>
                <p>
                  <strong>Понеделник до неделя</strong> 10 - 23
                </p>
              </div>
            </div>
          </div>
        </div>
        {props.part && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/contact">
              <button
                type="button"
                style={{
                  fontSize: '18px',
                  padding: '12px 40px',
                  height: 'auto',
                  borderRadius: '8px',
                  backgroundColor: '#ce1212',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a00e0e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ce1212';
                }}
              >
                За контакт
              </button>
            </Link>
          </div>
        )}
        {!props.part && (
          <>
          <div className="mb-5">
            <iframe
              style={{ width: '100%', height: '400px' }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2890.7961952987803!2d27.824327076575123!3d43.56912965786365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a5169d3036e93b%3A0xc6b1ad1339889328!2z0JTQvtCx0YDQuNGHINCm0LXQvdGC0YrRgCwg0YPQuy4g4oCe0J3QtdC30LDQstC40YHQuNC80L7RgdGC4oCcIDQsIDkzMDAg0JTQvtCx0YDQuNGH!5e0!3m2!1sbg!2sbg!4v1734551388789!5m2!1sbg!2sbg"
              frameBorder="0"
              allowFullScreen
              title="Location"
            />
          </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Contact;
