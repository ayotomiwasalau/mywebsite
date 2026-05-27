"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

type RowVariant = "salmon" | "blue";

const boxBg: Record<RowVariant, string> = {
  salmon: "bg-[#f2a28c]",
  blue: "bg-[#cedde6]",
};

export interface ContactLinkRow {
  id: string;
  iconSrc: string;
  iconAlt: string;
  label: string;
  /** Shown inside the value box */
  displayValue: string;
  /** Copied to clipboard */
  copyValue: string;
  href: string;
  variant: RowVariant;
}

const DEFAULT_ROWS: ContactLinkRow[] = [
  {
    id: "email",
    iconSrc: "/stacklogo/contact/email.svg",
    iconAlt: "",
    label: "Email:",
    displayValue: "ayotomiwasalau@gmail.com",
    copyValue: "ayotomiwasalau@gmail.com",
    href: "mailto:ayotomiwasalau@gmail.com",
    variant: "salmon",
  },
  {
    id: "linkedin",
    iconSrc: "/stacklogo/contact/linkedin.svg",
    iconAlt: "LinkedIn",
    label: "Linkedin:",
    displayValue: "linkedin.com/in/ayotomiwa-salau",
    copyValue: "https://www.linkedin.com/in/ayotomiwa-salau",
    href: "https://www.linkedin.com/in/ayotomiwa-salau",
    variant: "blue",
  },
  {
    id: "github",
    iconSrc: "/stacklogo/contact/github.svg",
    iconAlt: "GitHub",
    label: "Github:",
    displayValue: "github.com/ayotomiwasalau",
    copyValue: "https://github.com/ayotomiwasalau",
    href: "https://github.com/ayotomiwasalau",
    variant: "salmon",
  },
  {
    id: "youtube",
    iconSrc: "/stacklogo/contact/youtube.svg",
    iconAlt: "YouTube",
    label: "Youtube:",
    displayValue: "youtube.com/@ayotomiwasalau",
    copyValue: "https://www.youtube.com/@ayotomiwasalau",
    href: "https://www.youtube.com/@ayotomiwasalau",
    variant: "blue",
  },
];

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

const ContactOptionTop: React.FC<{ rows?: ContactLinkRow[] }> = ({
  rows = DEFAULT_ROWS,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((id: string, value: string) => {
    copyToClipboard(value).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    });
  }, []);

  return (
    <ul className="flex flex-col gap-8 md:gap-10" role="list">
      {rows.map((row) => (
        <li
          key={row.id}
          className="grid min-w-0 grid-cols-[2.25rem_5.5rem_minmax(0,1fr)_2.25rem] items-center gap-x-2 sm:grid-cols-[2.75rem_7rem_minmax(0,1fr)_2.75rem] sm:gap-x-3 md:grid-cols-[3rem_8rem_minmax(0,1fr)_3rem] md:gap-x-4"
        >
          {/* Col 1: icon — fixed column width */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center justify-self-center rounded-md border-2 border-[#478BA2] bg-white sm:h-11 sm:w-11 md:h-12 md:w-12">
            <Image
              src={row.iconSrc}
              alt={row.iconAlt}
              width={row.id === "email" ? 22 : 28}
              height={row.id === "email" ? 22 : 28}
              className="h-[18px] w-[18px] object-contain sm:h-7 sm:w-7 md:h-8 md:w-8"
              unoptimized
            />
          </div>

          {/* Col 2: label — fixed column so value boxes line up */}
          <span className="min-w-0 whitespace-nowrap text-[11px] text-black sm:text-sm md:text-base lg:text-lg">
            {row.label}
          </span>

          {/* Col 3: value + copy — same left/right edge on every row */}
          <div
            className={`flex min-w-0 w-full items-center gap-1.5 rounded-lg px-3 py-2.5 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2.5 md:px-4 md:py-3.5 ${boxBg[row.variant]}`}
          >
            <span className="min-w-0 flex-1 truncate text-xs text-[#333333] md:text-base lg:text-lg xl:text-xl">
              {row.displayValue}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(row.id, row.copyValue)}
              className="shrink-0 rounded p-1 text-[#333333] hover:bg-black/5 sm:p-1"
              aria-label={`Copy ${row.label.replace(":", "")}`}
            >
              <ClipboardDocumentIcon className="h-[18px] w-[18px] sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            {copiedId === row.id ? (
              <span className="hidden shrink-0 text-xs text-green-700 sm:inline md:text-sm">
                Copied
              </span>
            ) : null}
          </div>

          {/* Col 4: external link — fixed column width */}
          <a
            href={row.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 shrink-0 items-center justify-center justify-self-center text-[#333333] hover:text-[#478BA2] sm:h-11 sm:w-11 md:h-12 md:w-12"
            aria-label={`Open ${row.label.replace(":", "")} in new tab`}
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </a>
        </li>
      ))}
    </ul>
  );
};

export default ContactOptionTop;
