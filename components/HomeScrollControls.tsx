'use client';

import { useEffect, useState } from 'react';

export default function HomeScrollControls() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

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
    };
  }, []);

  const scrollPage = (direction: -1 | 1) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({
      top: direction * Math.max(window.innerHeight * 0.8, 320),
      behavior: reduceMotion ? 'instant' : 'smooth',
    });
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
