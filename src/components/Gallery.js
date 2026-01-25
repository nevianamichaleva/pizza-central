'use client';

import 'glightbox/dist/css/glightbox.min.css';
import { useEffect } from 'react';
import 'swiper/swiper-bundle.min.css';

const Gallery = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let swiperInstance;
    let lightboxInstance;

    const initInteractiveComponents = async () => {
      const [{ default: Swiper }, { default: GLightbox }] = await Promise.all([
        import('swiper'),
        import('glightbox'),
      ]);

      swiperInstance = new Swiper('.swiper', {
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

      lightboxInstance = GLightbox({
        selector: '.glightbox',
      });
    };

    initInteractiveComponents();

    return () => {
      if (swiperInstance?.destroy) {
        swiperInstance.destroy(true, true);
      }
      if (lightboxInstance?.destroy) {
        lightboxInstance.destroy();
      }
    };
  }, []);

  return (
    <section id="gallery" className="gallery section light-background">
      {/* Section Title */}
      <div className="container section-title">
        <h2>Потопете се в атмосферата на Ресторант-Пицария Централ! Разгледайте нашата галерия и усетете уюта, който създадохме за вас.</h2>
        <p>
          {/* <span>Check</span>  */}
          <span className="description-title">Галерия</span>
        </p>
      </div>

      <div className="container">
        <div className="swiper init-swiper">
          <div className="swiper-wrapper align-items-center">
          <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-winter.jpg">
                <img src="/images/gallery/gallery-winter.jpg" className="img-fluid" alt="Ресторант-пицария Централ Добрич - зимна атмосфера" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-1.jpg">
                <img src="/images/gallery/gallery-1.jpg" className="img-fluid" alt="Интериор на ресторант-пицария Централ Добрич" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-2.jpg">
                <img src="/images/gallery/gallery-2.jpg" className="img-fluid" alt="Ястия от ресторант-пицария Централ Добрич" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-3.jpg">
                <img src="/images/gallery/gallery-3.jpg" className="img-fluid" alt="Пица от ресторант-пицария Централ Добрич" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-4.jpg">
                <img src="/images/gallery/gallery-4.jpg" className="img-fluid" alt="Галерия снимки от ресторант-пицария Централ Добрич" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-5.jpg">
                <img src="/images/gallery/gallery-5.jpg" className="img-fluid" alt="Вкусни ястия от ресторант-пицария Централ Добрич" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-6.jpg">
                <img src="/images/gallery/gallery-6.jpg" className="img-fluid" alt="Ресторант-пицария Централ Добрич - галерия" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-7.jpg">
                <img src="/images/gallery/gallery-7.jpg" className="img-fluid" alt="Атмосфера в ресторант-пицария Централ Добрич" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/gallery-8.jpg">
                <img src="/images/gallery/gallery-8.jpg" className="img-fluid" alt="Ресторант-пицария Централ Добрич - снимки от галерията" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/galery-9.jpg">
                <img src="/images/gallery/galery-9.jpg" className="img-fluid" alt="Ресторант-пицария Централ Добрич - снимки от галерията" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/galery-10.jpg">
                <img src="/images/gallery/galery-10.jpg" className="img-fluid" alt="Ресторант-пицария Централ Добрич - снимки от галерията" />
              </a>
            </div>
            <div className="swiper-slide">
              <a className="glightbox" data-gallery="images-gallery" href="/images/gallery/galery-11.jpg">
                <img src="/images/gallery/galery-11.jpg" className="img-fluid" alt="Ресторант-пицария Централ Добрич - снимки от галерията" />
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
