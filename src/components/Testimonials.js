'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import 'swiper/swiper-bundle.min.css';

const Testimonials = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let swiperInstance;

    const initSwiper = async () => {
      const { default: Swiper } = await import('swiper');

      swiperInstance = new Swiper('.swiper-container', {
        loop: true,
        speed: 600,
        autoplay: {
          delay: 5000,
        },
        slidesPerView: 'auto',
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
        },
      });
    };

    initSwiper();

    return () => {
      if (swiperInstance?.destroy) {
        swiperInstance.destroy(true, true);
      }
    };
  }, []);

  return (
    <section id="testimonials" className="testimonials section light-background">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>TESTIMONIALS</h2>
        <p>What Are They <span className="description-title">Saying About Us</span></p>
      </div>
      {/* End Section Title */}

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="swiper-container">
          <div className="swiper-wrapper">
            {/* Testimonial 1 */}
            <div className="swiper-slide">
              <div className="testimonial-item">
                <div className="row gy-4 justify-content-center">
                  <div className="col-lg-6">
                    <div className="testimonial-content">
                      <p>
                        <i className="bi bi-quote quote-icon-left"></i>
                        <span>
                          Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus.
                          Accusantium quam, ultricies eget id, aliquam eget nibh et. Maecen aliquam, risus at semper.
                        </span>
                        <i className="bi bi-quote quote-icon-right"></i>
                      </p>
                      <h3>Saul Goodman</h3>
                      <h4>CEO &amp; Founder</h4>
                      <div className="stars">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 text-center">
                    <Image
                      src="/images/testimonials/testimonials-1.jpg"
                      alt="Saul Goodman"
                      className="img-fluid testimonial-img"
                      width={150}
                      height={150}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End Testimonial 1 */}

            {/* Testimonial 2 */}
            <div className="swiper-slide">
              <div className="testimonial-item">
                <div className="row gy-4 justify-content-center">
                  <div className="col-lg-6">
                    <div className="testimonial-content">
                      <p>
                        <i className="bi bi-quote quote-icon-left"></i>
                        <span>
                          Export tempor illum tamen malis malis eram quae irure esse labore quem cillum quid cillum
                          eram malis quorum velit fore eram velit sunt aliqua noster fugiat irure amet legam anim
                          culpa.
                        </span>
                        <i className="bi bi-quote quote-icon-right"></i>
                      </p>
                      <h3>Sara Wilsson</h3>
                      <h4>Designer</h4>
                      <div className="stars">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 text-center">
                    <Image
                      src="/images/testimonials/testimonials-2.jpg"
                      alt="Sara Wilsson"
                      className="img-fluid testimonial-img"
                      width={150}
                      height={150}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End Testimonial 2 */}

            {/* Testimonial 3 */}
            <div className="swiper-slide">
              <div className="testimonial-item">
                <div className="row gy-4 justify-content-center">
                  <div className="col-lg-6">
                    <div className="testimonial-content">
                      <p>
                        <i className="bi bi-quote quote-icon-left"></i>
                        <span>
                          Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam
                          duis minim tempor labore quem eram duis noster aute amet eram fore quis sint minim.
                        </span>
                        <i className="bi bi-quote quote-icon-right"></i>
                      </p>
                      <h3>Jena Karlis</h3>
                      <h4>Store Owner</h4>
                      <div className="stars">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 text-center">
                    <Image
                      src="/images/testimonials/testimonials-3.jpg"
                      alt="Jena Karlis"
                      className="img-fluid testimonial-img"
                      width={150}
                      height={150}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End Testimonial 3 */}

            {/* Testimonial 4 */}
            <div className="swiper-slide">
              <div className="testimonial-item">
                <div className="row gy-4 justify-content-center">
                  <div className="col-lg-6">
                    <div className="testimonial-content">
                      <p>
                        <i className="bi bi-quote quote-icon-left"></i>
                        <span>
                          Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos export minim fugiat
                          minim velit minim dolor enim duis veniam ipsum anim magna sunt elit fore quem dolore labore
                          illum veniam.
                        </span>
                        <i className="bi bi-quote quote-icon-right"></i>
                      </p>
                      <h3>John Larson</h3>
                      <h4>Entrepreneur</h4>
                      <div className="stars">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 text-center">
                    <Image
                      src="/images/testimonials/testimonials-4.jpg"
                      alt="John Larson"
                      className="img-fluid testimonial-img"
                      width={150}
                      height={150}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End Testimonial 4 */}
          </div>
          {/* Swiper Pagination */}
          <div className="swiper-pagination"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
