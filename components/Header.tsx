'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const items: [label: string, href: string, icon?: string][] = [
  ['Home', '/', 'fa-house'],
  ['About', '/#about'],
  ['Academics', '/#academics'],
  ['Notices', '/#notices'],
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-dark-bg/85 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ${
        scrolled ? 'shadow-lg shadow-black/30' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* School Logo and Name */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group cursor-pointer select-none"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
                      <Image
          src="/logo.png"
          alt="নীলমণি আদৰ্শ জাতীয় বিদ্যালয়"
          width={44}
          height={44}
          priority
          className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 ease-out group-hover:scale-105"
        />
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="font-heading font-bold text-base sm:text-lg text-white tracking-tight leading-tight group-hover:text-brand-glow transition-colors duration-200">
                নীলমণি আদৰ্শ জাতীয় বিদ্যালয়
              </h1>

              <p className="text-xs text-slate-400 font-light">
                Nilmoni Adarsha Jatiya Vidyalaya
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-2 lg:gap-3"
            aria-label="Main"
          >
            <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md">
              {items.map(([label, href]) => {
                const on = href === '/' && path === '/';

                return (
                  <Link
                    key={label}
                    href={href}
                    aria-current={on ? 'page' : undefined}
                    className={`rounded-full px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-glow ${
                      on
                        ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Alumni Button */}
            <Link
              href="/alumni"
              aria-current={path === '/alumni' ? 'page' : undefined}
              className={`group inline-flex items-center gap-2 rounded-full px-4 lg:px-5 py-2 text-xs lg:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-emerald transition-all duration-300 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-glow ${
                path === '/alumni'
                  ? 'shadow-lg shadow-brand-emerald/30 ring-1 ring-white/25'
                  : 'opacity-90 hover:opacity-100 hover:-translate-y-px hover:shadow-lg hover:shadow-brand-emerald/25'
              }`}
            >
              <i className="fa-solid fa-user-graduate text-xs" />
              Alumni Network
              <i className="fa-solid fa-arrow-right text-[10px] transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </nav>

          {/* Desktop Contact */}
          <div className="hidden sm:flex items-center space-x-3">
            <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <i className="fa-solid fa-code text-brand-emerald mr-1" /> Rahul
              Gogoi
            </span>

            <Link
              href="/#contact"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-emerald hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition active:scale-95"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2.5 w-10 h-10 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
            aria-expanded={open}
          >
            <i
              className={`fa-solid ${
                open ? 'fa-xmark' : 'fa-bars-staggered'
              } text-lg`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden bg-dark-card/95 backdrop-blur-xl transition-all duration-300 ${
          open
            ? 'max-h-[28rem] border-b border-dark-border'
            : 'max-h-0'
        }`}
      >
        <div className="px-4 py-5 space-y-2">
          {items.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              {label}
            </Link>
          ))}

          <Link
            href="/alumni"
            className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-glow bg-brand-500/10 border border-brand-500/20"
          >
            <i className="fa-solid fa-user-graduate mr-2 text-brand-emerald" />
            Alumni Portal
          </Link>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Dev: Rahul Gogoi
            </span>

            <Link
              href="/#contact"
              className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-xl text-xs"
            >
              Contact Desk
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}