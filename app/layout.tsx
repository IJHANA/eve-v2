// app/layout.tsx - Root layout for Eve v2

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Eve - Your Lifetime AI Companion | IJHANA',
  description: 'The first truly inheritable AI companion. Build a relationship that grows deeper over time and can be passed to future generations.',
  keywords: ['AI companion', 'digital legacy', 'personal AI', 'inheritable AI', 'lifetime companion'],
  authors: [{ name: 'IJHANA' }],
  openGraph: {
    title: 'Eve - Your Lifetime AI Companion',
    description: 'Build a relationship with AI that outlives you. Leave your wisdom to those you love.',
    url: 'https://www.ijhana.com',
    siteName: 'IJHANA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eve - Your Lifetime AI Companion',
    description: 'The first inheritable AI. Your wisdom, your legacy, your Eve.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased bg-white text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
