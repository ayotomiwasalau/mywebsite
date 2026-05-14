import React from "react";
import BoardSection from "../../components/admin/dashboard/BoardSection";
import MessageSection from "../../components/admin/dashboard/MessageSection";

export default function AdminDashboard() {
  return (
    <section className="w-full bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-[760px] bg-white pb-8">
        <div className="px-8">
          <BoardSection />
          <MessageSection />
        </div>
      </div>
    </section>
  );
}
