"use client";

import React from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import MiniNavBar from "../../components/admin/MiniNavBar";
import { clearAdminSession } from "@lib/adminAuth";

export default function LogoutPage() {
  const router = useRouter();

  function confirmLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  return (
    <div>
      <NavBar />
      <MiniNavBar />
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 bg-white px-6 text-center">
        <p className="text-[1.8rem] font-semibold text-[#111111]">Are you sure?</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={confirmLogout}
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl bg-[#D95A76] px-6 text-[1.1rem] font-medium text-white transition hover:opacity-90"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-2xl border border-[#D95A76] px-6 text-[1.1rem] font-medium text-[#D95A76] transition hover:bg-[#D95A76]/10"
          >
            No
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
