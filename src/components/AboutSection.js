import Image from 'next/image';
// import Link from 'next/link';

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
              alt="About Us" 
              width={600} 
              height={400} 
              className="img-fluid mb-4"
            />
            <div className="book-a-table">
              <a href="/reservation"><h3>Резервирай маса</h3></a>
              <p>0895 516401 и 0893 315201</p>
            </div>
          </div>
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="250">
            <div className="content ps-0 ps-lg-5">
              <p className="fst-italic">
              Ресторант-пицария <strong>„Централ“</strong> вече 18 години е любимо място за вкусна храна и приятни моменти. Намираме се в <strong>центъра на Добрич</strong> – ул. Независимост 4, срещу Областна Управа.
              </p>
              <p>Какво ще откриете при нас?</p>
              <ul>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Автентични италиански пици</strong> – приготвени с български продукти по оригинални рецепти.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Класическа българска скара</strong> – сочни меса, приготвени с майсторство.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Уютна семейна обстановка</strong> – перфектно място за срещи с приятели и семейни вечери.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Детски кът</strong> – за да се забавляват децата, докато родителите се наслаждават на храната.</span></li>
                <li><i className="bi bi-check-circle-fill"></i> <span><strong>Любезно обслужване</strong> – с усмивка и внимание към всеки гост.</span></li>
              </ul>
              <p>
              Превърнахме гостите си в приятели и с радост ви очакваме да станете част от нашата история! 🍕
              </p>

              {/* <div className="position-relative mt-4">
                <Image 
                  src="/images/about-2.jpg" 
                  alt="About Video"
                  width={600}
                  height={400}
                  className="img-fluid"
                />
                
                <Link href="https://www.youtube.com/watch?v=Y7f98aduVJ8" passHref>
                  <div className="glightbox pulsating-play-btn" />
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
