"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const buttonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#E06377] px-6 py-3 text-center text-base font-medium text-white transition hover:opacity-90";

const FooterCTA = () => {
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  const isContact = pathname === "/contact";

  const primaryHref = isContact ? "/work" : "/contact";
  const primaryLabel = isContact ? "View my works" : "Contact me";

  const secondaryHref = isAbout ? "/work" : "/about";
  const secondaryLabel = isAbout ? "View my works" : "Learn more";

  return (
    <section className="w-full bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row md:flex-wrap md:justify-center md:gap-5 lg:gap-6">
        <h2 className="text-center text-xl font-bold text-black md:text-lg">
          Let&apos;s Build Something Scalable
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:gap-3 lg:gap-4">
          <Link href={primaryHref} className={buttonClass}>
            {primaryLabel}
          </Link>
          <Link href={secondaryHref} className={buttonClass}>
            {secondaryLabel}
          </Link>
          <Link href="/games" className={buttonClass}>
            Play my games
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
