import React from "react";

/**
 * Hero strip: gradient background, elevated white card with title + message.
 */
const ContactHero = () => {
  return (
    <section
      className="w-full bg-gradient-to-r from-[#BBD5DC] to-[#F3A593] px-4 py-10 md:px-8 md:py-14"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto flex max-w-3xl justify-center">
        <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_6px_28px_rgba(0,0,0,0.07)] sm:gap-5 sm:p-8 md:rounded-3xl md:p-10">
          <h2
            id="contact-heading"
            className="text-xl font-bold text-black sm:text-2xl md:text-3xl"
          >
            Contact
          </h2>

          <div className="flex flex-col items-center gap-4 px-1 pb-1 text-center sm:gap-5 sm:px-2">
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-black sm:text-base md:text-lg">
              <span className="block">
                Let&apos;s build scalable systems or discuss
              </span>
              <span className="block">opportunities</span>
            </p>
            <a
              href="#message-form"
              className="inline-flex items-center justify-center rounded-full bg-[#DE5B6F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d7a90] sm:px-8 sm:py-3 sm:text-base"
            >
              Send me a message
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
