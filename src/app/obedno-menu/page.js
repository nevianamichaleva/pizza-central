'use client';

import Image from 'next/image';
import Link from 'next/link';

const ObednoMenuPage = () => {
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

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": "Ресторант-пицария Централ",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Независимост 4",
      "addressLocality": "Добрич",
      "addressCountry": "BG"
    },
    "telephone": ["0895516401", "0893315201"],
    "servesCuisine": "Италианска, Българска",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "11:00",
        "closes": "15:00"
      }
    ],
    "hasMenu": {
      "@type": "Menu",
      "name": "Обедно меню",
      "description": "Дневно обедно меню с традиционни български ястия, салати и супи",
      "offers": {
        "@type": "Offer",
        "description": "Обедно меню всеки работен ден от 11 до 15 часа"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "Добрич"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section id="obedno-menu" className="obedno-menu section">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Обедно меню</h2>
        <p>
          <span>Вкусни ястия</span> <span className="description-title">на достъпни цени</span>
        </p>
      </div>
      {/* End Section Title */}

      <div className="container">
        {/* Introduction Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content text-center">
              <p className="lead" style={{ fontSize: '22px', lineHeight: '1.8' }}>
                В ресторант-пицария <strong>„Централ"</strong> предлагаме разнообразно <strong>обедно меню</strong>, което ще задоволи всеки вкус. Нашите ястия се приготвят с внимание към качеството и вкуса, като предлагаме баланс между традиционна българска кухня и модерни кулинарни решения.
              </p>
              <p style={{ fontSize: '20px', lineHeight: '1.8', marginTop: '20px', color: '#ce1212', fontWeight: '600' }}>
                <i className="bi bi-clock-fill" style={{ marginRight: '8px' }}></i>
                Обедно меню всеки работен ден от 11 до 15 часа
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mb-5" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <Link href="/reservation" className="btn btn-primary" style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s'
          }}>
            Резервирай маса
          </Link>
          <Link href="/for-home" className="btn btn-primary" style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s'
          }}>
            Доставка
          </Link>
        </div>

        {/* Main Image */}
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
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-6">
            <div className="content">
              <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
                Какво предлага нашето обедно меню?
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Разнообразие от ястия</strong> – от класически български специалитети до модерни кулинарни решения</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Свежи продукти</strong> – използваме само качествени и свежи съставки за всяко ястие</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Достъпни цени</strong> – предлагаме вкусна храна на разумни цени за всеки</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Бързо обслужване</strong> – идеално за обедна почивка или бизнес среща</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Дневно меню</strong> – всеки ден предлагаме различни ястия за разнообразие</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-hourglass-split" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Очаквайте скоро</strong> – нашите нови предложения за закуска</span>
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
            {/* Image 1 */}
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
                  objectFit: 'cover'
                }}
              />
            </div>
            {/* Image 2 */}
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
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>

        {/* Menu Options Section */}
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

        {/* Benefits Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content">
              <h3 style={{ fontSize: '32px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)', textAlign: 'center' }}>
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

        {/* Gallery Section */}
        <div className="row gy-4">
          <div className="col-lg-12">
            <h3 style={{ fontSize: '32px', color: 'var(--heading-color)', marginBottom: '30px', fontFamily: 'var(--heading-font)', textAlign: 'center' }}>
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
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
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
                <Link href="/reservation" className="btn btn-primary" style={{ 
                  backgroundColor: '#ce1212', 
                  color: '#fff', 
                  padding: '12px 30px', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s'
                }}>
                  Резервирай маса
                </Link>
                <Link href="/for-home" className="btn btn-primary" style={{ 
                  backgroundColor: '#ce1212', 
                  color: '#fff', 
                  padding: '12px 30px', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s'
                }}>
                  Доставка
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default ObednoMenuPage;
