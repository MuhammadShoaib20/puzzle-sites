'use client';

import { useEffect } from 'react';

const ADSENSE_SCRIPT_URL =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2631095859749439';
const ADSENSE_SCRIPT_ID = 'google-adsense-loader';

export default function DelayedAdSense() {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

      const script = document.createElement('script');
      script.id = ADSENSE_SCRIPT_ID;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = ADSENSE_SCRIPT_URL;
      document.head.appendChild(script);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
