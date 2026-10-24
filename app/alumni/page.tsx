'use client';
// app/alumni/page.tsx — Alumni registration (Google Apps Script webhook) + live registered list.
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useToast } from '@/components/Toast';

const DEFAULT_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_ALUMNI_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbwyEk47ApOWL-HP-W_LkaasySIjFJCXyQ78YOiKWBbXKN9FrBFs_HBXm9xhzaYDHiN85w/exec';

type AlumniItem = {
  fullName: string; batchYear: string; relationship: string; location: string;
  profession?: string; subCommittees?: string;
};
type Opt = string | [value: string, label: string];

/* ---------- Form options ---------- */
const RELATIONS = ['প্ৰাক্তন শিক্ষাৰ্থী', 'বৰ্তমানৰ শিক্ষাৰ্থী', 'প্ৰাক্তন শিক্ষাৰ্থী আৰু প্ৰাক্তন কৰ্মী', 'অন্যান্য'];
const INTEREST = ['হয়, সক্ৰিয় সদস্য হ’ব বিচাৰোঁ', 'সমন্বয়ক / নেতৃত্বৰ দায়িত্ব ল’বলৈ আগ্ৰহী', 'প্ৰয়োজন অনুসৰি সহযোগিতা কৰিম', 'এতিয়াই নিশ্চিত নহয়'];
const SUBS: Opt[] = [
  'কাৰ্যসূচী আৰু মঞ্চ পৰিচালনা', 'অতিথি আদৰণি আৰু আতিথ্য', 'প্ৰাক্তন শিক্ষাৰ্থী সমন্বয় আৰু পঞ্জীয়ন', 'স্মৃতিগ্ৰন্থ আৰু প্ৰকাশন',
  'প্ৰচাৰ, সামাজিক মাধ্যম আৰু ডিজিটেল মিডিয়া', 'ফটো, ভিডিঅ’ আৰু নথিপত্ৰ সংৰক্ষণ', 'সাংস্কৃতিক অনুষ্ঠান', 'পুঁজি সংগ্ৰহ, দাতা আৰু পৃষ্ঠপোষক সমন্বয়',
  'বিত্ত আৰু হিচাপ-নিকাচ', 'খাদ্য আৰু আপ্যায়ন', 'পৰিবহণ আৰু অতিথি ব্যৱস্থাপনা', 'মঞ্চ, পেণ্ডেল, সজ্জা আৰু বিদ্যুৎ',
  'শৃংখলা, নিৰাপত্তা আৰু স্বেচ্ছাসেৱক', 'পৰিষ্কাৰ-পৰিচ্ছন্নতা আৰু পৰিৱেশ',
  ['প্ৰাক্তন শিক্ষাৰ্থীৰ স্মৃতি আৰু বিদ্যালয়ৰ ইতিহাস সংগ্ৰহ', 'প্ৰাক্তন শিক্ষাৰ্থীৰ স্মৃতি সংগ্ৰহ'],
  'লজিষ্টিকছ আৰু সামগ্ৰী ব্যৱস্থাপনা', 'স্বাস্থ্য আৰু জৰুৰীকালীন সহায়', 'যিকোনো প্ৰয়োজনীয় দায়িত্ব', 'নিজৰ প্ৰস্তাৱিত উপ-সমিতি',
];
const SKILLS: Opt[] = [
  'নেতৃত্ব আৰু দল পৰিচালনা', 'যোগাযোগ আৰু জনসম্পৰ্ক (PR)', 'লিখা, সম্পাদনা আৰু অসমীয়া ভাষা', 'গ্ৰাফিক ডিজাইন আৰু পোষ্টাৰ',
  'ভিডিঅ’ সম্পাদনা আৰু ফটোগ্ৰাফী', 'সামাজিক মাধ্যম পৰিচালনা', 'হিচাপ-নিকাচ আৰু বিত্তীয় কাম',
  ['স্পনছৰশ্বিপ / পৃষ্ঠপোষক সংগ্ৰহ', 'স্পনছৰশ্বিপ সংগ্ৰহ'], 'অনুষ্ঠান পৰিচালনা', 'প্ৰযুক্তি আৰু অনলাইন পঞ্জীয়ন',
  'সাংস্কৃতিক / সংগীত / পৰিৱেশন', 'যাতায়াত আৰু লজিষ্টিকছ', 'স্বেচ্ছাসেৱা আৰু মাঠ পৰ্যায়ৰ কাম', 'বিশেষ দক্ষতা / অন্যান্য',
];
const TIME = ['নিয়মীয়াকৈ সময় দিব পাৰিম', 'সপ্তাহত ১–২ দিন', 'কেৱল ছুটিৰ দিনত', 'অনুষ্ঠানৰ আগৰ কেইদিনমান', 'অনুষ্ঠানৰ ১৯ আৰু ২০ ডিচেম্বৰত', 'সময় নিশ্চিত নহয়'];

