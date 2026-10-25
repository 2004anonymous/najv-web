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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
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
  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
    <Link
      href="/alumni"
      className="text-brand-emerald font-semibold hover:text-white transition-colors"
    >
      Alumni
    </Link>
  

    <span className="text-slate-600">·</span>

    <span>
      Designed &amp; Developed by{" "}
      <strong className="text-brand-emerald"> <a href="https://www.instagram.com/__rahul.gogoi/" target="_blank" rel="noopener noreferrer">Rahul Gogoi</a> </strong>
    </span>
  </div>

  {/* Developer social links */}
  {/* <div className="mt-4 flex items-center justify-center gap-5">
    <a
      href="https://www.instagram.com/YOUR_INSTAGRAM_USERNAME/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Developer Instagram"
      className="text-slate-500 hover:text-pink-400 transition-colors"
    >
      <i className="fa-brands fa-instagram text-base" />
      <span className="ml-1.5">Instagram</span>
    </a>

    <a
      href="https://www.facebook.com/YOUR_FACEBOOK_USERNAME"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Developer Facebook"
      className="text-slate-500 hover:text-blue-400 transition-colors"
    >
      <i className="fa-brands fa-facebook text-base" />
      <span className="ml-1.5">Facebook</span>
    </a>

    <a
      href="https://github.com/YOUR_GITHUB_USERNAME"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Developer GitHub"
      className="text-slate-500 hover:text-white transition-colors"
    >
      <i className="fa-brands fa-github text-base" />
      <span className="ml-1.5">GitHub</span>
    </a>
  </div> */}

  {/* Discreet admin access */}
  <div className="mt-4">
    <Link
      href="/admin/login"
      className="inline-flex items-center gap-2 rounded-full border border-dark-border px-3 py-1.5 text-[11px] text-slate-500 transition-all hover:border-brand-emerald/30 hover:text-brand-emerald"
    >
      <i className="fa-solid fa-shield-halved" />
      Admin Login
    </Link>
  </div>

  <p className="mt-4 text-[11px] text-slate-500">
    &copy; 2026 Nilmoni Adarsha Jatiya Vidyalaya. All Rights Reserved.
  </p>
</footer>

        {/* <footer className="border-t border-dark-border bg-dark-bg/90 relative z-10 mt-12 py-10 text-center text-xs text-slate-400">
          <Link href="/alumni" className="text-brand-emerald font-semibold">Alumni</Link> · Designed &amp; Developed by{' '}
          <strong className="text-brand-emerald">Rahul Gogoi</strong>
          <p className="mt-4 text-[11px] text-slate-500">&copy; 2026 Nilmoni Adarsha Jatiya Vidyalaya. All Rights Reserved.</p>
        </footer> */}
      </body>
    </html>
  );
}