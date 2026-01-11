'use client';

import Image from 'next/image';
import Link from 'next/link';

const CateringSection = () => {
  return (
    <section id="catering-preview" className="catering-preview section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Кетъринг услуги</h2>
        <p>
          <span>Професионален</span> <span className="description-title">кетъринг</span>
        </p>
      </div>
      {/* End Section Title */}

      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
            <Image 
              src="/images/catering/1000032309.jpg" 
              alt="Кетъринг услуги - Ресторант-пицария Централ Добрич" 
              width={800} 
              height={500} 
              className="img-fluid mb-2"
            />
          </div>
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="250">
            <div className="content ps-0 ps-lg-5" style={{ fontSize: '18px', padding: '0px!important' }}>
              <p style={{ fontSize: '20px', marginBottom: '30px', lineHeight: '1.5', fontStyle: 'italic' }}>
                Професионален <strong>кетъринг за фирмени и лични събития</strong> в Добрич. Приготвяме вкусни плата, солени хапки и сладки изкушения за вашето специално събитие.
              </p>
              <p style={{ fontSize: '18px', marginBottom: '15px' }}>Какво предлагаме?</p>
              <ul style={{ fontSize: '18px' }}>
                <li style={{ marginBottom: '15px' }}><i className="bi bi-check-circle-fill"></i> <span><strong>Индивидуална консултация</strong> – за меню и цени според вашите нужди и бюджет.</span></li>
                <li style={{ marginBottom: '15px' }}><i className="bi bi-check-circle-fill"></i> <span><strong>Разнообразни плата</strong> – за всяко събитие и вкус.</span></li>
                <li style={{ marginBottom: '15px' }}><i className="bi bi-check-circle-fill"></i> <span><strong>Солени хапки и сладки изкушения</strong> – приготвени с внимание към детайла.</span></li>
                <li style={{ marginBottom: '15px' }}><i className="bi bi-check-circle-fill"></i> <span><strong>Подходящо за всякакви събития</strong> – рождени дни, кръщенета, фирмени събития, коктейли и срещи.</span></li>
                <li style={{ marginBottom: '15px' }}><i className="bi bi-check-circle-fill"></i> <span><strong>Професионално обслужване</strong> – гарантираме качество и удовлетворение.</span></li>
              </ul>
              <p style={{ fontSize: '18px' }}>
                Свържете се с нас, за да уговорим детайлите на вашето събитие!
              </p>
            </div>
            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <Link 
                href="/catering" 
                className="btn-getstarted"
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'inline-block',
                  textDecoration: 'underline'
                }}
              >
                Повече информация
              </Link>
              <Link href="/catering/zaiavka">
                <button 
                  className="btn btn-primary"
                  style={{
                    padding: '12px 30px',
                    fontSize: '16px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: '#c41d7f',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  Заяви кетъринг
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CateringSection;

