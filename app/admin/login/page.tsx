
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginStaff } from "@/lib/firebase/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginStaff(email, password);
      router.replace("/admin");
    } catch(error: unknown) {
      setError("Unable to sign in. Check your account and password.");
      console.error("Admin login error:", error);

        const message =
            error instanceof Error ? error.message : "Unknown login error";

        setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl"
      >
        <div>
          <p className="text-sm text-sky-400">NILMONI ADARSHA JATIYA VIDYALAYA</p>
          <h1 className="mt-3 text-3xl font-semibold">Staff Portal</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage school notices and events.
          </p>
        </div>

        <label className="block text-sm">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-sky-400"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
