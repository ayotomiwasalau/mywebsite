import React from "react";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import ContactHero from "../components/contact/ContactHero";
import ContactMessageForm from "../components/contact/ContactMessageForm";
import ContactOptions from "../components/contact/ContactOptions";
import FooterCTA from "../components/layout/FooterCTA";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <ContactHero />
      <ContactOptions />
      <ContactMessageForm />
      <FooterCTA />
      <Footer />
    </div>
  );
}
