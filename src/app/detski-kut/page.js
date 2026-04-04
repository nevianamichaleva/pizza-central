'use client';

import EditorialSectionIntro from '@/components/EditorialSectionIntro';

const DetskiKutPage = () => {
  return (
    <section id="detski-kut" className="detski-kut section">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Детски кът</h2>
        <p>
          <span>Място за</span> <span className="description-title">забавление и радост</span>
        </p>
      </div>
      {/* End Section Title */}

      <EditorialSectionIntro
        kicker="Семейство · детски кът"
        lead="Отделна зона за игра — вие се наслаждавате на обяда, децата на своето безопасно приключение."
      />

      <div className="container">
        {/* Introduction Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content text-center">
              <p className="lead" style={{ fontSize: '22px', lineHeight: '1.8' }}>
                В ресторант-пицария <strong>„Централ"</strong> вярваме, че всяко семейно посещение трябва да бъде приятно за всички – включително и за най-малките гости. Затова сме създали специален <strong>детски кът</strong>, където децата могат да се забавляват безопасно, докато родителите им се наслаждават на вкусна храна и спокойни разговори.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mb-5" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/reservation" className="btn btn-primary" style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s'
          }}>
            Резервирай маса
          </a>
          <a href="/central-menu" className="btn btn-primary" style={{
            backgroundColor: '#ce1212',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-block',
            transition: '0.3s'
          }}>
            Разгледайте менюто
          </a>
        </div>

        {/* Main Image */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src="/images/gallery/detski-kut1.jpg" 
                alt="Детски кът в ресторант-пицария Централ Добрич - идеален за детски рожден ден" 
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
                Какво предлага нашият детски кът?
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '18px' }}><strong>Безопасна игрова зона</strong> – специално проектирана за деца с меки подложки и закръглени ръбове</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '18px' }}><strong>Разнообразни играчки</strong> – кубчета, пъзели, цветни моливи и много други занимания</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '18px' }}><strong>Детски масички</strong> – удобни места, където децата могат да рисуват и играят</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '18px' }}><strong>Аниматор</strong> – който се грижи за вашите деца и им помага да се забавляват</span>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#ce1212', marginRight: '10px' }}></i>
                  <span style={{ fontSize: '18px' }}><strong>Чистота и хигиена</strong> – редовно почистване и дезинфекция на всички играчки</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6">
            {/* Image 1 */}
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src="/images/gallery/detski-kut5-web.jpg" 
                alt="Детски кът - снимка 1" 
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
              <img 
                src="/images/gallery/detski-kut3-web.jpg" 
                alt="Детски кът - снимка 2" 
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

        {/* Birthday Parties Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content text-center" style={{ padding: '30px', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
                Детски рожден ден в ресторант-пицария „Централ"
              </h3>
              <p className="lead" style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '15px' }}>
                Нашият <strong>детски кът</strong> е идеално място за организиране на <strong>детски рожден ден</strong> за деца до 10 години. Предлагаме специална среда, където малките рожденници и техните гости могат да се забавляват безопасно, докато родителите се наслаждават на вкусна храна и спокойна атмосфера.
              </p>
              <p style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '20px' }}>
                Със своите игрови зони, разнообразни занимания и грижа на нашия аниматор, всяко детско парти ще бъде незабравимо преживяване за всички участници. Свържете се с нас, за да резервирате дата за <strong>детски рожден ден</strong> на вашето дете!
              </p>
              <div style={{ marginTop: '25px' }}>
                <a 
                  href="https://www.pizza-central.bg/blog/detski-rojden-den-dobrich" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary" 
                  style={{
                    backgroundColor: '#ce1212',
                    color: '#fff',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: '0.3s',
                    fontSize: '18px'
                  }}
                >
                  Прочетете повече за детски рожден ден в Добрич
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="row gy-4 mb-5">
          <div className="col-lg-12">
            <div className="content">
              <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)', textAlign: 'center' }}>
                Защо да изберете ресторант с детски кът?
              </h3>
              <div className="row gy-4">
                <div className="col-md-4">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-heart-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Спокойствие за родителите</h4>
                    <p style={{ fontSize: '18px' }}>Знаете, че децата ви са в безопасна среда и се забавляват, докато вие се наслаждавате на спокойна вечеря.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-emoji-smile-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Радост за децата</h4>
                    <p style={{ fontSize: '18px' }}>Децата ви ще се забавляват с различни занимания, което прави посещението приятно и за тях.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center" style={{ padding: '20px' }}>
                    <i className="bi bi-people-fill" style={{ fontSize: '48px', color: '#ce1212', marginBottom: '15px', display: 'block' }}></i>
                    <h4 style={{ fontSize: '20px', fontFamily: 'var(--heading-font)', marginBottom: '10px' }}>Семейни моменти</h4>
                    <p style={{ fontSize: '18px' }}>Перфектно място за семейни срещи, където всички членове на семейството могат да се насладят.</p>
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
              Галерия от детския кът
            </h3>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src="/images/gallery/detski-kut3.jpg" 
                alt="Детски кът - снимка 3" 
                style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src="/images/gallery/detski-kut4.jpg" 
                alt="Детски кът - снимка 4" 
                style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="text-center" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src="/images/gallery/detski-kut5.jpg" 
                alt="Детски кът - снимка 5" 
                style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="row gy-4 mt-5">
          <div className="col-lg-12">
            <div className="content text-center" style={{ padding: '40px', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '24px', color: 'var(--heading-color)', marginBottom: '20px', fontFamily: 'var(--heading-font)' }}>
                Посетете ни с цялото семейство!
              </h3>
              <p style={{ fontSize: '22px', marginBottom: '30px' }}>
                Очакваме ви с вашите деца в ресторант-пицария <strong>„Централ"</strong> за незабравими семейни моменти!
              </p>
              <div>
                <a href="/reservation" className="btn btn-primary" style={{ 
                  backgroundColor: '#ce1212', 
                  color: '#fff', 
                  padding: '12px 30px', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: '0.3s'
                }}>
                  Резервирай маса
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetskiKutPage;

