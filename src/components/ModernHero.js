import Image from 'next/image';

const ModernHero = () => {
    return (
        <section id="hero" className="hero section light-background hero-with-love">
            {/* <FloatingHearts /> */}
            <div className="container">
                <div className="row gy-4 align-items-center justify-content-center justify-content-lg-between">

                    {/* Left Content */}
                    <div className="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center">
                        <p className="hero-kicker editorial-kicker" data-aos="fade-up">
                            Добрич · ул. „Независимост“ 4
                        </p>
                        <div className="editorial-rule hero-editorial-rule" data-aos="fade-up" data-aos-delay="50" aria-hidden="true" />

                        <h1 data-aos="fade-up" data-aos-delay="80" className="hero-title">
                            Вкус, който остава
                            <span className="hero-brand"
                                data-aos="fade-up"
                                data-aos-delay="150">
                                Ресторант-пицария Централ
                            </span>
                        </h1>

                        <p
                            className="hero-lead editorial-lead"
                            data-aos="fade-up"
                            data-aos-delay="120"
                        >
                            Съчетаваме италианските традиции с българските продукти — вкус, който усещаш още с първата хапка.
                        </p>

                        {/* <p
                            className="hero-subtitle"
                            data-aos="fade-up"
                            data-aos-delay="160"
                        >
                            Авторска кухня, подбрани продукти
                            и уютна атмосфера в сърцето на града{' '}
                            <span className="hero-heart" aria-hidden="true" title="С любов">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="heart-pulse">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </span>
                        </p> */}

                        <div
                            className="d-flex flex-wrap hero-actions"
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            <a
                                href="/reservation"
                                className="btn-primary-hero"
                                aria-label="Резервирай маса в ресторанта"
                            >
                                Резервирай с отстъпка
                            </a>

                            <a
                                href="/for-home"
                                className="btn-secondary-hero"
                                aria-label="Поръчай за вкъщи"
                            >
                                Поръчай за вкъщи
                            </a>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div
                        className="col-lg-5 order-1 order-lg-2 hero-img"
                        data-aos="zoom-out"
                    >
                        <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '1', margin: '0 auto', borderRadius: '50%', overflow: 'hidden' }}>
                            <Image
                                src="/images/dinner-3.jpg"
                                alt="Цвински кралски котлет от ресторант Централ Добрич"
                                width={500}
                                height={500}
                                //className="img-fluid animated"
                                className="img-fluid"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                priority
                            />
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
        .hero-with-love {
          position: relative;
          background: linear-gradient(168deg, #f8f6f3 0%, #fdfcfb 42%, #ffffff 100%);
        }
        .hero-with-love .container {
          position: relative;
          z-index: 1;
        }
        .hero-kicker {
          margin-top: 0;
          font-size: 1.3rem !important;
        }
        .hero-editorial-rule {
          margin-top: 0;
        }
        .hero-valentine-overlay {
          display: block;
          margin-top: 10px;
          font-family: 'Dancing Script', cursive;
          font-size: clamp(2.75rem, 8vw, 4.25rem) !important;
          font-weight: 600;
          color: #d41317 !important;
          letter-spacing: 0.02em;
          line-height: 1.2;
          user-select: none;
        }
        .hero-heart {
          display: inline-flex;
          align-items: center;
          vertical-align: middle;
          color: #d41317;
          margin-left: 2px;
          animation: heartPulse 1.4s ease-in-out infinite;
        }
        .hero-heart .heart-pulse {
          width: 18px;
          height: 18px;
          filter: drop-shadow(0 0 4px rgba(212, 19, 23, 0.3));
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        .hero-title {
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .hero-title span {
            display: block;
            font-size: 0.55em;
            font-weight: 500;
            margin-top: 12px;
            color: #666;
            }

        .hero-lead {
          margin-bottom: 14px;
        }
        .hero-subtitle {
          font-size: 1.05rem;
          color: #555;
          max-width: 460px;
          margin-bottom: 12px;
        }

        .hero-brand {
          display: block;
          font-size: 0.9rem;
          color: #999;
          margin-bottom: 28px;
        }

        .hero-actions {
          gap: 16px;
          margin-bottom: 20px;
        }

        .btn-primary-hero {
          background: #d41317;
          color: #fff;
          padding: 12px 26px;
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary-hero:hover {
          background: #b50f13;
          box-shadow: 0 10px 30px rgba(212, 19, 23, 0.35);
          transform: translateY(-1px);
        }

        .btn-secondary-hero {
          border: 1px solid #d41317;
          color: #d41317;
          padding: 12px 26px;
          border-radius: 30px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-secondary-hero:hover {
          background: #d41317;
          color: #fff;
        }

        .hero-trust {
          font-size: 0.85rem;
          color: #777;
        }

        .hero-image-wrapper {
          position: relative;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 1;
          margin: 0 auto;
          border-radius: 50%;
          overflow: hidden;
          box-shadow:
            0 25px 50px rgba(0, 0, 0, 0.2),
            0 15px 35px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset,
            inset 0 -25px 50px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transform: perspective(800px) rotateY(-2deg) rotateX(2deg);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .hero-image-wrapper:hover {
          transform: perspective(800px) rotateY(0) rotateX(0) scale(1.02);
          box-shadow:
            0 35px 70px rgba(0, 0, 0, 0.25),
            0 20px 40px rgba(0, 0, 0, 0.18),
            0 0 0 1px rgba(255, 255, 255, 0.12) inset,
            inset 0 -30px 55px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .hero-image-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0) 40%,
            rgba(0, 0, 0, 0.35) 100%
          );
          pointer-events: none;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1.25);
          transition: transform 6s ease;
        }

        .hero-image-wrapper:hover .hero-image {
          transform: scale(1.3);
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 0 !important;
            padding-bottom: 40px !important;
          }

          .hero-title {
            text-align: center;
          }

          .hero-kicker {
            text-align: center;
          }

          .hero-editorial-rule {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-lead {
            margin-left: auto;
            margin-right: auto;
            text-align: center;
          }

          .hero-subtitle,
          .hero-brand,
          .hero-trust {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }
        }
      `}</style>
        </section>
    );
};

export default ModernHero;