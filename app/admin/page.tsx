
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
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
      } catch {
        setReady(false);
        router.replace("/admin/login");
      }
    });
  }, [router]);

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
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-sky-400">SCHOOL ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Welcome, {staffName} · {role}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/15 px-4 py-2 hover:bg-white/10"
        >
          Sign out
        </button>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Notices", "/admin/notices"],
          ["Events", "/admin/events"],
        ].map(([title, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-sky-400/50 hover:bg-white/10"
          >
            <h2 className="text-xl font-medium">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create, edit and publish school {title.toLowerCase()}.
            </p>
            <span className="mt-5 inline-block text-sky-400">
              Manage →
            </span>
          </a>
        ))}
      </section>
    </main>
  );
}
