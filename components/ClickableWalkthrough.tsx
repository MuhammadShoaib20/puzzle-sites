'use client';

import type { MouseEvent } from 'react';

type Props = {
  html: string;
  videoId: string;
};

export default function ClickableWalkthrough({ html, videoId }: Props) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const timestamp = target.closest<HTMLAnchorElement>('a[data-video-time]');
    if (!timestamp || !event.currentTarget.contains(timestamp)) return;

    const seconds = Number(timestamp.dataset.videoTime);
    if (!Number.isInteger(seconds) || seconds < 0) return;

    event.preventDefault();
    document.getElementById('level-video-player')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    window.dispatchEvent(
      new CustomEvent('level-video-seek', { detail: { videoId, seconds } })
    );
  }

  return (
    <div
      className="prose level-content-body max-w-none text-sm sm:text-base leading-relaxed"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
