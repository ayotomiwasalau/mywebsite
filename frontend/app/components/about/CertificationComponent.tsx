"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export interface CertificationEntry {
  id: string;
  title: string;
  certificateUrl: string;
  imageSrc: string;
}

interface CertificationComponentProps {
  entry: CertificationEntry;
}

const CertificationComponent: React.FC<CertificationComponentProps> = ({
  entry,
}) => {
  const [imageOk, setImageOk] = useState(true);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border-2 border-[#F3A593] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="relative min-h-0 w-full flex-1 bg-white">
        <div className="relative aspect-[16/10] min-h-[10.5rem] w-full md:min-h-[12.5rem] lg:min-h-[13.5rem] xl:min-h-[15rem]">
          {imageOk ? (
            <Image
              src={entry.imageSrc}
              alt={`Certificate: ${entry.title}`}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 50vw, (max-width: 1023px) 40vw, 30vw"
              onError={() => setImageOk(false)}
            />
          ) : (
            <div className="flex aspect-[16/10] min-h-[10.5rem] w-full items-center justify-center px-4 text-center text-xs text-[#888] md:min-h-[12.5rem] lg:min-h-[13.5rem] xl:min-h-[15rem]">
              Add image: <span className="font-mono">{entry.imageSrc}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-2 pb-2 pt-2 md:px-2.5 md:pb-2.5 md:pt-2.5">
        <Link
          href={entry.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full bg-[#D56A78] py-2 text-center text-sm font-medium text-white shadow-[0_1px_0_rgba(0,0,0,0.06)] transition hover:bg-[#c95e6c] active:bg-[#be5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D56A78]/50 focus-visible:ring-offset-2 md:py-2.5"
        >
          View Certificate
        </Link>
      </div>
    </article>
  );
};

export default CertificationComponent;
