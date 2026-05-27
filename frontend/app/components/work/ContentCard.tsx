import React from "react";
import Link from "next/link";
import { getTimeDifference, urlCleaner } from "../utils/tools";
import { motion } from "framer-motion";

interface ContentCardProps {
  imageSrc: string;
  title: string;
  timeAgo: string;
  tags: string[];
  index: number;
  id: string;
  slug?: string;
  /** Drives badge label and fallback blurb. Content panel color alternates by card index (salmon / blue-grey). */
  kind?: "blog" | "project";
  /** One–two line summary; monospace styling below the title. */
  description?: string;
  href?: string;
}

const contentBg: Record<"blog" | "project", string> = {
  blog: "bg-[#f2a28c]",
  project: "bg-[#cedde6]",
};

function shortLineBelowTitle(
  description: string | undefined,
  kind: "blog" | "project",
  tags: string[]
): string {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;

  const firstTag = tags[0]
    ? tags[0].startsWith("##")
      ? tags[0].slice(2)
      : tags[0]
    : null;

  if (kind === "project") {
    return firstTag
      ? `Build notes and outcomes around ${firstTag}.`
      : "Architecture, stack choices, and delivery highlights.";
  }
  return firstTag
    ? `Deep dive on ${firstTag} and related engineering lessons.`
    : "Notes from production: tradeoffs, pitfalls, and what worked.";
}

const ContentCard: React.FC<ContentCardProps> = ({
  imageSrc,
  title,
  timeAgo,
  tags,
  index,
  id,
  slug,
  kind,
  description,
  href: _href,
}) => {
  const kindResolved: "blog" | "project" = kind ?? "blog";

  const resolvedSlug = slug ?? urlCleaner(title);
  const destinationHref =
    kindResolved === "project"
      ? `/work/projects/${resolvedSlug}`
      : `/work/blogs/${resolvedSlug}`;

  const tagLabel = (raw: string) =>
    raw.startsWith("##") ? raw.slice(2) : raw;

  const footerTags = tags.slice(0, 3);
  const blurb = shortLineBelowTitle(description, kindResolved, tags);

  /** Alternate salmon / blue-grey by position in the grid (not by kind). */
  const panelBgClass =
    index % 2 === 0 ? contentBg.blog : contentBg.project;

  return (
    <Link
      href={destinationHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl shadow-sm transition hover:opacity-95"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99, transition: { duration: 0.1 } }}
        transition={{ duration: 0.35 }}
        className="flex h-full flex-col"
      >
        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[#f0f0f0]">
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className={`flex flex-1 flex-col gap-3.5 rounded-b-xl px-5 pb-6 pt-5 sm:gap-4 sm:px-6 ${panelBgClass}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span suppressHydrationWarning className="text-sm text-[#333333]">
              {getTimeDifference(timeAgo)}
            </span>
            <span className="w-fit rounded-md bg-[#4a869a] px-2.5 py-1 text-xs font-medium lowercase text-white">
              {kindResolved}
            </span>
          </div>
          <h3 className="text-lg font-semibold leading-snug text-[#333333]">
            {title}
          </h3>
          <p className="line-clamp-3 text-xs leading-relaxed text-[#333333] sm:text-sm">
            {blurb}
          </p>
          <div className="mt-0.5 flex flex-wrap gap-2 pt-1">
            {footerTags.map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className="rounded-lg bg-[#d95b74] px-2.5 py-1 text-xs font-medium text-white"
              >
                {tagLabel(tag)}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ContentCard;
