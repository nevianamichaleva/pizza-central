'use client';

import EditorialSectionIntro from '@/components/EditorialSectionIntro';
import MenuSection from '@/components/MenuSection';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function ForHomeClient() {
  const { user } = useUser();

  return (
    <>
      <section className="section">
        <div className="container section-title">
          <h1>Доставка на храна и пица в Добрич от Ресторант Централ</h1>
          <h2>Официален сайт — доставка до адрес и takeaway</h2>
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
            Поръчайте директно от нас – без посредник. <strong>Такса за доставка 1,53 €.</strong>{' '}
            <strong>5% отстъпка</strong> за регистрирани при доставка · <strong>10%</strong> при вземане от място
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

      <EditorialSectionIntro
        kicker="Доставка · Добрич"
        // lead="Италианска и българска кухня от същата пещ и готвачи като в залата — удобно до вратата ви или за вземане от място."
      />

      {/* <section className="section pt-0">
        <div className="container" style={{ maxWidth: '720px', marginBottom: '8px' }}>
          <p
            className="editorial-page-intro-lead"
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.75,
              color: 'var(--default-color, #444)',
              marginBottom: 0,
            }}
          >
            Поръчвате ли <strong>доставка на пица в Добрич</strong>, салати, паста или основни ястия? При нас поръчката е
            {' '}<strong>напрямо от ресторанта</strong> — с ясни условия в онлайн количката. Разгледайте{' '}
            <Link href="/central-menu">ресторантското меню</Link>
            {', '}направете поръчка от <Link href="/order">страницата за поръчка</Link>
            {' '}или се обадете на телефоните по-долу. За делничен обяд между 11 и 15 ч вижте{' '}
            <Link href="/obedno-menu">обедното меню в Добрич</Link>. Минимална сума и такса за доставка виждате в количката;
            {' '}обикновено доставяме за <strong>30–60 минути</strong> всеки ден <strong>10:00–22:00</strong>. Плащане при доставка в брой.{' '}
            <Link href="/faq">Често задавани въпроси за доставката</Link>.
          </p>
        </div>
      </section> */}

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
              {/* <li style={{ marginBottom: '10px' }}>
                <strong>Такса за доставка:</strong> 1,53 €
                <Link href="/order" style={{ color: '#ce1212', fontWeight: 600 }}>
                  количката
                </Link>
              </li> */}
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
