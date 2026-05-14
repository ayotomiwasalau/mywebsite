"use client"
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import ContentPosts from "../components/work/ContentPosts";
import MediaSection from "../components/work/MediaSection";
import FooterCTA from "../components/layout/FooterCTA";

export default function Work() {
  return (
    <div className="font-[family-name:var(--font-geist-mono)] bg-white">
      <NavBar />
      <ContentPosts />
      <MediaSection />
      <FooterCTA />
      <Footer />
    </div>
  );
}
