import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chess Master - Play Stockfish',
  description: 'Beautiful chess interface powered by Stockfish with adjustable difficulty',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark theme-dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
