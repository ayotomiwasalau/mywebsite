"use client"
import { Suspense } from "react";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import ContentPosts from "../components/work/ContentPosts";
import MediaSection from "../components/work/MediaSection";
import FooterCTA from "../components/layout/FooterCTA";

export default function Work() {
  return (
    <div className="bg-white">
      <NavBar />
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center bg-white">
            <p className="text-[#666666]">Loading…</p>
          </div>
        }
      >
        <ContentPosts />
      </Suspense>
      <MediaSection />
      <FooterCTA />
      <Footer />
    </div>
  );
}
