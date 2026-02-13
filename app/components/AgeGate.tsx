// app/components/AgeGate.tsx - Age verification overlay (15+)

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AgeGate() {
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const confirmed = localStorage.getItem('ageConfirmed');
    if (!confirmed) {
      setShow(true);
    }
  }, []);

  const handleEnter = () => {
    if (checked) {
      localStorage.setItem('ageConfirmed', 'true');
      setShow(false);
    }
  };

  if (!mounted || !show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl p-10 md:p-16 max-w-4xl w-full mx-4 overflow-hidden border border-black">
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/ijhana-logo-black.png"
              alt="IJHANA Logo"
              width={300}
              height={100}
              className="mx-auto"
              priority
            />
          </div>

          {/* Question */}
          <p className="text-xl md:text-2xl mb-10 text-gray-700 font-normal">
            Are you at least 15 years old?
          </p>

          {/* Checkbox */}
          <div className="flex flex-col items-center gap-8">
            <label className="flex items-center gap-4 cursor-pointer text-base md:text-lg text-gray-700 font-normal">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="w-8 h-8 md:w-10 md:h-10 accent-black cursor-pointer"
              />
              <span>Yes, I am at least 15 years of age.</span>
            </label>

            {/* Enter button */}
            <button
              onClick={handleEnter}
              disabled={!checked}
              className="px-16 py-6 text-xl md:text-2xl font-semibold transition-all shadow-xl text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 rounded-lg"
            >
              Enter Site
            </button>
          </div>

          {/* Legal text */}
          <p className="mt-12 text-sm md:text-base text-gray-600 font-normal">
            By entering this site, you accept our use of cookies and agree to our{' '}
            <Link href="/privacy" className="text-black underline hover:text-gray-700">
              Privacy Policy
            </Link>{' '}
            &{' '}
            <Link href="/terms" className="text-black underline hover:text-gray-700">
              Terms of Use
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
