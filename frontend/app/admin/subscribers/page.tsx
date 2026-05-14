import React from "react";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import SubscriberSection from "../../components/admin/subscribers/SubscriberSection";
import MiniNavBar from "../../components/admin/MiniNavBar";

export default function SubscribersPage() {
  return (
    <div className="font-[family-name:var(--font-geist-mono)]">
      <NavBar />
      <MiniNavBar />
        <SubscriberSection />
      <Footer />
    </div>
  );
}