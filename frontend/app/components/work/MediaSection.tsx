import Link from "next/link";
import React from "react";
import mediaData from "../../data/media.json";
import MediaComponent, { MediaEntry } from "./MediaComponent";

const CHANNEL_URL = "https://www.youtube.com/@ayotomiwasalau";

const items = mediaData as MediaEntry[];

const MediaSection: React.FC = () => {
  return (
    <section
      className="mx-auto mt-14 max-w-5xl border-t border-[#e8edf1] px-4 pb-16 pt-12 md:mt-16 md:pb-20 md:pt-14"
      aria-labelledby="media-section-heading"
    >
      <h2
        id="media-section-heading"
        className="mb-2 text-2xl font-bold text-[#2D3748] md:mb-3 md:text-3xl"
      >
        Media
      </h2>
      <p className="mb-8 text-[#666666] leading-relaxed md:mb-10">
        Coding walkthroughs, demos, and project deep-dives — videos & screencasts on building data and AI solutions.
      </p>
 

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {items.map((entry) => (
          <MediaComponent key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="mt-8 flex justify-center md:mt-10">
        <Link
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#4A8EA6] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d05566] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DE6272] focus-visible:ring-offset-2 md:px-8 md:py-3 md:text-base"
        >
          See more
        </Link>
      </div>
    </section>
  );
};

export default MediaSection;
