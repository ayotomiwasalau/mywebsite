"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import NavBar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";
import GamesCard from "../components/games/GamesCard";

type GameItem = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  playHref: string;
  /** Lower = older for "Latest" sort */
  order: number;
};

const GAMES: GameItem[] = [
  {
    id: "1",
    title: "Tommy Jumper",
    description:
      "Help Tommy navigate the treacherous path to reach his goal",
    imageSrc: "/stacklogo/techlogo/python.png",
    playHref: "#",
    order: 3,
  },
  {
    id: "2",
    title: "PacMan",
    description: "Pacman is hungry, feed him",
    imageSrc: "/stacklogo/techlogo/java.svg",
    playHref: "#",
    order: 2,
  },
  {
    id: "3",
    title: "Snake Zig",
    description: "Ziggy want to navigate to his resource, help him.",
    imageSrc: "/stacklogo/techlogo/gcp.svg",
    playHref: "#",
    order: 1,
  },
];

type SortOption = "latest" | "oldest" | "title";

function sortGames(list: GameItem[], sort: SortOption): GameItem[] {
  const copy = [...list];
  if (sort === "latest") {
    return copy.sort((a, b) => b.order - a.order);
  }
  if (sort === "oldest") {
    return copy.sort((a, b) => a.order - b.order);
  }
  return copy.sort((a, b) => a.title.localeCompare(b.title));
}

export default function GamesPage() {
  const [sort, setSort] = useState<SortOption>("latest");
  const sortedGames = useMemo(() => sortGames(GAMES, sort), [sort]);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="relative h-auto bg-gradient-to-r from-[#BBD5DC] to-[#F3A593]">
        <div className="mx-auto flex max-w-5xl flex-col items-center space-y-8 px-4 py-20 pb-[7rem] sm:px-8 md:flex-row md:items-center md:space-x-16 md:space-y-4">
          <div className="flex max-w-xl flex-col gap-5 md:gap-6">
            <h1 className="text-3xl font-bold leading-tight text-[#333333] md:text-4xl lg:text-[2.5rem]">
              Ayotoms Wall of Vibecoded Games
            </h1>
            <p className="text-lg font-light leading-relaxed text-[#333333] md:text-xl">
              Small experimental games built for fun, creativity, and exploring
              ideas beyond production systems
            </p>
          </div>

          <div className="relative w-full max-w-md shrink-0 md:max-w-lg">
            <Image
              src="/stacklogo/games/gamesheader.svg"
              alt="Games header illustration"
              width={560}
              height={360}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full rotate-180 transform overflow-hidden leading-none">
          <svg
            className="relative block h-[150px] w-[calc(142%+1.3px)]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </div>

      <section className="bg-white px-4 pb-20 pt-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Sort:</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none rounded-lg border-0 bg-[#4a869a] py-2.5 pl-4 pr-10 text-sm font-medium text-white shadow-sm outline-none ring-0 transition hover:bg-[#3d7588] focus-visible:ring-2 focus-visible:ring-[#4a869a] focus-visible:ring-offset-2"
                aria-label="Sort games"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sortedGames.map((game) => (
              <GamesCard
                key={game.id}
                title={game.title}
                description={game.description}
                imageSrc={game.imageSrc}
                playHref={game.playHref}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
