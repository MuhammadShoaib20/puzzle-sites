'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent';

type ConsentChoice = 'accepted' | 'rejected' | null;

export function useCookieConsent(): ConsentChoice {
  const [consent, setConsent] = useState<ConsentChoice>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentChoice;
    setConsent(stored);
  }, []);

  return consent;
}

export function setCookieConsent(choice: 'accepted' | 'rejected' | null) {
  if (choice === null) {
    localStorage.removeItem(CONSENT_KEY);
  } else {
    localStorage.setItem(CONSENT_KEY, choice);
  }
  window.dispatchEvent(new Event('cookie-consent-change'));
}

export function openCookieBanner() {
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new Event('cookie-consent-change'));
}

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentChoice>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentChoice;
    setConsent(stored);
    setShow(!stored);
  }, []);

  useEffect(() => {
    const handleConsentChange = () => {
      const stored = localStorage.getItem(CONSENT_KEY) as ConsentChoice;
      setConsent(stored);
      setShow(!stored);
    };

    window.addEventListener('cookie-consent-change', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-change', handleConsentChange);
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    setCookieConsent('accepted');
  };

  const handleReject = () => {
    setCookieConsent('rejected');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    We use cookies and Google Analytics to improve your experience. Your data is processed by{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">MS Digital System</span>.
                    <Link
                      href="/privacy"
                      className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium hover:underline ml-1 transition-colors"
                    >
                      Learn more in our Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={handleReject}
                className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg shadow-sky-500/25"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
