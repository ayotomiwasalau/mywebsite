import Image from "next/image";
import Link from "next/link";

export interface GamesCardProps {
  title: string;
  description: string;
  imageSrc: string;
  playHref: string;
  imageAlt?: string;
}

export default function GamesCard({
  title,
  description,
  imageSrc,
  playHref,
  imageAlt,
}: GamesCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-[#1a202c] shadow-md transition hover:shadow-lg">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#2d3748]">
        <Image
          src={imageSrc}
          alt={imageAlt ?? title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <h2 className="font-[family-name:var(--font-geist-sans)] text-xl font-bold leading-tight text-white md:text-2xl">
          {title}
        </h2>
        <p className="font-[family-name:var(--font-geist-sans)] text-sm leading-relaxed text-gray-300">
          {description}
        </p>
        <Link
          href={playHref}
          className="font-[family-name:var(--font-geist-sans)] mt-auto flex w-full items-center justify-center rounded-lg bg-[#d55f6f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c94f60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Play →
        </Link>
      </div>
    </article>
  );
}
