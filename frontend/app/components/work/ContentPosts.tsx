"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import { normalizeTag } from "@lib/tags";
import Card from "./ContentCard";
import { PostsSchema } from "../utils/interface";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

interface WorkApiItem {
  type: "blog" | "project";
  item: {
    id: string;
    slug: string;
    title: string;
    header_img_url: string;
    created_on: string;
    tags: string[];
    href: string;
    description: string;
  };
}

interface WorkApiResponse {
  items: WorkApiItem[];
}

/** Primary filters — always shown above topic tags. */
const PRIMARY_FILTER_TAGS = ["All", "Projects", "Blogs"] as const;

type PrimaryFilterTag = (typeof PRIMARY_FILTER_TAGS)[number];
type FilterTag = PrimaryFilterTag | string;

type SortOption = "latest" | "oldest" | "title";

function isPrimaryFilterTag(tag: FilterTag): tag is PrimaryFilterTag {
  return (PRIMARY_FILTER_TAGS as readonly string[]).includes(tag);
}

const ContentPosts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<FilterTag>("All");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<PostsSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${FASTAPI_ROUTE_BASE}/work?per_page=100`);
        const data: WorkApiResponse = await response.json();
        const mapped: PostsSchema[] = (data.items ?? []).map((entry) => ({
          id: entry.item.id,
          slug: entry.item.slug,
          title: entry.item.title,
          imageSrc: entry.item.header_img_url,
          timeAgo: entry.item.created_on,
          tags: entry.item.tags ?? [],
          filepath_md: "",
          likes: 0,
          kind: entry.type,
          description: entry.item.description,
          href: entry.item.href,
        }));
        setPosts(mapped);
      } catch (error) {
        console.error("Error loading work posts:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTagClick = (tag: FilterTag) => {
    setSelectedTag(tag);
  };

  const topicFilterTags = useMemo(() => {
    const seen = new Map<string, string>();

    for (const post of posts) {
      for (const raw of post.tags ?? []) {
        const label = normalizeTag(raw);
        if (!label) continue;
        const key = label.toLowerCase();
        if (!seen.has(key)) seen.set(key, label);
      }
    }

    return [...seen.values()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [posts]);

  const filteredCards = useMemo(() => {
    return posts.filter((card) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        card.title.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesTag = true;
      if (selectedTag === "All") {
        matchesTag = true;
      } else if (selectedTag === "Projects") {
        matchesTag = card.kind === "project";
      } else if (selectedTag === "Blogs") {
        matchesTag = card.kind === "blog";
      } else {
        const selected = normalizeTag(selectedTag).toLowerCase();
        matchesTag = card.tags.some(
          (tagItem) => normalizeTag(tagItem).toLowerCase() === selected
        );
      }

      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, selectedTag]);

  const sortedCards = useMemo(() => {
    const copy = [...filteredCards];
    copy.sort((a, b) => {
      if (sortBy === "latest") {
        return (
          new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.timeAgo).getTime() - new Date(b.timeAgo).getTime()
        );
      }
      return a.title.localeCompare(b.title, undefined, {
        sensitivity: "base",
      });
    });
    return copy;
  }, [filteredCards, sortBy]);

  const cardsPerPage = 9;
  const totalPages = Math.max(
    1,
    Math.ceil(sortedCards.length / cardsPerPage)
  );

  const currentCards =
    searchTerm.trim() === ""
      ? sortedCards.slice(
          (currentPage - 1) * cardsPerPage,
          currentPage * cardsPerPage
        )
      : sortedCards;

  const handlePreviousPage = () => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-white">
        <p className="text-[#666666]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8">
      <h2 className="mt-8 mb-4 text-2xl font-bold text-[#1a1a2e]">Work</h2>
      <p className="mb-8 max-w-5xl text-[#666666] leading-relaxed">
        Projects, case studies, and engineering write-ups across data platforms,
        AI systems, and cloud architecture.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]"
          aria-hidden
        >
          <i className="fa-solid fa-magnifying-glass" />
        </span>
        <input
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full rounded-xl border-0 bg-[#e8edf1] py-3 pl-11 pr-4 text-[#333333] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#478BA2]/40"
          aria-label="Search posts"
        />
      </div>

      

      {/* Tag filters: primary row, then topics */}
      <div className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Scope">
          {PRIMARY_FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-[#DE5B6F] text-white outline outline-2 outline-offset-2 outline-[#478BA2]"
                  : "bg-[#DE5B6F] text-white hover:bg-[#c94d60]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {topicFilterTags.length > 0 ? (
          <div
            className="flex max-h-[10.5rem] flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1"
            role="group"
            aria-label="Topics"
          >
            {topicFilterTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !isPrimaryFilterTag(selectedTag) &&
                  normalizeTag(selectedTag).toLowerCase() ===
                    normalizeTag(tag).toLowerCase()
                    ? "bg-[#DE5B6F] text-white outline outline-2 outline-offset-2 outline-[#478BA2]"
                    : "bg-[#DE5B6F] text-white hover:bg-[#c94d60]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Sort + results */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <label className="flex flex-wrap items-center gap-2 text-[#333333]">
          <span>Sort:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortOption)
              }
              className="appearance-none rounded-lg bg-[#478BA2] py-2 pl-3 pr-9 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#478BA2]/50"
              aria-label="Sort posts"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white">
              <i className="fa-solid fa-chevron-down text-xs" aria-hidden />
            </span>
          </div>
        </label>
        <p className="text-[#333333]">
          Results:{" "}
          <span className="font-bold">{filteredCards.length}</span>
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentCards.map((card, index) => (
          <Card
            key={card.id}
            imageSrc={card.imageSrc}
            title={card.title}
            timeAgo={card.timeAgo}
            tags={card.tags}
            index={index}
            id={card.id}
            slug={card.slug}
            kind={card.kind}
            description={card.description}
            href={card.href}
          />
        ))}
      </div>

      {currentCards.length === 0 && (
        <p className="py-12 text-center text-[#666666]">
          No posts match your filters.
        </p>
      )}

      {searchTerm.trim() === "" && sortedCards.length > cardsPerPage && (
        <div className="my-10 flex justify-center">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="mx-2 rounded bg-[#478BA2] px-4 py-2 text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-2 px-4 py-2 text-[#333333]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="mx-2 rounded bg-[#478BA2] px-4 py-2 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentPosts;
