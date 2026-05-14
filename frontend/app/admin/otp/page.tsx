import React from "react";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import Otp from "../../components/admin/auth/Otp";

export default function OtpPage() {
  return (
    <div className="font-[family-name:var(--font-geist-mono)]">
      <NavBar />
        <Otp />
      <Footer />
    </div>
  );
}