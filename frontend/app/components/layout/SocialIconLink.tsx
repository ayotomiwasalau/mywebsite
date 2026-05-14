import React, { ReactNode } from "react";
import Link from "next/link";

interface SocialIconLinkProps {
  href: string;
  label: string;
  iconColor: string;
  children: ReactNode;
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({ href, label, children, iconColor }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:opacity-50 group relative"
    aria-label={label}
  >
    <span className="rounded-xl px-2 py-1 text-white flex items-center">
      <span className={`text-3xl ${iconColor} px-2`}>
        {children}
      </span>
      {/* Tooltip above the icon */}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-[#333333] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {label}
      </span>
    </span>
  </Link>
);

export default SocialIconLink;