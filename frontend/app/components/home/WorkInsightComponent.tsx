"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface WorkInsightEntry {
  id: string;
  type: "blog" | "project";
  imageSrc: string;
  imageAlt: string;
  timeLabel: string;
  title: string;
  summary: string;
  tags: string[];
  href: string;
}

interface WorkInsightComponentProps {
  entry: WorkInsightEntry;
  index: number;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

const viewButtonClass =
  "inline-flex items-center justify-center rounded-full bg-[#D65A78] text-white transition-transform hover:scale-[1.02] hover:opacity-90 active:scale-[0.97]";

const WorkInsightComponent: React.FC<WorkInsightComponentProps> = ({
  entry,
  index,
}) => {
  const reduceMotion = useReducedMotion();
  const bgClass = index % 2 === 0 ? "bg-[#BBD5DC]" : "bg-[#E6A892]";

  const tagList = (
    <div className="mt-1 flex flex-wrap gap-2">
      {entry.tags.map((tag) => (
        <span
          key={`${entry.id}-${tag}`}
          className="rounded-xl bg-[#438CAB] px-2 py-0.5 text-[10px] text-white sm:px-2.5 sm:text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  );

  return (
    <motion.article
      className={`rounded-2xl p-4 md:p-5 ${bgClass}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.5, delay: index * 0.1, ease: easeOut }
      }
      whileHover={reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
    >
      {/* Mobile / tablet: image + header row, then description + view + tags full width below */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex flex-row items-start gap-3">
          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-36">
            <Image
              src={entry.imageSrc}
              alt={entry.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 40vw, 288px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="mb-1 inline-flex w-fit rounded-full bg-[#D65A78] px-2.5 py-0.5 text-[10px] text-white">
              {entry.type}
            </span>
            <p className="text-xs text-[#334155] sm:text-sm">{entry.timeLabel}</p>
            <h3 className="mt-1 min-w-0 text-sm font-medium leading-tight text-[#243344] sm:text-base">
              {entry.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 text-xs text-[#2d3d4e] sm:text-sm">
              {entry.summary}
            </p>
            <Link
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${viewButtonClass} h-8 w-16 shrink-0 px-2 text-xs sm:h-9 sm:w-20 sm:text-sm`}
            >
              View
            </Link>
          </div>
          {tagList}
        </div>
      </div>

      {/* Desktop: original horizontal layout */}
      <div className="hidden gap-4 lg:flex lg:flex-row lg:items-center">
        <div className="relative h-32 w-[16rem] shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={entry.imageSrc}
            alt={entry.imageAlt}
            fill
            className="object-cover"
            sizes="288px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="mb-1 inline-flex w-fit rounded-full bg-[#D65A78] px-2.5 py-0.5 text-[10px] text-white">
            {entry.type}
          </span>
          <p className="text-xs text-[#334155] sm:text-sm">{entry.timeLabel}</p>
          <h3 className="mt-1 min-w-0 text-lg font-medium leading-tight text-[#243344]">
            {entry.title}
          </h3>
          <p className="mt-1 text-sm text-[#2d3d4e]">{entry.summary}</p>
          {tagList}
        </div>

        <Link
          href={entry.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${viewButtonClass} h-10 w-[10rem] shrink-0 px-6 text-lg`}
        >
          View
        </Link>
      </div>
    </motion.article>
  );
};

export default WorkInsightComponent;
