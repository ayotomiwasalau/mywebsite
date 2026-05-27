import React from "react";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import WorkImagesSection from "../../components/admin/contentimage/WorkImagesSection";
import MiniNavBar from "../../components/admin/MiniNavBar";

export default function WorkImagesPage() {
  return (
    <div>
      <NavBar />
      <MiniNavBar />
        <WorkImagesSection />
      <Footer />
    </div>
  );
}