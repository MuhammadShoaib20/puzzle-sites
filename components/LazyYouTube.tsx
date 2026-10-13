'use client';

import { useState } from 'react';

interface LazyYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
}

export default function LazyYouTube({ videoId, title, className = '' }: LazyYouTubeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className={className}
      />
    );
  }

  return (
    <button
      type="button"
      className={`relative w-full aspect-video cursor-pointer group ${className}`}
      onClick={() => setIsLoaded(true)}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
        fetchPriority="low"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
          <svg
            className="relative w-16 h-16 text-white fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
