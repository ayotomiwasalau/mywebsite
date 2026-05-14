import React from "react";
import ContactOptionBottom from "./ContactOptionBottom";
import ContactOptionTop from "./ContactOptionTop";

const ContactOptions = () => {
  return (
    <section
      className="bg-white px-4 py-12 sm:px-8 md:py-16"
      aria-labelledby="contact-options-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="contact-options-heading"
          className="mb-10 font-[family-name:var(--font-geist-mono)] text-xl font-bold text-black md:mb-12 md:text-2xl lg:text-3xl"
        >
          Options
        </h2>

        <ContactOptionTop />

        <div className="my-12 border-t border-[#e5e5e5] md:my-14" aria-hidden />

        <ContactOptionBottom />
      </div>
    </section>
  );
};

export default ContactOptions;
