"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const heroLinks = [
  { text: "Contact me", url: "/contact" },
  { text: "More about me", url: "/about" },
  { text: "Subscribe to my newsletter", url: "#subscription-form" },
  {
    text: "Request for proposal",
    url: "https://tiptier.co",
    openInNewTab: true,
  },
  { text: "Play my games", url: "/games" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: easeOut },
});

const HeroSection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {reduceMotion ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#b8d0db] to-[#f0a191]"
        />
      ) : (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#b8d0db] via-[#d4c4c0] to-[#f0a191]"
          style={{ backgroundSize: "200% 100%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10">
        <div className="flex w-full max-w-2xl flex-col justify-center gap-6 text-[#2f3945] lg:min-h-0 lg:flex-1 lg:gap-8">
          <motion.div
            className="text-xl leading-relaxed sm:text-2xl md:text-2xl"
            {...(reduceMotion ? {} : fadeUp(0))}
          >
            <p className="font-normal">
              I architect and build{" "}
              <span className="font-bold">data platforms and AI products</span> businesses depend on:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 sm:pl-8">
              <li>
                <span className="font-bold">data pipelines</span> that{" "}
                <span className="font-bold">scale cheaply</span> without breaking
              </li>
              <li>
                 <span className="font-bold">AI-powered dashboards</span> that turn data into{" "}
                <span className="font-bold">growth decisions</span>
              </li>
              <li>
                <span className="font-bold">operations</span>{" "}
                <span className="font-bold">automated</span> end to end with{" "}
                <span className="font-bold">AI agents</span>
              </li>
            </ul>
          </motion.div>

          <motion.p
            className="text-lg font-semibold leading-snug text-[#2c3746] sm:text-lg md:text-xl"
            {...(reduceMotion ? {} : fadeUp(0.12))}
          >
            real-time / batch pipelines - analytics - streaming - applied AI - data migration - warehousing -
            agentic workflows
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 pt-2 lg:pt-0"
            {...(reduceMotion ? {} : fadeUp(0.24))}
          >
            {heroLinks.map(({ text, url, openInNewTab }) => (
              <Link
                key={url}
                href={url}
                target={openInNewTab ? "_blank" : undefined}
                rel={openInNewTab ? "noopener noreferrer" : undefined}
                className="rounded-xl bg-[#d95673] px-6 py-2.5 text-base text-white shadow-sm transition hover:scale-[1.03] hover:opacity-90 active:scale-[0.98]"
              >
                {text}
              </Link>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="flex w-full max-w-md shrink-0 items-center justify-center lg:w-auto"
          initial={reduceMotion ? false : { opacity: 0, x: 40 }}
          animate={
            reduceMotion
              ? { opacity: 1, x: 0 }
              : { opacity: 1, x: 0, y: [0, -10, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, delay: 0.2, ease: easeOut },
                  x: { duration: 0.6, delay: 0.2, ease: easeOut },
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                  },
                }
          }
        >
          <Image
            src="/landimg.png"
            alt="Hero Image"
            width={500}
            height={500}
            className="h-auto w-full max-w-[min(100%,28rem)]"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
