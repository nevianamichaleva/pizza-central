'use client';

import MenuSection from '@/components/MenuSection';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function Products() {
  const { user } = useUser();

  return (
    <>
      <section className="section">
        <div className="container section-title">
          <h1>Доставка от Ресторант-пицария Централ Добрич</h1>
          <h2>Официален сайт за доставка и takeaway</h2>
          <p
            style={{
              fontSize: '15px',
              color: '#ce1212',
              marginTop: '16px',
              lineHeight: '1.5',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontWeight: '600',
            }}
          >
            Поръчайте директно от нас – без посредник. <strong>5% отстъпка</strong> за регистрирани при
            доставка · <strong>10%</strong> при вземане от място
          </p>
          {!user && (
            <p style={{ marginTop: '8px' }}>
              <Link href="/signup" style={{ fontSize: '17px', textDecoration: 'none', color: '#1890ff', fontWeight: 500 }}>
                Регистрация за отстъпка <i className="bi bi-arrow-right" />
              </Link>
            </p>
          )}
        </div>
      </section>

      <MenuSection hideTitle={true} />

      <section className="section pt-0" style={{ paddingTop: 0 }}>
        <div className="container" style={{ marginBottom: '24px' }}>
          <div
            className="delivery-trust-panel"
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              padding: '22px 24px',
              background: 'linear-gradient(180deg, #fffef9 0%, #ffffff 100%)',
              border: '1px solid rgba(206, 18, 18, 0.2)',
              borderRadius: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.15rem',
                fontSize: '0.95rem',
                lineHeight: 1.65,
                color: '#444',
              }}
            >
              <li style={{ marginBottom: '0' }}>
                Предпочитате да не ползвате сайта?{' '}
                <strong>Приемаме поръчки и по телефон</strong> – на номерата по-долу.
              </li>
            </ul>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '18px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <a
                href="tel:+359895516401"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#ce1212',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                <i className="bi bi-telephone-fill" style={{ marginRight: '8px' }} />
                089 551 6401
              </a>
              <a
                href="tel:+359893315201"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#ce1212',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  border: 'none',
                }}
              >
                <i className="bi bi-telephone-fill" style={{ marginRight: '8px' }} />
                089 331 5201
              </a>
              <Link
                href="/faq"
                style={{
                  alignSelf: 'center',
                  fontSize: '0.9rem',
                  color: '#555',
                  textDecoration: 'underline',
                }}
              >
                Още за доставката (ЧЗВ)
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
