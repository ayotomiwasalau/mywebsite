import Image from "next/image";
import Link from "next/link";
import React from "react";

type CardVariant = "salmon" | "blue";

const cardBg: Record<CardVariant, string> = {
  salmon: "bg-[#f2a28c]",
  blue: "bg-[#cedde6]",
};

export interface SocialCardItem {
  id: string;
  name: string;
  iconSrc: string;
  href: string;
  variant: CardVariant;
}

const DEFAULT_SOCIALS: SocialCardItem[] = [
  {
    id: "x",
    name: "X",
    iconSrc: "/stacklogo/contact/x.svg",
    href: "https://x.com/ayotomiwasalau",
    variant: "blue",
  },
  {
    id: "instagram",
    name: "Instagram",
    iconSrc: "/stacklogo/contact/instagram.svg",
    href: "https://www.instagram.com/ayotomiwasalau",
    variant: "salmon",
  },
  {
    id: "tiktok",
    name: "Tiktok",
    iconSrc: "/stacklogo/contact/tiktok.svg",
    href: "https://www.tiktok.com/@ayotomiwasalau",
    variant: "blue",
  },
];

const ContactOptionBottom: React.FC<{ items?: SocialCardItem[] }> = ({
  items = DEFAULT_SOCIALS,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-w-[10rem] flex-1 items-center gap-3 rounded-2xl px-4 py-3 transition hover:opacity-90 sm:max-w-[14rem] md:gap-4 md:px-5 md:py-4 ${cardBg[item.variant]}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white md:h-12 md:w-12">
            <Image
              src={item.iconSrc}
              alt=""
              width={24}
              height={24}
              className="object-contain md:h-7 md:w-7"
              unoptimized
            />
          </span>
          <span className="text-sm font-medium text-black md:text-base lg:text-lg">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default ContactOptionBottom;
