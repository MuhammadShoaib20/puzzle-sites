'use client';

/* eslint-disable @next/next/no-img-element -- YouTube thumbnails load directly from i.ytimg.com */
import { useEffect, useState } from 'react';

interface LazyYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
  playerId?: string;
}

export default function LazyYouTube({
  videoId,
  title,
  className = '',
  playerId,
}: LazyYouTubeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [seekVersion, setSeekVersion] = useState(0);

  useEffect(() => {
    const handleSeek = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail = event.detail as { videoId?: unknown; seconds?: unknown } | null;
      if (
        detail?.videoId !== videoId ||
        typeof detail.seconds !== 'number' ||
        !Number.isInteger(detail.seconds) ||
        detail.seconds < 0
      ) {
        return;
      }

      setStartAt(detail.seconds);
      setSeekVersion((version) => version + 1);
      setIsLoaded(true);
    };

    window.addEventListener('level-video-seek', handleSeek);
    return () => window.removeEventListener('level-video-seek', handleSeek);
  }, [videoId]);

  return (
    <div id={playerId} className={`w-full h-full ${className}`}>
      {isLoaded ? (
        <iframe
          key={`${videoId}-${startAt ?? 'default'}-${seekVersion}`}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1${startAt === null ? '' : `&start=${startAt}`}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      ) : (
        <button
          type="button"
          className="relative w-full h-full cursor-pointer group"
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
      )}
    </div>
  );
}
