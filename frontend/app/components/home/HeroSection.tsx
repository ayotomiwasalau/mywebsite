"use client";

import Link from "next/link";
import Image from "next/image";

const heroLinks = [
  {
    text: "Contact me",
    url: "/contact",
  },
  {
    text: "Learn more about me",
    url: "/about",
  },
  {
    text: "Subscribe to my newsletter",
    url: "#subscription-form",
  },
  {
    text: "Request for proposal",
    url: "https://tiptier.co",
    openInNewTab: true,
  },
];

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-[#b8d0db] to-[#f0a191] font-sans">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10">
        <div className="flex w-full max-w-2xl flex-col justify-center gap-6 text-[#2f3945] lg:min-h-0 lg:flex-1 lg:gap-8">
          <p className="text-base leading-relaxed sm:text-lg md:text-2xl">
            I design and build scalable <span className="italic">data and AI systems</span>, from <span className="italic">ingestion
            pipelines</span> to <span className="italic">real-time processing</span>, <span className="italic">data warehousing</span> and <span className="italic">agentic workflows</span> that
            process millions of events in real-time and <span className="italic">power business decisions</span>.
          </p>

          <p className="text-lg font-semibold leading-snug text-[#2c3746] sm:text-xl md:text-2xl">
    Real-time/Batch pipelines, Big data systems and Agentic workflows</p>

          <div className="flex flex-wrap gap-4 pt-2 lg:pt-0">
            {heroLinks.map(({ text, url, openInNewTab }) => (
              <Link
                key={url}
                href={url}
                target={openInNewTab ? "_blank" : undefined}
                rel={openInNewTab ? "noopener noreferrer" : undefined}
                className="rounded-xl bg-[#d95673] px-6 py-2.5 text-base text-white shadow-sm transition hover:opacity-90"
              >
                {text}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-md shrink-0 items-center justify-center lg:w-auto">
          <Image
            src="/landimg.png"
            alt="Hero Image"
            width={500}
            height={500}
            className="h-auto w-full max-w-[min(100%,28rem)]"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;