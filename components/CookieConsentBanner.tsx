'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent';

type ConsentChoice = 'accepted' | 'rejected' | null;

function getConsentSnapshot(): ConsentChoice {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(CONSENT_KEY);
  return stored === 'accepted' || stored === 'rejected' ? stored : null;
}

function subscribeToConsent(onChange: () => void) {
  window.addEventListener('cookie-consent-change', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('cookie-consent-change', onChange);
    window.removeEventListener('storage', onChange);
  };
}

function subscribeToHydration() {
  return () => {};
}

function getHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export function useCookieConsent(): ConsentChoice {
  return useSyncExternalStore(subscribeToConsent, getConsentSnapshot, () => null);
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
  const hasMounted = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const consent = useCookieConsent();
  if (!hasMounted || consent !== null) return null;

  const handleAccept = () => {
    setCookieConsent('accepted');
  };

  const handleReject = () => {
    setCookieConsent('rejected');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    We use cookies and Google Analytics to improve your experience. Your data is processed by{' '}
                    <span className="font-semibold text-gray-900">MS Digital System</span>.
                    <Link
                      href="/privacy"
                      className="text-sky-700 hover:text-sky-800 font-medium hover:underline ml-1 transition-colors"
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
                className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-800 hover:to-indigo-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg shadow-sky-500/25"
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
