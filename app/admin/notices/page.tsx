
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase/client";
import {
  createContent,
  getAdminContent,
  removeContent,
  updateContent,
  type SchoolContent,
} from "@/lib/firebase/content";
import { uploadNoticePdf } from "@/lib/firebase/upload";

type NoticeStatus = "draft" | "published";

export default function AdminNoticesPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState("");
  const [notices, setNotices] = useState<SchoolContent[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState<NoticeStatus>("draft");
  const [pinned, setPinned] = useState(false);
  const [date, setDate] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const loadNotices = useCallback(async () => {
    setLoadingNotices(true);
    setError("");

    try {
      const result = await getAdminContent("notices");
      setNotices(result);
    } catch (err) {
      console.error("Failed to load notices:", err);
      setError("Could not load notices. Check your connection and permissions.");
    } finally {
      setLoadingNotices(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));

        if (
          !snapshot.exists() ||
          snapshot.data().active !== true ||
          !["admin", "editor"].includes(snapshot.data().role)
        ) {
          await signOut(auth);
          router.replace("/admin/login");
          return;
        }

        setStaffName(snapshot.data().name || user.email || "Staff");
        setRole(snapshot.data().role);
        setReady(true);
      } catch (err) {
        console.error("Staff verification failed:", err);
        router.replace("/admin/login");
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (ready) {
      void loadNotices();
    }
  }, [ready, loadNotices]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("General");
    setStatus("draft");
    setPinned(false);
    setDate("");
    setPdfFile(null);
    setError("");
    setSuccess("");
  }

  function startEditing(notice: SchoolContent) {
    setEditingId(notice.id);
    setTitle(notice.title);
    setDescription(notice.description);
    setCategory(notice.category || "General");
    setStatus(notice.status);
    setPinned(Boolean(notice.pinned));
    setDate(notice.date || "");
    setPdfFile(null);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (!cleanTitle || !cleanDescription || !cleanCategory) {
      setError("Please fill in the title, description and category.");
      return;
    }

    if (cleanTitle.length > 200) {
      setError("The title must be 200 characters or fewer.");
      return;
    }

    if (cleanDescription.length > 15000) {
      setError("The description must be 15,000 characters or fewer.");
      return;
    }

    if (cleanCategory.length > 80) {
      setError("The category must be 80 characters or fewer.");
      return;
    }

    setSaving(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      let pdfUrl: string | undefined;

      if (pdfFile) {
        pdfUrl = await uploadNoticePdf(pdfFile);
      }

      const payload = {
        title: cleanTitle,
        description: cleanDescription,
        category: cleanCategory,
        status,
        pinned,
        ...(date ? { date } : {}),
        ...(pdfUrl ? { pdfUrl } : {}),
      };

      if (editingId) {
        await updateContent("notices", editingId, payload);
        setSuccess("Notice updated successfully.");
      } else {
        await createContent("notices", payload, currentUser.uid);
        setSuccess("Notice created successfully.");
      }

      resetForm();
      setSuccess(
        editingId
          ? "Notice updated successfully."
          : "Notice created successfully."
      );

      await loadNotices();
    } catch (err) {
      console.error("Failed to save notice:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the notice. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusToggle(notice: SchoolContent) {
    setError("");
    setSuccess("");

    try {
      const nextStatus: NoticeStatus =
        notice.status === "published" ? "draft" : "published";

      await updateContent("notices", notice.id, { status: nextStatus });
      setSuccess(
        nextStatus === "published"
          ? "Notice published successfully."
          : "Notice moved back to drafts."
      );

      await loadNotices();
    } catch (err) {
      console.error("Failed to change notice status:", err);
      setError("Could not change the notice status. Please try again.");
    }
  }

  async function handlePinToggle(notice: SchoolContent) {
    setError("");
    setSuccess("");

    try {
      await updateContent("notices", notice.id, {
        pinned: !notice.pinned,
      });

      setSuccess(
        notice.pinned ? "Notice unpinned." : "Notice pinned successfully."
      );

      await loadNotices();
    } catch (err) {
      console.error("Failed to update pin:", err);
      setError("Could not update the pinned status.");
    }
  }

  async function handleDelete(notice: SchoolContent) {
    if (role !== "admin") {
      setError("Only an admin can delete notices.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${notice.title}" permanently? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await removeContent("notices", notice.id);
      setSuccess("Notice deleted successfully.");
      await loadNotices();
    } catch (err) {
      console.error("Failed to delete notice:", err);
      setError("Could not delete the notice. Check your admin permissions.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        Checking staff access...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a
              href="/admin"
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              ← Back to dashboard
            </a>
            <p className="mt-4 text-sm font-medium tracking-widest text-sky-400">
              SCHOOL ADMINISTRATION
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Notice Management</h1>
            <p className="mt-2 text-sm text-slate-400">
              Signed in as {staffName} · {role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
          >
            Sign out
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200"
          >
            {success}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit notice" : "Create a notice"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Drafts remain hidden from public visitors until published.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
              >
                Cancel editing
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="notice-title" className="mb-2 block text-sm">
                Notice title *
              </label>
              <input
                id="notice-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                required
                placeholder="e.g. School admission notice 2026"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label htmlFor="notice-description" className="mb-2 block text-sm">
                Description *
              </label>
              <textarea
                id="notice-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={15000}
                rows={5}
                required
                placeholder="Write the complete notice here..."
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {description.length}/15000
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="notice-category" className="mb-2 block text-sm">
                  Category *
                </label>
                <input
                  id="notice-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={80}
                  required
                  placeholder="General, Examination, Admission..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label htmlFor="notice-date" className="mb-2 block text-sm">
                  Notice date
                </label>
                <input
                  id="notice-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notice-status" className="mb-2 block text-sm">
                Publication status
              </label>
              <select
                id="notice-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as NoticeStatus)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
              >
                <option value="draft">Draft — hidden from public</option>
                <option value="published">Published — visible to public</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
              Pin this notice
            </label>

            <div>
              <label htmlFor="notice-pdf" className="mb-2 block text-sm">
                Attach a PDF (optional, max 10 MB)
              </label>
              <input
                id="notice-pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  setPdfFile(event.target.files?.[0] ?? null)
                }
                className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-400/10 file:px-4 file:py-2 file:text-sky-300 hover:file:bg-sky-400/20"
              />
              {pdfFile && (
                <p className="mt-2 text-xs text-slate-400">
                  Selected: {pdfFile.name}
                </p>
              )}
              {editingId && (
                <p className="mt-2 text-xs text-slate-500">
                  Leave the file field empty to keep the existing PDF.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-sky-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create notice"}
            </button>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Existing notices</h2>
              <p className="mt-1 text-sm text-slate-400">
                {notices.length} notice{notices.length === 1 ? "" : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadNotices()}
              disabled={loadingNotices}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loadingNotices ? (
            <p className="py-10 text-sm text-slate-400">Loading notices...</p>
          ) : notices.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <p className="text-slate-300">No notices have been created yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Use the form above to publish your first school notice.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {notices.map((notice) => (
                <article
                  key={notice.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
                      {notice.category}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        notice.status === "published"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {notice.status}
                    </span>

                    {notice.pinned && (
                      <span className="text-xs text-amber-300">📌 Pinned</span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-semibold">{notice.title}</h3>

                  {notice.date && (
                    <p className="mt-1 text-xs text-slate-500">
                      Notice date: {notice.date}
                    </p>
                  )}

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                    {notice.description}
                  </p>

                  {notice.pdfUrl && (
                    <a
                      href={notice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm text-sky-300 underline"
                    >
                      View attached PDF ↗
                    </a>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => startEditing(notice)}
                      className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleStatusToggle(notice)}
                      className="rounded-lg border border-sky-400/30 px-3 py-2 text-sm text-sky-300 hover:bg-sky-400/10"
                    >
                      {notice.status === "published" ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handlePinToggle(notice)}
                      className="rounded-lg border border-amber-400/30 px-3 py-2 text-sm text-amber-300 hover:bg-amber-400/10"
                    >
                      {notice.pinned ? "Unpin" : "Pin"}
                    </button>

                    {role === "admin" && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(notice)}
                        className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
