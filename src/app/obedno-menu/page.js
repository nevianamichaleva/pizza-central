'use client';

import EditorialSectionIntro from '@/components/EditorialSectionIntro';
import {
  findLaunchMenuForDate,
  formatMenuDateForDisplay,
  getTodayLaunchMenuDateStringEuropeSofia,
} from '@/lib/launchMenuToday';
import { onValue, ref } from 'firebase/database';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { rtdb } from '../../../lib/firebase';

function weekDayLeadingLower(raw) {
  const s = raw == null ? '' : String(raw).trim();
  if (!s) return '';
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function hasRenderableDailyContent(menu) {
  if (!menu) return false;
  const str = (v) => (v == null ? '' : String(v).trim());
  const hasImg = str(menu.image).length > 0;
  const hasDesc = str(menu.description).length > 0;
  const hasDishes = Array.isArray(menu.dishes) && menu.dishes.some((d) => d && (str(d.name) || str(d.price)));
  return hasImg || hasDesc || hasDishes;
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  name: 'Ресторант-пицария Централ',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Независимост 4',
    addressLocality: 'Добрич',
    addressCountry: 'BG',
  },
  telephone: ['0895516401', '0893315201'],
  servesCuisine: 'Италианска, Българска',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '11:00',
      closes: '15:00',
    },
  ],
  hasMenu: {
    '@type': 'Menu',
    name: 'Обедно меню',
    description: 'Дневно обедно меню с традиционни български ястия, салати и супи',
    offers: {
      '@type': 'Offer',
      description: 'Обедно меню всеки работен ден от 11 до 15 часа',
    },
  },
  areaServed: {
    '@type': 'City',
    name: 'Добрич',
  },
};

