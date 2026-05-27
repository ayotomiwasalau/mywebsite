"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FeatProjectTags } from "./FeatProjectTags";

export interface FeatProjectCardProps {
  imageSrc: string;
  imageAlt: string;
  timeLabel: string;
  title: string;
  description: string;
  tags: string[];
  caseStudyHref: string;
  index: number;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

const FeatProjectCard: React.FC<FeatProjectCardProps> = ({
  imageSrc,
  imageAlt,
  timeLabel,
  title,
  description,
  tags,
  caseStudyHref,
  index,
}) => {
  const reduceMotion = useReducedMotion();
  const backgroundClass = index % 2 === 0 ? "bg-[#E6A892]" : "bg-[#BBD5DC]";

  return (
    <motion.article
      className={`flex h-full flex-col overflow-hidden rounded-2xl ${backgroundClass} shadow-sm`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.5, delay: index * 0.1, ease: easeOut }
      }
      whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-t-2xl">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <p className="text-sm text-[#2a2f38]">{timeLabel}</p>

        <h2 className="text-xl font-bold leading-snug text-[#1a2332] sm:text-2xl">
          {title}
        </h2>

        <div className="flex flex-col gap-2 text-sm text-[#2a2f38]">
          <p>
            <span className="font-bold">Description:</span> {description}
          </p>
        </div>

        <FeatProjectTags tags={tags} />

        <Link
          href={caseStudyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full rounded-full bg-[#D16B7A] py-3 text-center text-base font-medium text-white transition-transform hover:scale-[1.02] hover:opacity-90 active:scale-[0.97]"
        >
          View Post
        </Link>
      </div>
    </motion.article>
  );
};

export default FeatProjectCard;
