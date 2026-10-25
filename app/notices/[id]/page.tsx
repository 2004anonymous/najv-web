
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPublishedContent,
  type SchoolContent,
} from "@/lib/firebase/content";

function formatNoticeDate(value: unknown, fallback?: string) {
  let date: Date | null = null;

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else if (fallback) {
    const parsed = new Date(fallback);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date || Number.isNaN(date.getTime())) return "School announcement";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function NoticeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [notice, setNotice] = useState<SchoolContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadNotice() {
      setLoading(true);
      setFailed(false);

      try {
        const notices = await getPublishedContent("notices");
        const match = notices.find((item) => item.id === id);

        if (!cancelled) {
          setNotice(match ?? null);
        }
      } catch (error) {
        console.error("Failed to load notice:", error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) loadNotice();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-dark-bg text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/notices"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <i className="fa-solid fa-arrow-left text-xs" />
          All Notices
        </Link>

        {loading ? (
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="h-10 rounded bg-white/10" />
            <div className="h-48 rounded-2xl bg-white/5" />
          </div>
        ) : failed ? (
          <div className="glass-card mt-8 rounded-2xl p-8 text-center">
            <h1 className="font-heading text-xl font-bold">
              Unable to load this notice
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : !notice ? (
          <div className="glass-card mt-8 rounded-2xl p-8 text-center">
            <i className="fa-regular fa-file-lines text-3xl text-slate-500" />
            <h1 className="mt-4 font-heading text-xl font-bold">
              Notice not found
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              This notice may have been removed or is no longer published.
            </p>
            <Link
              href="/notices"
              className="mt-5 inline-flex text-sm font-semibold text-brand-glow hover:underline"
            >
              Browse all notices
            </Link>
          </div>
        ) : (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              {notice.pinned && (
                <span className="rounded-full bg-brand-600/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-glow">
                  <i className="fa-solid fa-thumbtack mr-1.5" />
                  Important notice
                </span>
              )}

              {notice.category && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-300">
                  {notice.category}
                </span>
              )}
            </div>

            <h1 className="mt-5 font-heading text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              {notice.title}
            </h1>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <i className="fa-regular fa-calendar text-brand-emerald" />
              {formatNoticeDate(notice.updatedAt, notice.date)}
            </div>

            <div className="mt-8 border-y border-white/10 py-7 sm:py-9">
              <div className="text-sm sm:text-base leading-8 text-slate-300 whitespace-pre-wrap break-words">
                {notice.description}
              </div>
            </div>

            {notice.pdfUrl && (
              <a
                href={notice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10 transition"
              >
                <i className="fa-solid fa-file-pdf text-2xl text-red-400" />
                <span>
                  <span className="block text-sm font-semibold text-white">
                    View attached document
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    Open or download the notice PDF
                  </span>
                </span>
                <i className="fa-solid fa-arrow-up-right-from-square ml-2 text-xs text-slate-400" />
              </a>
            )}

            <div className="mt-10">
              <Link
                href="/notices"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                <i className="fa-solid fa-arrow-left text-xs" />
                Back to all notices
              </Link>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
