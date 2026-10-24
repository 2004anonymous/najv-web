
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublishedContent, type SchoolContent } from "@/lib/firebase/content";

export default function SchoolNotices() {
  const [notices, setNotices] = useState<SchoolContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedContent("notices")
      .then(setNotices)
      .catch((error) => {
        console.error("Could not load school notices:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading notices...</p>;
  }

  if (!notices.length) {
    return <p className="text-sm text-slate-400">No notices available at present.</p>;
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <article
          key={notice.id}
          className="rounded-xl border border-white/10 bg-white/5 p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
              {notice.category}
            </span>
            {notice.pinned && (
              <span className="text-xs text-amber-300">Pinned</span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-white">
            {notice.title}
          </h3>

          <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
            {notice.description}
          </p>

          {notice.pdfUrl && (
            <a
              href={notice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm text-sky-300 underline"
            >
              View notice PDF ↗
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
