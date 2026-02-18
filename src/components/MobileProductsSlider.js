"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wraps horizontal product sliders on mobile with an always-visible custom scrollbar
 * so users see they can scroll (native scrollbar hides after scroll on mobile).
 */
export default function MobileProductsSlider({ children, scrollClassName = 'menu-mobile-products-slider', wrapperClassName }) {
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const [thumbStyle, setThumbStyle] = useState({ width: '100%', left: 0 });

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateThumb();
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    el.addEventListener('scroll', updateThumb, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateThumb);
    };
  }, [updateThumb, children]);

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

  return (
    <div className={['mobile-slider-with-scrollbar', wrapperClassName].filter(Boolean).join(' ')}>
      <div ref={scrollRef} className={scrollClassName}>
        {children}
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
