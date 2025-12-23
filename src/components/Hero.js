import Image from 'next/image';

const Hero = () => {
  return (
    <section id="hero" className="hero section light-background">
      <div className="container">
        <div className="row gy-4 justify-content-center justify-content-lg-between">
          {/* Left Content */}
          <div className="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center">
            <h1 data-aos="fade-up">
              Ресторант-пицария Централ Добрич!
            </h1>
            <p data-aos="fade-up" data-aos-delay="100">
            Храна, приготвена с внимание и поднесена с отношение.
            </p>
            <div className="d-flex" data-aos="fade-up" data-aos-delay="200">
              <a href="#book-a-table" className="btn-get-started">
                Резервирай маса
              </a>
              <a href="/our-menu" className="btn-get-started" style={{marginLeft: "20px"}}>
                Поръчай
              </a>
              {/* <a
                href="https://www.youtube.com/watch?v=Y7f98aduVJ8"
                className="glightbox btn-watch-video d-flex align-items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-play-circle"></i>
                <span>Watch Video</span>
              </a> */}
            </div>
          </div>

          {/* Hero Image */}
          <div
            className="col-lg-5 order-1 order-lg-2 hero-img"
            data-aos="zoom-out"
          >
            <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '1', margin: '0 auto', borderRadius: '50%', overflow: 'hidden' }}>
              <Image
                src="/images/gallery/gallery-winter.jpg"
                alt="Вкусни ястия от ресторант-пицария Централ Добрич"
                width={500}
                height={500}
                className="img-fluid animated"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
