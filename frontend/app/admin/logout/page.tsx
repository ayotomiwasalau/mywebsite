import React from "react";
import Link from "next/link";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import MiniNavBar from "../../components/admin/MiniNavBar";

export default function LogoutPage() {
  return (
    <div className="font-[family-name:var(--font-geist-mono)]">
      <NavBar />
      <MiniNavBar />
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 bg-white px-6 text-center">
        <p className="text-[1.8rem] font-semibold text-[#111111]">Are you sure?</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/admin/login"
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl bg-[#D95A76] px-6 text-[1.1rem] font-medium text-white transition hover:opacity-90"
          >
            Yes
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl border border-[#D95A76] px-6 text-[1.1rem] font-medium text-[#D95A76] transition hover:bg-[#D95A76]/10"
          >
            No
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}