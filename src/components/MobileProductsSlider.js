"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const SCROLL_STEP = 0.75; // fraction of visible width to scroll per click

/**
 * Wraps horizontal product sliders on mobile with an always-visible custom scrollbar
 * and left/right arrows so users see they can scroll.
 */
export default function MobileProductsSlider({ children, scrollClassName = 'menu-mobile-products-slider', wrapperClassName }) {
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const didPosition = useRef(false);
  const [thumbStyle, setThumbStyle] = useState({ width: '100%', left: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const revealNeighbors = useCallback(() => {
    const el = scrollRef.current;
    if (!el || didPosition.current) return;
    const cards = el.children;
    if (cards.length < 2) return;
    const target = cards.length >= 3 ? cards[1] : cards[0];
    const sliderRect = el.getBoundingClientRect();
    const cardRect = target.getBoundingClientRect();
    if (cardRect.width < 20 || sliderRect.width < 20) return;
    const delta = cardRect.left - sliderRect.left - (el.clientWidth - cardRect.width) / 2;
    const previousBehavior = el.style.scrollBehavior;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = Math.max(0, delta);
    el.style.scrollBehavior = previousBehavior;
    didPosition.current = true;
  }, []);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(maxScroll > 2 && scrollLeft < maxScroll - 2);
    if (maxScroll <= 0) {
      setThumbStyle({ width: '100%', left: 0 });
      return;
    }
    const trackWidth = track.offsetWidth;
    const thumbWidthPx = Math.max(24, (clientWidth / scrollWidth) * trackWidth);
    const thumbWidthPercent = (thumbWidthPx / trackWidth) * 100;
    const leftPercent = (scrollLeft / maxScroll) * (100 - thumbWidthPercent);
    setThumbStyle({ width: `${thumbWidthPercent}%`, left: `${leftPercent}%` });
  }, []);

  useLayoutEffect(() => {
    revealNeighbors();
    updateThumb();
  }, [children, revealNeighbors, updateThumb]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onResize = () => {
      revealNeighbors();
      updateThumb();
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    el.addEventListener('scroll', updateThumb, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateThumb);
    };
  }, [updateThumb, revealNeighbors, children]);

  const handleTrackClick = (e) => {
    const track = trackRef.current;
    const el = scrollRef.current;
    if (!track || !el) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frac = x / rect.width;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: frac * maxScroll, behavior: 'smooth' });
  };

  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * SCROLL_STEP;
    const newLeft = el.scrollLeft + (direction === 'left' ? -step : step);
    el.scrollTo({ left: Math.max(0, newLeft), behavior: 'smooth' });
  };

  return (
    <div className={['mobile-slider-with-scrollbar', wrapperClassName].filter(Boolean).join(' ')}>
      <div className="mobile-slider-arrows-wrapper">
        <div ref={scrollRef} className={scrollClassName}>
          {children}
        </div>
        <button
          type="button"
          className="mobile-slider-arrow mobile-slider-arrow-left"
          onClick={() => scrollBy('left')}
          disabled={!canScrollLeft}
          aria-label="Превърни наляво"
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          className="mobile-slider-arrow mobile-slider-arrow-right"
          onClick={() => scrollBy('right')}
          disabled={!canScrollRight}
          aria-label="Превърни надясно"
        >
          <span aria-hidden>›</span>
        </button>
      </div>
      <div
        ref={trackRef}
        className="custom-scrollbar-track"
        onClick={handleTrackClick}
        role="scrollbar"
        aria-label="Превъртане на продукти"
      >
        <div
          className="custom-scrollbar-thumb"
          style={{ width: thumbStyle.width, left: thumbStyle.left }}
        />
      </div>
    </div>
  );
}
