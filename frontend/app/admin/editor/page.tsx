import React from "react";
import NavBar from "../../components/layout/NavBar";
import Footer from "../../components/layout/Footer";
import MiniNavBar from "../../components/admin/MiniNavBar";
import ContentEditorFlow from "../../components/admin/editor/ContentEditorFlow";

export default function EditorPage() {
  return (
    <div>
      <NavBar />
      <MiniNavBar />
      <ContentEditorFlow />
      <Footer />
    </div>
  );
}