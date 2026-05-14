import { PlayIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export interface MediaEntry {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailSrc: string;
}

interface MediaComponentProps {
  entry: MediaEntry;
}

const MediaComponent: React.FC<MediaComponentProps> = ({ entry }) => {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-[#4A8B9C] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <Link
        href={entry.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full shrink-0 outline-none ring-inset focus-visible:ring-2 focus-visible:ring-[#4A8B9C]"
        aria-label={`Watch on YouTube: ${entry.title}`}
      >
        <div className="relative aspect-video w-full bg-[#e8edf1]">
          <Image
            src={entry.thumbnailSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 pb-2 md:px-4 md:pt-4">
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-[#2D3748] md:text-base">
          {entry.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#4a5568] md:text-sm">
          {entry.description}
        </p>
      </div>

      <div className="mt-auto px-2 pb-2 md:px-2.5 md:pb-2.5">
        <Link
          href={entry.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-[#d95b74] py-2.5 text-white transition hover:bg-[#3d7a8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A8B9C] focus-visible:ring-offset-2 md:py-3"
        >
          <PlayIcon className="h-5 w-5 shrink-0" aria-hidden />
          <span className="sr-only">Play on YouTube</span>
        </Link>
      </div>
    </article>
  );
};

export default MediaComponent;
