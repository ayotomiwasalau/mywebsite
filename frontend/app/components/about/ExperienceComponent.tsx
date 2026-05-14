import Image from "next/image";
import Link from "next/link";
import React from "react";

export interface ExperienceEntry {
  company: string;
  /** Public company site opened in a new tab when the company name is clicked. */
  companyUrl: string;
  role: string;
  dateRange: string;
  timezone: string;
  logoSrc: string;
  highlights: string[];
}

interface ExperienceComponentProps {
  entry: ExperienceEntry;
}

const ExperienceComponent: React.FC<ExperienceComponentProps> = ({ entry }) => {
  return (
    <article className="grid w-full min-w-0 max-w-full grid-cols-[auto,1fr] gap-x-4 gap-y-3 md:gap-x-6 md:gap-y-1.5 lg:gap-x-8">
      <div className="row-start-1 col-start-1 self-start">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#f0f0f0] md:h-20 md:w-20 lg:h-[5.5rem] lg:w-[5.5rem]">
          <Image
            src={entry.logoSrc}
            alt={entry.company}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </div>

      <div className="row-start-1 col-start-2 min-w-0 self-start">
        <p className="text-[#333333]">
          <Link
            href={entry.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-[#333333] underline decoration-[#333333] decoration-solid underline-offset-2 visited:text-[#333333] hover:text-[#333333] hover:underline md:text-base lg:text-lg"
          >
            {entry.company}
          </Link>
          <span className="font-mono text-sm md:text-base lg:text-lg">
            {" "}
            – {entry.role}
          </span>
        </p>
        <p className="mt-1 font-mono text-xs text-[#333333] md:mt-1.5 md:text-sm lg:text-base">
          {entry.dateRange}
        </p>
        <p className="font-mono text-xs text-[#666666] md:text-sm lg:text-base">
          {entry.timezone}
        </p>
      </div>

      <ul className="col-span-2 row-start-2 w-full min-w-0 list-outside list-disc space-y-1.5 pl-5 font-mono text-xs leading-relaxed text-[#333333] marker:text-[#333333] md:col-span-1 md:col-start-2 md:row-start-2 md:space-y-2 md:pl-5 md:text-sm lg:text-base">
        {entry.highlights.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  );
};

export default ExperienceComponent;
