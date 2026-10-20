'use client';

import dynamic from 'next/dynamic';

const HomeScrollControls = dynamic(
  () => import('@/components/HomeScrollControls'),
  { ssr: false }
);

export default function HomeScrollControlsLoader() {
  return <HomeScrollControls />;
}
