'use client';

import { useEffect, useRef, useState } from 'react';

export default function HomeScrollControls() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const scrollFrame = useRef(0);

  useEffect(() => {
    const updatePosition = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setAtTop(scrollTop <= 2);
      setAtBottom(maxScroll <= 2 || scrollTop >= maxScroll - 2);
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  const scrollPage = (direction: -1 | 1) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target =
      direction === -1
        ? 0
        : Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

    if (reduceMotion) {
      window.scrollTo({ top: target, behavior: 'instant' });
      return;
    }

    const start = window.scrollY;
    const distance = target - start;
    if (Math.abs(distance) < 2) return;

    // Slow, gradual eased scroll — duration scales with distance
    const duration = Math.min(3200, Math.max(900, Math.abs(distance) * 1.1));
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
      scrollFrame.current = progress < 1 ? requestAnimationFrame(step) : 0;
    };

    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(step);
  };

  return (
    <div className="home-scroll-controls" aria-label="Page scroll controls">
      <button
        type="button"
        className="home-scroll-button"
        aria-label="Scroll up"
        onClick={() => scrollPage(-1)}
        disabled={atTop}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 14 6-6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        className="home-scroll-button"
        aria-label="Scroll down"
        onClick={() => scrollPage(1)}
        disabled={atBottom}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 10 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
