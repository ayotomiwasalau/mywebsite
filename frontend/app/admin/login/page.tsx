import React from "react";
import AdminDashboard from "../dashboard/AdminDashboard";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import Login from "../../components/admin/auth/Login";

export default function AdminPage() {
  return (
    <div className="font-[family-name:var(--font-geist-mono)]">
      <NavBar />
        <Login />
      <Footer />
    </div>
  );
}
