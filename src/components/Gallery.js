import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css'; // Import GLightbox styles
import { useEffect } from 'react';
import Swiper from 'swiper';
import 'swiper/swiper-bundle.min.css'; // Import Swiper styles

const Gallery = () => {
  useEffect(() => {
    // Initialize Swiper
    new Swiper('.swiper', {
      loop: true,
      speed: 600,
      autoplay: {
        delay: 5000,
      },
      slidesPerView: 'auto',
      centeredSlides: true,
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      },
    });

    // Initialize GLightbox
    const lightbox = GLightbox({
      selector: '.glightbox',
    });

    return () => {
      lightbox.destroy(); // Cleanup GLightbox instance when component unmounts
    };
  }, []);

  return (
    <section id="gallery" className="gallery section light-background">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Потопете се в атмосферата на Ресторант-Пицария Централ! Разгледайте нашата галерия и усетете уюта, който създадохме за вас.</h2>
        <p>
          {/* <span>Check</span>  */}
          <span className="description-title">Галерия</span>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="swiper init-swiper">
          <div className="swiper-wrapper align-items-center">
          <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-winter.jpg">
                <img src="/images/gallery/gallery-winter.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-1.jpg">
                <img src="/images/gallery/gallery-1.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-2.jpg">
                <img src="/images/gallery/gallery-2.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-3.jpg">
                <img src="/images/gallery/gallery-3.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-4.jpg">
                <img src="/images/gallery/gallery-4.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-5.jpg">
                <img src="/images/gallery/gallery-5.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-6.jpg">
                <img src="/images/gallery/gallery-6.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-7.jpg">
                <img src="/images/gallery/gallery-7.jpg" className="img-fluid" alt="" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-8.jpg">
                <img src="/images/gallery/gallery-8.jpg" className="img-fluid" alt="" />
              </a>
            </div>
          </div>
          <div className="swiper-pagination"></div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
