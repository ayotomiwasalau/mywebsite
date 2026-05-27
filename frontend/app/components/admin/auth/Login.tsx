"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdmin } from "@lib/adminAuth";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(username.trim(), password);
      const next = searchParams.get("next");
      router.replace(
        next && next.startsWith("/admin/") && next !== "/admin/login"
          ? next
          : "/admin/dashboard",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full bg-[#ECECEC] px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-[860px]">
        <h1 className="text-2xl font-semibold text-[#111111]">Admin Panel</h1>

        <form className="mt-10 max-w-[620px] mx-auto space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <label
              htmlFor="admin-username"
              className="min-w-[140px] text-[1.45rem] text-[#1b1b1b]"
            >
              Username:
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-12 w-full rounded-3xl border-none bg-[#CDCDD0] px-4 text-[1rem] text-[#1f1f1f] outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <label
              htmlFor="admin-password"
              className="min-w-[140px] text-[1.45rem] text-[#1b1b1b]"
            >
              Password:
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-3xl border-none bg-[#CDCDD0] px-4 text-[1rem] text-[#1f1f1f] outline-none"
            />
          </div>

          {error ? (
            <p className="text-right text-[0.95rem] text-[#8A2438]" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-w-[170px] rounded-3xl bg-[#D95A76] px-7 text-[1.25rem] text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
