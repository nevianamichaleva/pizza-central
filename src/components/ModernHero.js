'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const HERO_SLIDES = [
  {
    id: 'home',
    kicker: 'Добрич · ул. „Независимост“ 4',
    title: 'Вкус, който остава',
    brand: 'Ресторант-пицария Централ',
    lead: 'Съчетаваме италианските традиции с българските продукти - вкус, който усещаш още с първата хапка.',
    image: '/images/osnovno1.jpg',
    aspectRatio: '1024 / 678',
    imageAlt: 'Основно ястие от ресторант Централ Добрич',
    primaryCta: {
      href: '/reservation',
      label: 'Резервирай с отстъпка',
      ariaLabel: 'Резервирай маса в ресторанта',
    },
    secondaryCta: {
      href: '/for-home',
      label: 'Поръчай за вкъщи',
      ariaLabel: 'Поръчай за вкъщи',
    },
  },
  {
    id: 'pizza-3x1',
    kicker: 'Нова оферта · за вкъщи и доставка',
    title: 'Пица Централ 3х1',
    brand: 'Три вкуса в една XL или XXL пица',
    lead: 'Комбинирай до три любими вкуса в една голяма пица. Идеална за компания — или когато не можеш да избереш само една.',
    image: '/images/pizza-central-3x1.jpg',
    aspectRatio: '1024 / 825',
    imageAlt: 'Пица Централ 3х1 – три вкуса в една XXL пица',
    primaryCta: {
      href: '/products/pizza-central',
      label: 'Поръчай 3х1',
      ariaLabel: 'Поръчай Пица Централ 3х1 за вкъщи',
    },
    secondaryCta: {
      href: '/blog/pizza-central-3x1',
      label: 'Виж повече',
      ariaLabel: 'Прочети повече за Пица Централ 3х1',
    },
  },
];

const AUTO_MS = 3000;

const ModernHero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);
  const slideCount = HERO_SLIDES.length;

  useEffect(() => {
    if (slideCount <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [slideCount, activeIndex]);

  const goTo = (index) => {
    setActiveIndex(index);
  };

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current == null || slideCount <= 1) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    } else {
      setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
    }
  };

  return (
    <section id="hero" className="hero section light-background hero-with-love">
      <div className="container">
        <div
          className="hero-slider"
          aria-roledescription="carousel"
          aria-label="Начални банери"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="hero-viewport">
            <div
              className="hero-track"
              style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
            >
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={slide.id}
                    className="hero-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} от ${slideCount}`}
                    aria-hidden={!isActive}
                  >
                    <div className="row gy-4 align-items-center justify-content-center justify-content-lg-between">
                      <div className="col-lg-5 order-2 order-lg-1 d-flex flex-column justify-content-center">
                        <p className="hero-kicker editorial-kicker">{slide.kicker}</p>
                        <div className="editorial-rule hero-editorial-rule" aria-hidden="true" />

                        <h1 className="hero-title">
                          {slide.title}
                          <span className="hero-brand">{slide.brand}</span>
                        </h1>

                        <p className="hero-lead editorial-lead">{slide.lead}</p>

                        <div className="d-flex flex-wrap hero-actions">
                          <a
                            href={slide.primaryCta.href}
                            className="btn-primary-hero"
                            aria-label={slide.primaryCta.ariaLabel}
                            tabIndex={isActive ? 0 : -1}
                          >
                            {slide.primaryCta.label}
                          </a>
                          <a
                            href={slide.secondaryCta.href}
                            className="btn-secondary-hero"
                            aria-label={slide.secondaryCta.ariaLabel}
                            tabIndex={isActive ? 0 : -1}
                          >
                            {slide.secondaryCta.label}
                          </a>
                        </div>
                      </div>

                      <div className="col-lg-6 order-1 order-lg-2 hero-img">
                        <div
                          className="hero-photo-frame"
                          style={{ aspectRatio: slide.aspectRatio }}
                        >
                          <Image
                            src={slide.image}
                            alt={slide.imageAlt}
                            fill
                            sizes="(max-width: 991px) 100vw, 620px"
                            className="hero-photo"
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center',
                            }}
                            priority={index === 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {slideCount > 1 && (
            <div className="hero-dots" role="tablist" aria-label="Слайдове">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  className={`hero-dot${index === activeIndex ? ' is-active' : ''}`}
                  aria-label={`Покажи слайд ${index + 1}`}
                  aria-selected={index === activeIndex}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          )}
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
        .hero-slider {
          position: relative;
        }
        .hero-viewport {
          overflow: hidden;
          width: 100%;
        }
        .hero-track {
          display: flex;
          width: 100%;
          transition: transform 0.65s cubic-bezier(0.22, 0.61, 0.36, 1);
          will-change: transform;
        }
        .hero-slide {
          flex: 0 0 100%;
          width: 100%;
          min-width: 100%;
        }
        .hero-kicker {
          margin-top: 0;
          font-size: 1.3rem !important;
        }
        .hero-editorial-rule {
          margin-top: 0;
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
        .hero-photo-frame {
          position: relative;
          width: 100%;
          max-width: 620px;
          margin: 0 auto;
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 20px 45px rgba(0, 0, 0, 0.18),
            0 8px 20px rgba(0, 0, 0, 0.1);
        }
        .hero-photo {
          display: block;
        }
        .hero-img {
          min-height: 0;
        }
        .hero-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        .hero-dot {
          width: 10px;
          height: 10px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: #d41317;
          opacity: 0.35;
          cursor: pointer;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .hero-dot.is-active {
          opacity: 1;
          transform: scale(1.15);
        }
        .hero-dot:hover {
          opacity: 0.7;
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
          .hero-brand {
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
