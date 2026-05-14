import React from "react";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import WorkContentSection from "../../components/admin/workcontent/WorkContentSection";
import MiniNavBar from "../../components/admin/MiniNavBar";

export default function WorkContentPage() {
  return (
    <div className="font-[family-name:var(--font-geist-mono)]">
      <NavBar />
      <MiniNavBar />
        <WorkContentSection />
      <Footer />
    </div>
  );
}