import React from "react";

export default function Login() {
  return (
    <section className="w-full bg-[#ECECEC] px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-[860px]">
        <h1 className="text-2xl font-semibold text-[#111111]">Admin Panel</h1>

        <form className="mt-10 max-w-[620px] mx-auto space-y-3">
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
              className="h-12 w-full rounded-3xl border-none bg-[#CDCDD0] px-4 text-[1rem] text-[#1f1f1f] outline-none"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="h-12 min-w-[170px] rounded-3xl bg-[#D95A76] px-7 text-[1.25rem] text-white transition hover:opacity-90"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
