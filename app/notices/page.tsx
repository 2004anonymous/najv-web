
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPublishedContent, type SchoolContent } from "@/lib/firebase/content";

function formatDate(value: unknown, fallback?: string) {
  let date: Date | null = null;

  if (value instanceof Date) {
    date = value;
  } else if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate();
  } else if (typeof fallback === "string" && fallback) {
    const parsed = new Date(fallback);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date || Number.isNaN(date.getTime())) return "School update";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<SchoolContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function loadNotices() {
      setLoading(true);
      setError("");

      try {
        const data = await getPublishedContent("notices");

        if (!cancelled) {
          setNotices(
            [...data].sort(
              (a, b) =>
                Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
            )
          );
        }
      } catch (err) {
        console.error("Failed to load notices:", err);
        if (!cancelled) {
          setError(
            "We couldn't load the announcements right now. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotices();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(notices.map((n) => n.category).filter(Boolean))
      ).sort(),
    ],
    [notices]
  );

  const filteredNotices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return notices.filter((notice) => {
      const matchesCategory =
        category === "All" || notice.category === category;

      const matchesSearch =
        !term ||
        notice.title.toLowerCase().includes(term) ||
        notice.description.toLowerCase().includes(term) ||
        notice.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [notices, search, category]);

  return (
    <main className="min-h-screen bg-dark-bg text-white">
      {/* Page heading */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/15 via-transparent to-brand-emerald/10 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-8"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2 text-brand-emerald text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <i className="fa-solid fa-bullhorn" />
            Official Updates
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight">
            School Announcements
          </h1>

          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-400">
            Stay informed about school activities, admissions, examinations,
            important dates, and other official announcements from Nilmoni
            Adarsha Jatiya Vidyalaya.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
            <i className="fa-solid fa-bell text-brand-emerald" />
            {notices.length} published{" "}
            {notices.length === 1 ? "notice" : "notices"}
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices..."
              aria-label="Search notices"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-emerald/50"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter notices by category"
            className="rounded-xl border border-white/10 bg-dark-bg px-4 py-3 text-sm text-slate-200 outline-none focus:border-brand-emerald/50"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All categories" : item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Notices */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="space-y-4" aria-label="Loading notices">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl border border-white/5 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <i className="fa-solid fa-triangle-exclamation text-2xl text-amber-400" />
            <p className="mt-3 text-sm text-slate-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="glass-card rounded-2xl px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
              <i className="fa-solid fa-bell-slash text-xl" />
            </div>
            <h2 className="mt-5 font-heading text-lg font-bold">
              No notices found
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {search || category !== "All"
                ? "Try another search or select a different category."
                : "There are no published announcements at the moment."}
            </p>
            {(search || category !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-5 text-sm font-semibold text-brand-glow hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice, index) => (
              <article
                key={notice.id}
                className="glass-card rounded-2xl p-5 sm:p-6 border border-white/5 hover:border-brand-emerald/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      notice.pinned
                        ? "bg-brand-600/20 text-brand-glow"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        notice.pinned ? "fa-thumbtack" : "fa-bullhorn"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {notice.pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-glow">
                          <i className="fa-solid fa-thumbtack" />
                          Pinned
                        </span>
                      )}

                      {notice.category && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                          {notice.category}
                        </span>
                      )}

                      {index === 0 && !search && category === "All" && (
                        <span className="rounded-full bg-brand-emerald/10 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-emerald">
                          Latest
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-base sm:text-lg font-bold leading-snug text-white">
                      {notice.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-400 whitespace-pre-line line-clamp-4">
                      {notice.description}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <i className="fa-regular fa-calendar text-brand-emerald" />
                        {formatDate(notice.updatedAt, notice.date)}
                      </span>

                      <div className="flex flex-wrap items-center gap-4">
                        {notice.pdfUrl && (
                          <a
                            href={notice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                          >
                            <i className="fa-solid fa-file-pdf text-red-400" />
                            View PDF
                          </a>
                        )}

                        <Link
                          href={`/notices/${notice.id}`}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-glow hover:text-white transition"
                        >
                          Read full notice
                          <i className="fa-solid fa-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
