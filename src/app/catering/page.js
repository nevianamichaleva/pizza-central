'use client';

import EditorialSectionIntro from '@/components/EditorialSectionIntro';
import Image from 'next/image';
import Link from 'next/link';

export default function CateringPage() {
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
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Кетъринг услуги",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Кетъринг за фирмени събития",
            "description": "Професионален кетъринг за фирмени събития, коктейли, срещи, обучения и презентации"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Кетъринг за рождени дни",
            "description": "Специално меню за рождени дни с индивидуален подход"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Кетъринг за кръщенета",
            "description": "Кетъринг за религиозни и семейни празненства"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Кетъринг за частни партита",
            "description": "Професионален кетъринг за всякакви поводи за празнуване"
          }
        }
      ]
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Добрич"
      },
      {
        "@type": "City",
        "name": "Варна"
      }
    ]
  };
  const cateringImages = [
    '/images/catering/1000032298.jpg',
    '/images/catering/1000032299.jpg',
    '/images/catering/1000032300.jpg',
    '/images/catering/1000032301.jpg',
    '/images/catering/1000032302.jpg',
    '/images/catering/1000032303.jpg',
    '/images/catering/1000032304.jpg',
    '/images/catering/1000032305.jpg',
    '/images/catering/1000032306.jpg',
    '/images/catering/1000032307.jpg',
    '/images/catering/1000032308.jpg',
    '/images/catering/1000032309.jpg',
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section id="catering" className="catering section">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Кетъринг</h2>
        <p>
          <span>Традиция и вкус</span> <span className="description-title">навсякъде с вас</span>
        </p>
      </div>
      {/* End Section Title */}

      <EditorialSectionIntro
        kicker="Кетъринг · Добрич и Варна"
        lead="Професионално обслужване и меню, съобразено с повода — от фирмено събитие до личен празник."
      />

      <div className="container">
        {/* Introduction Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content text-center">
              <p className="lead" style={{ fontSize: '22px', lineHeight: '1.8' }}>
                Ресторант-пицария <strong>„Централ"</strong> предлага професионален кетъринг за фирмени и лични събития, създаден с внимание към детайла, вкуса и визията. Подхождаме индивидуално към всяка поръчка, за да отговорим напълно на вашите изисквания, повод и предпочитания.
              </p>
              <div style={{ 
                marginTop: '25px', 
                padding: '20px', 
                backgroundColor: 'var(--surface-color)', 
                borderRadius: '8px',
                border: '2px solid #ce1212'
              }}>
                <p style={{ fontSize: '20px', margin: 0, fontWeight: '600', color: 'var(--heading-color)' }}>
                  <i className="bi bi-geo-alt-fill" style={{ color: '#ce1212', marginRight: '8px' }}></i>
                  Изпълняваме поръчки за <strong>гр. Добрич и Добричка област</strong>, както и за <strong>гр. Варна и Варненска област</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mb-5" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <Link href="/catering/zaiavka" className="btn btn-primary" style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s'
          }}>
            Заяви кетъринг
          </Link>
          <Link href="/contact" className="btn btn-primary" style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s'
          }}>
            Свържете се с нас
          </Link>
        </div>

        {/* Актуално меню и цени — нови каталози */}
        <div
          className="row gy-4 mb-5"
          id="catering-menu-prices"
          style={{
            padding: '36px 24px',
            backgroundColor: 'var(--surface-color)',
            borderRadius: '16px',
            border: '2px solid rgba(206, 18, 18, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="col-lg-12 text-center">
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#ce1212',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '6px 14px',
                borderRadius: '20px',
                marginBottom: '16px',
              }}
            >
              Ново
            </span>
            <h3
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                color: 'var(--heading-color)',
                marginBottom: '12px',
                fontFamily: 'var(--heading-font)',
              }}
            >
              Актуално меню и цени
            </h3>
            <p style={{ fontSize: '18px', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 28px', color: 'var(--default-color)' }}>
              Разгледайте нашите нови кетъринг предложения — плата, солени и сладки хапки с цени в евро.
              За поръчка и индивидуално меню{' '}
              <Link href="/catering/zaiavka" style={{ color: '#ce1212', fontWeight: 600 }}>
                изпратете заявка
              </Link>
              .
            </p>
          </div>

          <div className="col-lg-12">
            <figure style={{ margin: 0, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}>
              <figcaption
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--heading-color)',
                  marginBottom: '14px',
                  textAlign: 'center',
                  fontFamily: 'var(--heading-font)',
                }}
              >
                Плата и вегетариански предложения
              </figcaption>
              <Image
                src="/images/catering/catering_prices1.png"
                alt="Кетъринг меню — плата мезета, сирена, топло плато, плодове и вегетариански хапки с цени в евро"
                width={842}
                height={1264}
                priority
                sizes="(max-width: 920px) 100vw, 920px"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.1)',
                }}
              />
            </figure>
          </div>

          <div className="col-lg-12" style={{ marginTop: '8px' }}>
            <figure style={{ margin: 0, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}>
              <figcaption
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--heading-color)',
                  marginBottom: '14px',
                  textAlign: 'center',
                  fontFamily: 'var(--heading-font)',
                }}
              >
                Солени и сладки хапки
              </figcaption>
              <Image
                src="/images/catering/catering_prices.png"
                alt="Кетъринг меню — мини бургери, брускети, тарталети, десерти и сладки изкушения с цени в евро"
                width={843}
                height={1264}
                sizes="(max-width: 920px) 100vw, 920px"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.1)',
                }}
              />
            </figure>
          </div>

          <div className="col-lg-12 text-center" style={{ marginTop: '8px' }}>
            <p style={{ fontSize: '16px', color: 'var(--default-color)', marginBottom: '16px' }}>
              Цените са ориентировъчни за бройка. За събития с повече гости подготвяме индивидуална оферта.
            </p>
            <Link
              href="/catering/zaiavka"
              className="btn btn-primary"
              style={{
                backgroundColor: '#ce1212',
                color: '#fff',
                padding: '12px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Заяви оферта за вашето събитие
            </Link>
          </div>
        </div>

        {/* Main Image */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Image 
                src="/images/catering/1000032298.jpg" 
                alt="Кетъринг от Ресторант-пицария Централ Добрич" 
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

        {/* How We Work Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-6">
            <div className="content">
              <h3 style={{ fontSize: '32px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
                Как работим
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>С предварителна заявка</strong> – всяко кетъринг предложение се изготвя специално за вас</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Индивидуална консултация за меню</strong> – съобразяване с броя гости, повода и бюджета</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Възможност за комбиниране</strong> – различни плата и хапки според вашите предпочитания</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}><strong>Професионално обслужване</strong> – внимание към детайла, вкуса и визията</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '22px' }}>Изпълняваме поръчки за <strong>гр. Варна и Варненска област</strong>, както и за <strong>гр. Добрич и Добричка област</strong></span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6">
            {/* Image 1 */}
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <Image 
                src="/images/catering/1000032299.jpg" 
                alt="Кетъринг - снимка 1" 
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
                src="/images/catering/1000032300.jpg" 
                alt="Кетъринг - снимка 2" 
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
              <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '12px', fontFamily: 'var(--heading-font)' }}>
                Нашите кетъринг предложения
              </h3>
              <p style={{ fontSize: '17px', marginBottom: '24px' }}>
                <Link href="#catering-menu-prices" style={{ color: '#ce1212', fontWeight: 600 }}>
                  Вижте пълното меню с цени ↑
                </Link>
              </p>
              <div className="row gy-4 mt-4">
                <div className="col-md-4">
                  <div style={{ padding: '20px' }}>
                    <i className="bi bi-egg-fried" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Плата</h4>
                    <p style={{ fontSize: '18px' }}>Топли плата, студени плата и плодови плата – подходящи за фирмени събития, срещи, празници и специални поводи.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div style={{ padding: '20px' }}>
                    <i className="bi bi-basket-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Солени хапки</h4>
                    <p style={{ fontSize: '18px' }}>Брускети, мини сандвичи, тарталети и специални предложения – разнообразие от вкусове за всяко събитие.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div style={{ padding: '20px' }}>
                    <i className="bi bi-cake2-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Сладки изкушения</h4>
                    <p style={{ fontSize: '18px' }}>Мъфини, тарталети и мини купички – сладки изненади, които ще направят вашето събитие незабравимо.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suitable For Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content">
              <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)', textAlign: 'center' }}>
                Подходящо за:
              </h3>
              <div className="row gy-4">
                <div className="col-md-3">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-briefcase-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Фирмени събития</h4>
                    <p style={{ fontSize: '18px' }}>Коктейли, срещи, обучения и презентации</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-gift-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Рождени дни</h4>
                    <p style={{ fontSize: '18px' }}>Специални моменти, които заслужават специално меню</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-heart-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Кръщенета</h4>
                    <p style={{ fontSize: '18px' }}>Религиозни и семейни празненства</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-people-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Частни партита</h4>
                    <p style={{ fontSize: '18px' }}>Всякакви поводи за празнуване</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="row gy-4">
          <div className="col-lg-12">
            <h3 style={{ fontSize: '18px', color: 'var(--heading-color)', marginBottom: '30px', fontFamily: 'var(--heading-font)', textAlign: 'center' }}>
              Галерия от нашите кетъринг предложения
            </h3>
          </div>
          {cateringImages.slice(3, 12).map((img, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Image 
                  src={img} 
                  alt={`Кетъринг - снимка ${idx + 4}`} 
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
                Направете вашето събитие незабравимо!
              </h3>
              <p style={{ fontSize: '22px', marginBottom: '30px' }}>
                Свържете се с нас на <strong>0895 516 401</strong> или <strong>0893 315 201</strong>, за да уговорим час за консултация и уточняване на детайли и цени.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <Link href="/catering/zaiavka" className="btn btn-primary" style={{ 
                  backgroundColor: '#ce1212', 
                  color: '#fff', 
                  padding: '12px 30px', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s'
                }}>
                  Заяви кетъринг
                </Link>
                <Link href="/contact" className="btn btn-primary" style={{ 
                  backgroundColor: '#ce1212', 
                  color: '#fff', 
                  padding: '12px 30px', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s'
                }}>
                  Свържете се с нас
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
