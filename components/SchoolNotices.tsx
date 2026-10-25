
"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import {
  getPublishedContent,
  type SchoolContent,
} from "@/lib/firebase/content";

// Keep your existing Reveal, Eyebrow, and brand styles from the project.
// This component uses lightweight local versions if they aren't exported elsewhere.

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={className}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const Eyebrow = ({ icon, children }: { icon?: string; children: ReactNode }) => (
  <div className="inline-flex items-center space-x-2 text-brand-emerald font-semibold text-xs uppercase tracking-wider">
    {icon && <i className={`fa-solid ${icon} text-xs`} />}<span>{children}</span>
  </div>
);

export default function SchoolNotices() {
  const [notices, setNotices] = useState<SchoolContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNotices() {
      try {
        const result = await getPublishedContent("notices");

        if (!cancelled) {
          // Pinned notices first; otherwise preserve the Firestore ordering.
          setNotices(
            [...result].sort(
              (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
            )
          );
        }
      } catch (err) {
        console.error("Could not load school notices:", err);

        if (!cancelled) {
          setError("Unable to load school notices right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotices();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (notice: SchoolContent) => {
    if (notice.date) return notice.date;

    const timestamp = notice.updatedAt as
      | { toDate?: () => Date }
      | undefined;

    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return "";
  };

  return (
    <section id="notices" className="py-20 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-center justify-between mb-8">
          <div>
            <Eyebrow>Updates</Eyebrow>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              School Announcements
            </h2>
          </div>

          <Link
            href="/notices"
            className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-glow text-xs font-medium hover:bg-brand-500/20 transition"
          >
            View All →
          </Link>
        </Reveal>

        {loading ? (
          <p className="text-sm text-slate-400">Loading notices...</p>
        ) : error ? (
          <p className="text-sm text-slate-400">{error}</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-slate-400">
            No notices available at present.
          </p>
        ) : (
          <div className="space-y-4">
            {notices.slice(0, 5).map((n, k) => (
              <Reveal key={n.id} delay={k * 100}>
                <Link
                  href={`/notices/${n.id}`}
                  className="glass-card p-5 rounded-2xl flex items-center justify-between gap-4 hover:-translate-y-0.5"
                >
                  <div className="flex items-start space-x-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        k === 0
                          ? "bg-brand-600/20 text-brand-glow"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {k === 0 ? "NEW" : "INFO"}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-heading font-semibold text-sm sm:text-base text-white">
                        {n.title}
                      </h4>

                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                        {n.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 shrink-0">
                    {formatDate(n)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
