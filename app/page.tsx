'use client';
// app/page.tsx — Index (home) page: hero with auto-sliding images + About, Academics, Notices, Contact.
// Needs: Tailwind config + globals.css from the project (glass-card, animate-fade-up, animate-kenburns,
// animate-slide-in, animate-float) and Font Awesome loaded in layout.tsx.
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import SchoolNotices from "@/components/SchoolNotices";
import Image from 'next/image';

/* ---------- Edit your content here ---------- */
const SITE = { phone: '+918638133781', email: 'najvalumni25@gmail.com' };
const SLIDES = [
  { src: '/slides/1.jpeg', title: 'Nurturing Bright Minds', sub: 'A caring place to learn and grow' },
  { src: '/slides/2.jpeg', title: 'Silver Jubilee · 25 Years', sub: '2001 – 2026 of academic excellence' },
  { src: '/slides/3.jpeg', title: 'Learning Beyond Books', sub: 'Culture, sports and creativity' },
  { src: '/slides/4.jpeg', title: 'Our Proud Alumni', sub: 'Reconnect with former classmates' },
];
const STATS = [['100%', 'Dedication'], ['SEBA', 'Curriculum'], ['Holistic', 'Growth']];
const WINGS = [
  ['01', 'Primary Wing', 'Ankur & Primary Classes', 'Activity-based learning designed to foster curiosity, basic literacy, and social skills.', 'bg-brand-500/10 text-brand-glow'],
  ['02', 'Middle School', 'Classes VI – VIII', 'Conceptual clarity in Science, Mathematics, Languages, and basic IT skills.', 'bg-brand-emerald/10 text-brand-emerald'],
  ['03', 'High School', 'Classes IX – X (SEBA)', 'Comprehensive prep for HSLC board exams with regular assessments and evaluation.', 'bg-brand-500/10 text-brand-glow'],
];
type Notice = { id: string; title: string; body: string; date: string };

