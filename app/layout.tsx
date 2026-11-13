import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chess Master - Play Stockfish',
  description: 'Beautiful chess interface powered by Stockfish with adjustable difficulty (800-2800 ELO). Play chess online against a world-class engine.',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Chess Master - Play Stockfish',
    description: 'Beautiful chess interface powered by Stockfish with adjustable difficulty',
    type: 'website',
    locale: 'en_US',
    siteName: 'Chess Master',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chess Master - Play Stockfish',
    description: 'Play chess against Stockfish with adjustable difficulty',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark theme-dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
