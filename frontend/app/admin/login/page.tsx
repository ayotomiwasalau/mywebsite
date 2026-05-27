import React, { Suspense } from "react";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import Login from "../../components/admin/auth/Login";
import LoadingPage from "../../components/shared/LoadingPage";

export default function AdminLoginPage() {
  return (
    <div>
      <NavBar />
      <Suspense fallback={<LoadingPage />}>
        <Login />
      </Suspense>
      <Footer />
    </div>
  );
}
