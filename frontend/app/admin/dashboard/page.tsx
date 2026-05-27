import React from "react";
import AdminDashboard from "./AdminDashboard";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import MiniNavBar from "../../components/admin/MiniNavBar";

export default function AdminDashboardPage() {
  return (
    <div>
      <NavBar />
      <MiniNavBar />
      <AdminDashboard />
      <Footer />
    </div>
  );
}