function ObednoMenuDailyView({ menu }) {
  const dateLabel = formatMenuDateForDisplay(menu.date);
  const imgSrc = menu.image != null ? String(menu.image).trim() : '';

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-9">
          {/* <EditorialSectionIntro kicker={menu.weekDay} fullWidth={false} /> */}
          <div className="content text-center mb-4">
            <h3
              style={{
                fontSize: 'clamp(1.35rem, 4vw, 2rem)',
                color: 'var(--heading-color)',
                fontFamily: 'var(--heading-font)',
                marginBottom: '12px',
              }}
            >
              {dateLabel} {menu.weekDay ? `- ${weekDayLeadingLower(menu.weekDay)}` : ''}
              {menu.weekDay ? (
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 400, marginTop: '8px', color: 'var(--default-color)' }}>
                  от 11:00 – 15:00
                </span>
              ) : (
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 400, marginTop: '8px', color: 'var(--default-color)' }}>
                  11:00 – 15:00
                </span>
              )}
            </h3>
            {menu.description ? (
              <p className="lead mb-0" style={{ fontSize: '1.2rem', lineHeight: 1.7, maxWidth: 640, margin: '0 auto', whiteSpace: 'pre-line' }}>
                {menu.description}
              </p>
            ) : null}
          </div>

          {imgSrc ? (
            <div
              className="text-center mb-4 mx-auto"
              style={{
                maxWidth: 480,
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              }}
            >
              {/* <img> — работи с Cloudinary, Facebook CDN и др.; Next/Image иска allowlist за домейн */}
              <img
                src={imgSrc}
                alt={`Обедно меню ${dateLabel} — ресторант Централ, Добрич`}
                className="img-fluid"
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          ) : null}

          <div
            className="text-center mb-4 px-2"
            style={{
              padding: '28px 20px',
              backgroundColor: 'var(--surface-color)',
              borderRadius: '12px',
              border: '1px solid rgba(206, 18, 18, 0.15)',
            }}
          >
            <p style={{ fontSize: '1.15rem', lineHeight: 1.75, marginBottom: '12px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Заповядайте в <strong>„Централ“</strong> на <strong>ул. „Независимост“ 4</strong> — топла храна, уютна зала и бързо обслужване.
              Обадете се или резервирайте онлайн, за да си гарантирате маса за обяд.
            </p>
            <p style={{ fontSize: '1rem', marginBottom: 0, color: 'var(--default-color)' }}>
              Тел.:{' '}
              <a href="tel:+359895516401" style={{ color: '#ce1212', fontWeight: 600 }}>
                089 551 6401
              </a>
              {' · '}
              <a href="tel:+359893315201" style={{ color: '#ce1212', fontWeight: 600 }}>
                089 331 5201
              </a>
            </p>
          </div>

          <div className="text-center mb-5" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <Link
              href="/reservation"
              className="btn btn-primary"
              style={{
                backgroundColor: '#ce1212',
                color: '#fff',
                padding: '12px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: '0.3s',
                border: 'none',
              }}
            >
              Резервирай маса
            </Link>
            <Link
              href="/for-home"
              className="btn btn-primary"
              style={{
                backgroundColor: '#ce1212',
                color: '#fff',
                padding: '12px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: '0.3s',
                border: 'none',
              }}
            >
              Доставка до адрес
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ObednoMenuFallbackView() {
  const launchImages = [
    '/images/launch/launch1.jpg',
    '/images/launch/launch2.jpg',
    '/images/launch/launch3.jpg',
    '/images/launch/launch4.jpg',
    '/images/launch/launch5.jpg',
    '/images/launch/launch6.jpg',
    '/images/launch/launch7.jpg',
    '/images/launch/launch8.jpg',
    '/images/launch/launch9.jpg',
  ];

  return (
    <>
      <EditorialSectionIntro
        kicker="Обед · делник 11:00 – 15:00"
        lead="Домашни ястия на достъпни цени; актуалното дневно меню публикуваме и тук, и във Facebook."
      />
      <div className="container">
      <div className="row gy-4 mb-5">
        <div className="col-lg-12">
          <div className="content text-center">
            <p className="lead" style={{ fontSize: '22px', lineHeight: '1.8' }}>
              В ресторант-пицария <strong>„Централ"</strong> предлагаме разнообразно <strong>обедно меню</strong>, което ще
              задоволи всеки вкус. Нашите ястия се приготвят с внимание към качеството и вкуса, като предлагаме баланс между
              традиционна българска кухня и модерни кулинарни решения.
            </p>
            <p style={{ fontSize: '20px', lineHeight: '1.8', marginTop: '20px', color: '#ce1212', fontWeight: '600' }}>
              <i className="bi bi-clock-fill" style={{ marginRight: '8px' }}></i>
              Обедно меню всеки работен ден от 11 до 15 часа
            </p>
          </div>
        </div>
      </div>
      <div className="text-center mb-5" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <Link
          href="/reservation"
          className="btn btn-primary"
          style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s',
          }}
        >
          Резервирай маса
        </Link>
        <Link
          href="/for-home"
          className="btn btn-primary"
          style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s',
          }}
        >
          Доставка
        </Link>
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-lg-12">
          <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Image
              src="/images/launch/launch1.jpg"
              alt="Обедно меню в ресторант-пицария Централ Добрич"
              width={1200}
              height={600}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-lg-6">
          <div className="content">
            <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
              Какво предлага нашето обедно меню?
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Разнообразие от ястия</strong> – от класически български специалитети до модерни кулинарни решения
                </span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Свежи продукти</strong> – използваме само качествени и свежи съставки за всяко ястие
                </span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Достъпни цени</strong> – предлагаме вкусна храна на разумни цени за всеки
                </span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Бързо обслужване</strong> – идеално за обедна почивка или бизнес среща
                </span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Дневно меню</strong> – всеки ден предлагаме различни ястия за разнообразие
                </span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-hourglass-split" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Очаквайте скоро</strong> – нашите нови предложения за закуска
                </span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <i className="bi bi-facebook" style={{ color: '#1877f2', marginRight: '10px' }}></i>
                <span style={{ fontSize: '22px' }}>
                  <strong>Следете ни във Фейсбук</strong> – за нашите всекидневни обедни предложения{' '}
                  <Link
                    href="https://www.facebook.com/CentralDobrich?locale=bg_BG"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1877f2', textDecoration: 'underline', fontWeight: '600' }}
                  >
                    тук
                  </Link>
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            <Image
              src="/images/launch/launch2.jpg"
              alt="Обедно меню - крем супа от тиква"
              width={600}
              height={300}
              style={{
                width: '100%',
                height: '300px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
          </div>
          <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Image
              src="/images/launch/launch3.jpg"
              alt="Обедно меню - пилешка супа"
              width={600}
              height={300}
              style={{
                width: '100%',
                height: '300px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-lg-12">
          <div className="content text-center" style={{ padding: '30px', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '32px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
              Нашите обедни предложения
            </h3>
            <div className="row gy-4 mt-4">
              <div className="col-md-4">
                <div style={{ padding: '20px' }}>
                  <i className="bi bi-egg-fried" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                  <h4 style={{ fontSize: '24px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Основни ястия</h4>
                  <p style={{ fontSize: '22px' }}>Традиционни български ястия, приготвени с майсторство и внимание към детайла.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div style={{ padding: '20px' }}>
                  <i className="bi bi-cup-hot-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                  <h4 style={{ fontSize: '24px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Супи</h4>
                  <p style={{ fontSize: '22px' }}>Топли и питателни супи, които ще ви сгреят и задоволят вкуса ви.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div style={{ padding: '20px' }}>
                  <i className="bi bi-cake2-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                  <h4 style={{ fontSize: '24px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Десерти</h4>
                  <p style={{ fontSize: '22px' }}>Сладки изкушения, които ще завършат перфектно вашия обяд.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-4 mb-5">
        <div className="col-lg-12">
          <div className="content">
            <h3
              style={{
                fontSize: '32px',
                color: 'var(--heading-color)',
                marginBottom: '20px',
                fontFamily: 'var(--heading-font)',
                textAlign: 'center',
              }}
            >
              Защо да изберете нашето обедно меню?
            </h3>
            <div className="row gy-4">
              <div className="col-md-4">
                <div className="text-center" style={{ padding: '20px' }}>
                  <i className="bi bi-clock-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                  <h4 style={{ fontSize: '24px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Бързо обслужване</h4>
                  <p style={{ fontSize: '22px' }}>Идеално за обедна почивка – получавате вкусна храна бързо и ефективно.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center" style={{ padding: '20px' }}>
                  <i className="bi bi-currency-exchange" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                  <h4 style={{ fontSize: '24px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Достъпни цени</h4>
                  <p style={{ fontSize: '22px' }}>Качествена храна на разумни цени, която всеки може да си позволи.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center" style={{ padding: '20px' }}>
                  <i className="bi bi-heart-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                  <h4 style={{ fontSize: '24px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Домашна храна</h4>
                  <p style={{ fontSize: '22px' }}>Ястия, приготвени с любов и внимание, които ще ви напомнят за домашна кухня.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-4">
        <div className="col-lg-12">
          <h3
            style={{
              fontSize: '32px',
              color: 'var(--heading-color)',
              marginBottom: '30px',
              fontFamily: 'var(--heading-font)',
              textAlign: 'center',
            }}
          >
            Галерия от нашето обедно меню
          </h3>
        </div>
        {launchImages.slice(3, 9).map((img, idx) => (
          <div key={idx} className="col-lg-4 col-md-6">
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Image
                src={img}
                alt={`Обедно меню - снимка ${idx + 4}`}
                width={400}
                height={250}
                style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="row gy-4 mt-5">
        <div className="col-lg-12">
          <div className="content text-center" style={{ padding: '40px', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
              Посетете ни за обяд!
            </h3>
            <p style={{ fontSize: '22px', marginBottom: '30px' }}>
              Очакваме ви в ресторант-пицария <strong>„Централ"</strong> за вкусен обяд в приятна обстановка!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <Link
                href="/reservation"
                className="btn btn-primary"
                style={{
                  backgroundColor: '#ce1212',
                  color: '#fff',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s',
                }}
              >
                Резервирай маса
              </Link>
              <Link
                href="/for-home"
                className="btn btn-primary"
                style={{
                  backgroundColor: '#ce1212',
                  color: '#fff',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s',
                }}
              >
                Доставка
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

const ObednoMenuPage = () => {
  const [todayMenu, setTodayMenu] = useState(undefined);

  useEffect(() => {
    const menuRef = ref(rtdb, 'launch-menu');

    const unsubscribe = onValue(menuRef, (snapshot) => {
      try {
        const todayStr = getTodayLaunchMenuDateStringEuropeSofia();
        if (!snapshot.exists()) {
          setTodayMenu(null);
          return;
        }
        const found = findLaunchMenuForDate(snapshot.val(), todayStr);
        setTodayMenu(hasRenderableDailyContent(found) ? found : null);
      } catch (e) {
        console.error('obedno-menu launch-menu:', e);
        setTodayMenu(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const showDaily = todayMenu != null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section id="obedno-menu" className="obedno-menu section">
        <div className="container section-title">
          <h2>Обедно меню</h2>
          <p>
            {showDaily && todayMenu ? (
              <span className="description-title">Актуално за днес</span>
            ) : (
              <>
                <span>Вкусни ястия</span> <span className="description-title">на достъпни цени</span>
              </>
            )}
          </p>
        </div>

        {todayMenu === undefined ? (
          <div className="container text-center py-5">
            <p style={{ fontSize: '18px' }}>Зареждане…</p>
          </div>
        ) : showDaily ? (
          <ObednoMenuDailyView menu={todayMenu} />
        ) : (
          <ObednoMenuFallbackView />
        )}
      </section>
    </>
  );
};

export default ObednoMenuPage;
