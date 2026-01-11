import Image from 'next/image';
import Link from 'next/link';

const AboutSection = () => {
  return (
    <section id="about" className="about section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Няколко думи за нас</h2>
        <p>
          <span>Ресторант-пицария</span> <span className="description-title">Централ</span>
        </p>
      </div>
      {/* End Section Title */}

      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
            <Image 
              src="/images/terasa.jpg" 
              alt="Тераса на ресторант-пицария Централ Добрич" 
              width={800} 
              height={500} 
              className="img-fluid mb-2"
            />
          </div>
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="250">
            <div className="content ps-0 ps-lg-5" style={{ fontSize: '18px', padding: '0px!important' }}>
              <p style={{ fontSize: '20px', marginBottom: '30px', lineHeight: '1.5', fontStyle: 'italic' }}>
              Ресторант-пицария <strong>„Централ"</strong> вече 18 години е любимо място за вкусна храна и приятни моменти. Намираме се в <strong>центъра на град Добрич</strong> – ул. Независимост 4, срещу Областна Управа.
              </p>
              <p style={{ fontSize: '18px' }}>Какво ще откриете при нас?</p>
              <ul style={{ fontSize: '18px' }}>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Автентични италиански пици</strong> – приготвени с български продукти по оригинални рецепти.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Класическа българска скара</strong> – сочни меса, приготвени с майсторство.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Уютна семейна обстановка</strong> – перфектно място за срещи с приятели и семейни вечери.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong><Link href="/detski-kut" style={{ color: '#ce1212', textDecoration: 'underline' }}>Детски кът</Link></strong> – за да се забавляват децата, докато родителите се наслаждават на храната.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Любезно обслужване</strong> – с усмивка и внимание към всеки гост.</span></li>
              </ul>
              <p style={{ fontSize: '18px' }}>
              Превърнахме гостите си в приятели и с радост ви очакваме да станете част от нашата история! 🍕
              </p>
            </div>
            <div className="book-a-table" style={{ marginTop: '10px' }}>
              <Link href="/reservation"><h3>Резервирай маса</h3></Link>
              <p>0895 516401 и 0893 315201</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
