"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
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
  const backgroundClass = index % 2 === 0 ? "bg-[#E6A892]" : "bg-[#BBD5DC]";

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl ${backgroundClass} shadow-sm`}
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
          className="mt-auto w-full rounded-full bg-[#D16B7A] py-3 text-center text-base font-medium text-white transition hover:opacity-90"
        >
          View Case Study
        </Link>
      </div>
    </article>
  );
};

export default FeatProjectCard;
