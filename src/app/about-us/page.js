'use client';

import AboutSection from '@/components/AboutSection';
import Gallery from '@/components/Gallery';
import Link from 'next/link';

const AboutUsPage = () => {
  return (
    <div>
      <AboutSection />
      
      {/* Action Links Section */}
      <section className="section" style={{ paddingTop: '40px', paddingBottom: '60px', backgroundColor: 'var(--surface-color)' }}>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-12" data-aos="fade-up">
              <div className="text-center mb-4">
                <h3 style={{ fontSize: '28px', color: 'var(--heading-color)', marginBottom: '15px', fontFamily: 'var(--heading-font)' }}>
                  Разгледайте нашите услуги
                </h3>
                <p style={{ fontSize: '18px', color: '#666' }}>
                  Намерете точно това, което търсите
                </p>
              </div>
              
              <div className="row gy-4 justify-content-center">
                <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
                  <Link href="/detski-kut" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="text-center" style={{
                      padding: '40px 30px',
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(206, 18, 18, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    }}>
                      <i className="bi bi-heart-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '20px', display: 'block' }}></i>
                      <h4 style={{ fontSize: '22px', color: 'var(--heading-color)', marginBottom: '15px', fontFamily: 'var(--heading-font)' }}>
                        Детски кът
                      </h4>
                      <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                        Безопасно място за игра, където децата ви ще се забавляват, докато вие се наслаждавате на вкусна храна
                      </p>
                    </div>
                  </Link>
                </div>
                
                <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
                  <Link href="/reservation" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="text-center" style={{
                      padding: '40px 30px',
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(206, 18, 18, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    }}>
                      <i className="bi bi-calendar-check-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '20px', display: 'block' }}></i>
                      <h4 style={{ fontSize: '22px', color: 'var(--heading-color)', marginBottom: '15px', fontFamily: 'var(--heading-font)' }}>
                        Резервирай маса
                      </h4>
                      <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                        Запазете си маса в ресторанта ни и се насладете на приятна вечеря в приятна обстановка
                      </p>
                    </div>
                  </Link>
                </div>
                
                <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
                  <Link href="/for-home" style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="text-center" style={{
                      padding: '40px 30px',
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(206, 18, 18, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                    }}>
                      <i className="bi bi-house-door-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '20px', display: 'block' }}></i>
                      <h4 style={{ fontSize: '22px', color: 'var(--heading-color)', marginBottom: '15px', fontFamily: 'var(--heading-font)' }}>
                        Поръчай за вкъщи
                      </h4>
                      <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                        Поръчайте онлайн и се насладете на вкусна храна у дома с бърза доставка
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      <Gallery />
    </div>
  );
};

export default AboutUsPage;

