import React from "react";
import HeroSection from "./components/home/HeroSection";
import NavBar from "./components/layout/NavBar";
import FeaturedProjects from "./components/home/FeaturedProjects";
import WorkAndInsight from "./components/home/WorkAndInsight";
import Specializations from "./components/home/Specializations";
import Footer from "./components/layout/Footer";
import ImpactSection from "./components/home/ImpactSection";
import TechStackSection from "./components/home/TechStackSection";
import FooterCTA from "./components/layout/FooterCTA";

export default function Home() {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <FeaturedProjects />
      <WorkAndInsight />
      <Specializations />
      <ImpactSection />
      <TechStackSection />
      <FooterCTA />
      <Footer />
    </div>
  );
}
