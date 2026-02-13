// app/components/CookieBanner.tsx - Cookie consent banner

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after 1 second delay
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  if (!mounted || !show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto z-50 max-w-md animate-fade-in">
      <div className="bg-white border border-gray-300 rounded-xl shadow-2xl p-6 text-sm">
        <p className="text-gray-800 mb-4">
          We use essential cookies for login, sessions, and basic functionality. 
          Non-essential cookies help improve your experience. By continuing, you agree to our{' '}
          <Link href="/privacy" className="text-black underline hover:text-gray-700">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
          >
            Only Essentials
          </button>
        </div>
      </div>
    </div>
  );
}
