import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Particles from '@/components/Particles';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'Nilmoni Adarsha Jatiya Vidyalaya',
  description: 'Official website, notices and alumni network',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jakarta.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="flex flex-col min-h-screen selection:bg-brand-500 selection:text-white">
        <Particles />
        <ToastProvider>
          <Header />
          <main className="flex-grow pt-20">{children}</main>
        </ToastProvider>
        <footer className="border-t border-dark-border bg-dark-bg/90 relative z-10 mt-12 py-10 text-center text-xs text-slate-400">
          <Link href="/alumni" className="text-brand-emerald font-semibold">Alumni</Link> · Designed &amp; Developed by{' '}
          <strong className="text-brand-emerald">Rahul Gogoi</strong>
          <p className="mt-4 text-[11px] text-slate-500">&copy; 2026 Nilmoni Adarsha Jatiya Vidyalaya. All Rights Reserved.</p>
        </footer>
      </body>
    </html>
  );
}