/* ---------- Scroll reveal ---------- */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Auto-sliding hero background ---------- */
function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused, i]);

  return (
    <div className="absolute inset-0"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - startX.current; if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1)); }}>
      {SLIDES.map((s, n) => (
        <div key={n} className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${n === i ? 'opacity-100' : 'opacity-0'}`}>
          <Image
  src={s.src}
  alt={s.title}
  fill
  priority={n === i}
  sizes="100vw"
  className={`object-cover ${n === i ? 'animate-kenburns' : ''}`}
/>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/85 via-dark-bg/65 to-dark-bg" />
      <div className="absolute bottom-5 left-0 right-0 z-20 px-4 flex items-center justify-between max-w-7xl mx-auto">
        <div key={i} className="animate-slide-in min-w-0">
          <p className="font-heading font-bold text-sm sm:text-base text-white truncate">{SLIDES[i].title}</p>
          <p className="text-[11px] sm:text-xs text-brand-glow truncate">{SLIDES[i].sub}</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button aria-label="Previous slide" onClick={() => go(i - 1)} className="hidden sm:flex w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 items-center justify-center text-xs"><i className="fa-solid fa-chevron-left" /></button>
          {SLIDES.map((_, n) => (
            <button key={n} aria-label={`Slide ${n + 1}`} onClick={() => go(n)}
              className={`h-2 rounded-full transition-all duration-500 ${n === i ? 'w-7 bg-brand-emerald' : 'w-2 bg-white/30'}`} />
          ))}
          <button aria-label="Next slide" onClick={() => go(i + 1)} className="hidden sm:flex w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 items-center justify-center text-xs"><i className="fa-solid fa-chevron-right" /></button>
        </div>
      </div>
    </div>
  );
}

const Eyebrow = ({ icon, children }: { icon?: string; children: ReactNode }) => (
  <div className="inline-flex items-center space-x-2 text-brand-emerald font-semibold text-xs uppercase tracking-wider">
    {icon && <i className={`fa-solid ${icon} text-xs`} />}<span>{children}</span>
  </div>
);

/* ---------- Page ---------- */
export default function HomePage() {
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <>
      {/* HERO */}
      <section id="home" className="relative min-h-[92vh] flex items-center pt-10 pb-28 overflow-hidden">
        <HeroSlider />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div style={delay(100)} className="animate-fade-up inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-medium text-brand-glow">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" /><span>Inspiring Academic Excellence</span>
            </div>
            <h1 style={delay(250)} className="animate-fade-up font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15]">
              Nurturing Bright Minds at <span className="bg-gradient-to-r from-brand-glow via-indigo-200 to-brand-emerald bg-clip-text text-transparent">Nilmoni Adarsha</span> Jatiya Vidyalaya
            </h1>
            <p style={delay(400)} className="animate-fade-up text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Empowering students with foundational knowledge, moral values, and creative thinking in a modern, supportive learning environment.
            </p>
            <div style={delay(550)} className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href="/alumni" className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-emerald hover:opacity-90 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition active:scale-95 flex items-center justify-center space-x-2">
                <i className="fa-solid fa-user-graduate text-xs" /><span>Join Alumni Network</span>
              </Link>
              <a href="#about" className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm transition flex items-center justify-center space-x-2">
                <span>Learn More</span><i className="fa-solid fa-arrow-down text-xs text-brand-emerald animate-float" />
              </a>
            </div>
            <div style={delay(700)} className="animate-fade-up pt-10 grid grid-cols-3 gap-3 sm:gap-6 border-t border-white/10 max-w-xl mx-auto text-center">
              {STATS.map(([a, b]) => (
                <div key={a} className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
                  <p className="font-heading font-bold text-xl sm:text-2xl text-white">{a}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal className="space-y-6">
            <Eyebrow icon="fa-school">About Our Institution</Eyebrow>
            <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white tracking-tight">Building Strong Foundations for Tomorrow&apos;s Future</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Nilmoni Adarsha Jatiya Vidyalaya provides quality primary and secondary education while instilling strong ethics and cultural values. Our dedicated faculty ensures personalized guidance for every student.
            </p>
            <div className="space-y-3 pt-2">
              {[
                ['Cultural Heritage:', 'Rooted in values while offering modern standard education.', 'bg-brand-500/10 text-brand-glow'],
                ['Mentorship:', 'Balanced student-teacher ratios for dedicated focus.', 'bg-brand-emerald/10 text-brand-emerald'],
              ].map(([t, s, c]) => (
                <div key={t} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-lg ${c} flex items-center justify-center text-xs shrink-0 mt-0.5`}><i className="fa-solid fa-check" /></div>
                  <p className="text-xs sm:text-sm text-slate-300"><strong className="text-white">{t}</strong> {s}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-emerald flex items-center justify-center text-white text-xl animate-float"><i className="fa-solid fa-bullseye" /></div>
            <h3 className="font-heading font-bold text-xl text-white">Our Educational Vision</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">&quot;To nurture knowledgeable, empathetic, and disciplined students who excel academically and contribute positively to society.&quot;</p>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
              <i className="fa-solid fa-award text-brand-emerald text-lg" />
              <div><p className="text-xs font-semibold text-white">SEBA Curriculum Aligned</p><p className="text-[11px] text-slate-400">Structured Academic Learning</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ACADEMICS */}
      <section id="academics" className="py-20 bg-dark-bg/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Eyebrow>Academic Wings</Eyebrow>
            <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white">Educational Structure</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {WINGS.map(([n, t, s, p, c], k) => (
              <Reveal key={n} delay={k * 120}>
                <div className="glass-card h-full rounded-3xl p-6 sm:p-8 space-y-4 hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-xl ${c} flex items-center justify-center font-bold`}>{n}</div>
                  <h3 className="font-heading font-bold text-xl text-white">{t}</h3>
                  <p className="text-xs text-brand-emerald font-medium">{s}</p>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SchoolNotices />

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-dark-bg/60 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <Reveal><Eyebrow>Reach Out</Eyebrow><h2 className="font-heading font-bold text-2xl sm:text-4xl text-white mt-1">Contact School Office</h2></Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            <Reveal>
              <div className="glass-card h-full p-6 rounded-3xl space-y-3">
                <i className="fa-solid fa-phone text-2xl text-brand-glow" />
                <h4 className="font-bold text-white text-base">Phone Assistance</h4>
                <p className="text-xs text-slate-400">Call office desk during school hours</p>
                <a href={`tel:${SITE.phone}`} className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold mt-2">Call Office</a>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="glass-card h-full p-6 rounded-3xl space-y-3">
                <i className="fa-solid fa-envelope text-2xl text-brand-emerald" />
                <h4 className="font-bold text-white text-base">Email Desk</h4>
                <p className="text-xs text-slate-400">Send inquiries and official messages</p>
                <a href={`mailto:${SITE.email}`} className="inline-block px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold mt-2 border border-white/10">Send Email</a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}