/* ---------- Small UI helpers ---------- */
const inp = 'w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none';
const tick = '!w-4 !h-4 !p-0 shrink-0 accent-sky-500';
const Star = () => <span className="text-rose-400">*</span>;

function Field({ label, req, className = '', children }: { label: string; req?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-200">{label} {req && <Star />}</label>
      {children}
    </div>
  );
}

function Radios({ name, options, req, cols = 'sm:grid-cols-2' }: { name: string; options: string[]; req?: boolean; cols?: string }) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-3 pt-1`}>
      {options.map((o) => (
        <label key={o} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
          <input type="radio" name={name} value={o} required={req} className={tick} />
          <span className="text-sm text-slate-300">{o}</span>
        </label>
      ))}
    </div>
  );
}

function Checks({ name, options, maxH }: { name: string; options: Opt[]; maxH: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 ${maxH} overflow-y-auto pr-2`}>
      {options.map((o) => {
        const [value, label] = typeof o === 'string' ? [o, o] : o;
        return (
          <label key={value} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" name={name} value={value} className={tick} /> {label}
          </label>
        );
      })}
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
      <h2 className="text-lg font-bold text-sky-400 border-b border-slate-800 pb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">{n}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ---------- Page ---------- */
export default function AlumniPage() {
  const toast = useToast();
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [urlDraft, setUrlDraft] = useState(DEFAULT_WEBHOOK_URL);
  const [adminOpen, setAdminOpen] = useState(false);
  const [list, setList] = useState<AlumniItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error' | 'failed' | 'none'>('loading');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (url: string) => {
    if (!url) { setStatus('none'); return; }
    setStatus('loading');
    try {
      const res = await fetch(url);
      const result = await res.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        setList([...result.data].reverse()); // latest first
        setStatus('ok');
      } else setStatus('error');
    } catch (err) {
      console.error('Fetch Error:', err);
      setStatus('failed');
    }
  }, []);

  useEffect(() => { load(webhookUrl); }, [webhookUrl, load]);

  // Hidden admin shortcut: Ctrl/Cmd + Shift + A
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); setUrlDraft(webhookUrl); setAdminOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [webhookUrl]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    const fd = new FormData(form);
    const str = (k: string) => String(fd.get(k) ?? '');
    const opt = (k: string) => str(k) || 'N/A';
    const checked = (k: string) => fd.getAll(k).join(', ');

    const payload = {
      timestamp: new Date().toLocaleString('as-IN'),
      fullName: str('fullName'), startYear: opt('startYear'), batchYear: str('batchYear'),
      relationship: str('relationship'), profession: opt('profession'), location: opt('location'),
      phone: str('phone'), email: opt('email'), committeeInterest: str('committeeInterest'),
      subCommittees: checked('subCommittees'), specificDept: opt('specificDept'), leadershipDept: opt('leadershipDept'),
      skills: checked('skills'), timeCommitment: str('timeCommitment'), attendance: str('attendance'), volunteer: str('volunteer'),
      suggestions: opt('suggestions'), sponsorshipAssistance: opt('sponsorshipAssistance'), otherComments: opt('otherComments'),
      contactPermission: str('contactPermission'),
    };

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      } catch (err) { console.error('Webhook POST Error:', err); }
    }
    setBusy(false);
    toast('পঞ্জীয়ন সফল হৈছে! ধন্যবাদ।', 'Your registration has been submitted.');
    form.reset();
    load(webhookUrl);
  }

  function saveWebhook() {
    const v = urlDraft.trim();
    if (!v) return;
    setWebhookUrl(v);
    setAdminOpen(false);
    toast('Webhook Endpoint URL updated!', 'Reloading registered list…');
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-sky-500/20 text-center space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <i className="fa-solid fa-wand-magic-sparkles" /> গৌৰৱোজ্জ্বল ৰূপালী জয়ন্তী বৰ্ষৰ সামৰণী অনুষ্ঠান
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">নীলমণি আদৰ্শ জাতীয় বিদ্যালয়</h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            <strong>স্থান:</strong> বিদ্যালয় প্ৰাঙ্গণ, নীলমণি, টিংখাং | <strong>তাৰিখ:</strong> ১৯ আৰু ২০ ডিচেম্বৰ, ২০২৬ (শনিবাৰ আৰু দেওবাৰ)<br />
            প্ৰ প্রাক্তন শিক্ষাৰ্থীসকলৰ পঞ্জীয়ন, Alumni Committee গঠন আৰু সামৰণী অনুষ্ঠানৰ বিভিন্ন উপ-সমিতিত দায়িত্ব গ্ৰহণৰ আগ্ৰহ সংগ্ৰহৰ বাবে এই প্ৰ-পত্ৰ প্ৰস্তুত কৰা হৈছে।
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <Section n={1} title="SECTION 1: ব্যক্তিগত আৰু প্ৰাক্তন শিক্ষাৰ্থীৰ তথ্য">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="১. সম্পূৰ্ণ নাম (Full Name)" req className="md:col-span-2"><input name="fullName" required placeholder="আপোনাৰ নাম লিখক" className={inp} /></Field>
              <Field label="২. বিদ্যালয়ত পঢ়া আৰম্ভ কৰা বছৰ"><input name="startYear" placeholder="যেনে: ২০০০" className={inp} /></Field>
              <Field label="৩. বিদ্যালয় এৰা / উত্তীৰ্ণ হোৱা বছৰ (Batch)" req><input name="batchYear" required placeholder="যেনে: ২০১০" className={inp} /></Field>
              <Field label="৪. বিদ্যালয়ৰ সৈতে আপোনাৰ সম্পৰ্ক" req className="md:col-span-2"><Radios name="relationship" options={RELATIONS} req /></Field>
              <Field label="৫. বৰ্তমানৰ পেছা / অধ্যয়ন"><input name="profession" placeholder="যেনে: চাকৰি, ব্যৱসায়, ছাত্ৰ" className={inp} /></Field>
              <Field label="৬. বৰ্তমানৰ গাঁও / চহৰ"><input name="location" placeholder="যেনে: টিংখাং / ডিব্ৰুগড়" className={inp} /></Field>
              <Field label="৭. মোবাইল নম্বৰ (WhatsApp উপলব্ধ হ’লে ভাল)" req><input type="tel" name="phone" required placeholder="মোবাইল নম্বৰ" className={inp} /></Field>
              <Field label="৮. ই-মেইল ঠিকনা (ঐচ্ছিক)"><input type="email" name="email" placeholder="ই-মেইল ঠিকনা" className={inp} /></Field>
            </div>
          </Section>

          <Section n={2} title="SECTION 2: Alumni Committee-ত অংশগ্ৰহণ">
            <Field label="৯. Alumni Committee-ত দায়িত্ব ল’বলৈ আগ্ৰহীনে?" req><Radios name="committeeInterest" options={INTEREST} req /></Field>
            <Field label="১০. আপোনাৰ পছন্দৰ উপ-সমিতি (এটাতকৈ অধিক বাছনি কৰিব পাৰিব)" req><Checks name="subCommittees" options={SUBS} maxH="max-h-60" /></Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="১১. আপুনি কোনটো বিভাগত বিশেষ দায়িত্ব ল’ব বিচাৰে?"><input name="specificDept" placeholder="বিভাগৰ নাম" className={inp} /></Field>
              <Field label="১২. নেতৃত্ব / সমন্বয়ৰ দায়িত্ব ল’ব বিচাৰিলে বিভাগৰ নাম লিখক"><input name="leadershipDept" placeholder="নেতৃত্বৰ বিভাগ" className={inp} /></Field>
            </div>
          </Section>

          <Section n={3} title="SECTION 3: দক্ষতা, সময় আৰু সহযোগিতা">
            <Field label="১৩. আপোনাৰ দক্ষতা / অভিজ্ঞতা"><Checks name="skills" options={SKILLS} maxH="max-h-52" /></Field>
            <Field label="১৪. অনুষ্ঠানৰ প্ৰস্তুতিৰ সময়ত কিমান সময় দিব পাৰিব?" req><Radios name="timeCommitment" options={TIME} req /></Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="১৫. অনুষ্ঠানৰ দিন দুটাত উপস্থিত থাকিব পাৰিবনে?" req>
                <select name="attendance" required defaultValue="" className={inp}>
                  <option value="" disabled>বাছনি কৰক</option>
                  {['দুয়োদিন', '১৯ ডিচেম্বৰ', '২০ ডিচেম্বৰ', 'এতিয়াও নিশ্চিত নহয়'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="১৬. আপুনি স্বেচ্ছাসেৱক হিচাপেও কাম কৰিব পাৰিবনে?" req>
                <select name="volunteer" required defaultValue="" className={inp}>
                  <option value="" disabled>বাছনি কৰক</option>
                  {['হয়', 'নাই', 'প্ৰয়োজন অনুসৰি'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section n={4} title="SECTION 4: পৰামৰ্শ আৰু অতিৰিক্ত তথ্য">
            <Field label="১৭. ৰূপালী জয়ন্তীৰ সামৰণী অনুষ্ঠানৰ বাবে আপোনাৰ পৰামৰ্শ / নতুন ধাৰণা"><textarea name="suggestions" rows={3} placeholder="আপোনাৰ পৰামৰ্শ লিখক" className={`${inp} resize-none`} /></Field>
            <Field label="১৮. আপুনি কৰিব পৰা বিশেষ সহায়, যোগাযোগ, পৃষ্ঠপোষকতা বা অন্যান্য অৱদানৰ বিষয়ে লিখক"><textarea name="sponsorshipAssistance" rows={2} placeholder="সহায় বা পৃষ্ঠপোষকতাৰ তথ্য" className={`${inp} resize-none`} /></Field>
            <Field label="১৯. আন কোনো মন্তব্য / নিজৰ পছন্দৰ উপ-সমিতিৰ প্ৰস্তাৱ"><textarea name="otherComments" rows={2} placeholder="মন্তব্য" className={`${inp} resize-none`} /></Field>
            <Field label="২০. আয়োজক সমিতিয়ে আপোনাৰ সৈতে যোগাযোগ কৰিব পাৰিবনে?" req>
              <div className="flex gap-6 pt-1">
                {['হয়', 'নাই'].map((o) => (
                  <label key={o} className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input type="radio" name="contactPermission" value={o} defaultChecked={o === 'হয়'} className={tick} /> {o}
                  </label>
                ))}
              </div>
            </Field>
          </Section>

          <button type="submit" disabled={busy} className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-base shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-[.99]">
            <i className={`fa-solid ${busy ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
            {busy ? 'দাখিল কৰা হৈছে...' : 'পঞ্জীয়ন দাখিল কৰক (Submit Registration)'}
          </button>
        </form>

        {/* Registered list */}
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-between">
            <span>পঞ্জীয়ন কৰা প্ৰ প্রাক্তন শিক্ষাৰ্থীসকল</span>
            <span className="text-xs font-normal text-slate-400">{list.length} Registrations</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {status === 'loading' && <p className="text-xs text-sky-400 sm:col-span-2 flex items-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> ডাটা লোড কৰা হৈছে...</p>}
            {status === 'none' && <p className="text-xs text-slate-500 sm:col-span-2">কোনো Webhook URL নাই।</p>}
            {status === 'error' && <p className="text-xs text-rose-400 sm:col-span-2">ডাটা লোড কৰোঁতে সমস্যা হৈছে।</p>}
            {status === 'failed' && <p className="text-xs text-slate-500 sm:col-span-2">পঞ্জীয়ন কৰা তালিকা লোড কৰিব পৰা নগ’ল।</p>}
            {status === 'ok' && list.length === 0 && <p className="text-xs text-slate-500 sm:col-span-2">এতিয়ালৈকে কোনো পঞ্জীয়ন হোৱা নাই।</p>}
            {status === 'ok' && list.map((a, i) => (
              <div key={i} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{a.fullName}</h4>
                    <p className="text-xs text-sky-400">Batch: {a.batchYear} | {a.relationship}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 shrink-0">{a.location}</span>
                </div>
                {a.profession && a.profession !== 'N/A' && <p className="text-xs text-slate-300">পেছা: {a.profession}</p>}
                {a.subCommittees && <p className="text-[11px] text-amber-400/90 truncate">উপ-সমিতি: {a.subCommittees}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin modal (Ctrl/Cmd + Shift + A) */}
      {adminOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setAdminOpen(false)}>
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-sky-500/30 space-y-4 shadow-2xl animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-sky-400 flex items-center gap-2"><i className="fa-solid fa-shield-halved" /> Admin Webhook Settings</h3>
              <button onClick={() => setAdminOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close"><i className="fa-solid fa-xmark" /></button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Google Apps Script Webhook Endpoint URL. Form submissions and live records sync with your Google Sheet.</p>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Google Apps Script Webhook URL</label>
              <input type="url" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="https://script.google.com/macros/s/..." className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setAdminOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all">Cancel</button>
              <button onClick={saveWebhook} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-all">Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}