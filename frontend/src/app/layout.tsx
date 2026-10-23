import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'FoodLoop AI — Track. Understand. Share.',
  description: 'An open-source full-stack platform for food waste reduction, AI nutrition label analysis, and surplus food donation logistics.',
  keywords: ['food waste', 'surplus donation', 'food safety', 'ocr', 'nutrition ai', 'ngo hunger relief'],
  authors: [{ name: 'FoodLoop AI Contributors' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
