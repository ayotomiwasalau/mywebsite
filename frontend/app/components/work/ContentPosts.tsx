"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import { normalizeTag } from "@lib/tags";
import Card from "./ContentCard";
import { PostsSchema } from "../utils/interface";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

type WorkTab = "project" | "blog";
type SortOption = "latest" | "oldest" | "title";

interface ApiWorkItem {
  id: string;
  slug: string;
  title: string;
  header_img_url: string;
  created_on: string;
  tags: string[];
  href: string;
  description: string;
}

interface BlogListResponse {
  blogs: ApiWorkItem[];
}

interface ProjectListResponse {
  projects: ApiWorkItem[];
}

function mapToCard(item: ApiWorkItem, kind: WorkTab): PostsSchema {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    imageSrc: item.header_img_url,
    timeAgo: item.created_on,
    tags: item.tags ?? [],
    filepath_md: "",
    likes: 0,
    kind,
    description: item.description,
    href: item.href,
  };
}

function parseWorkTabParam(value: string | null): WorkTab | null {
  if (value === "blog" || value === "project") return value;
  return null;
}

function tabFromSearchParam(value: string | null): WorkTab {
  return parseWorkTabParam(value) ?? "project";
}

function latestTimestamp(items: PostsSchema[]): number {
  return items.reduce(
    (max, item) => Math.max(max, new Date(item.timeAgo).getTime() || 0),
    0
  );
}

function defaultTabFromLatestContent(
  projects: PostsSchema[],
  blogs: PostsSchema[]
): WorkTab {
  const blogLatest = latestTimestamp(blogs);
  const projectLatest = latestTimestamp(projects);
  if (blogLatest === 0 && projectLatest === 0) return "project";
  return blogLatest > projectLatest ? "blog" : "project";
}

const ContentPosts: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopicTag, setSelectedTopicTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<WorkTab>(() =>
    tabFromSearchParam(searchParams.get("type"))
  );
  const [projects, setProjects] = useState<PostsSchema[]>([]);
  const [blogs, setBlogs] = useState<PostsSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const skipPageScrollRef = useRef(true);
  const defaultTabAppliedRef = useRef(false);

  const scrollToPageTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    scrollToPageTop();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) scrollToPageTop();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [scrollToPageTop]);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, blogsRes] = await Promise.all([
          fetch(`${FASTAPI_ROUTE_BASE}/projects?per_page=100`),
          fetch(`${FASTAPI_ROUTE_BASE}/blogs?per_page=100`),
        ]);
        const projectsData: ProjectListResponse = await projectsRes.json();
        const blogsData: BlogListResponse = await blogsRes.json();

        setProjects(
          (projectsData.projects ?? []).map((item) => mapToCard(item, "project"))
        );
        setBlogs((blogsData.blogs ?? []).map((item) => mapToCard(item, "blog")));
      } catch (error) {
        console.error("Error loading work posts:", error);
        setProjects([]);
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isLoading) scrollToPageTop();
  }, [isLoading, scrollToPageTop]);

  useEffect(() => {
    setActiveTab(tabFromSearchParam(searchParams.get("type")));
  }, [searchParams]);

  useEffect(() => {
    if (isLoading || defaultTabAppliedRef.current) return;

    const explicitType = parseWorkTabParam(searchParams.get("type"));
    if (explicitType !== null) {
      defaultTabAppliedRef.current = true;
      return;
    }

    const tab = defaultTabFromLatestContent(projects, blogs);
    defaultTabAppliedRef.current = true;
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isLoading, projects, blogs, pathname, router, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTopicTag, sortBy, activeTab]);

  useEffect(() => {
    if (skipPageScrollRef.current) {
      skipPageScrollRef.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAllTagClick = () => {
    setSelectedTopicTag(null);
  };

  const handleTopicTagClick = (tag: string) => {
    const normalized = normalizeTag(tag).toLowerCase();
    setSelectedTopicTag((current) =>
      current === normalized ? null : normalized
    );
  };

  const handleTabChange = useCallback(
    (tab: WorkTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const topicFilterTags = useMemo(() => {
    const seen = new Map<string, string>();

    for (const post of [...projects, ...blogs]) {
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
  }, [projects, blogs]);

  const activePosts = activeTab === "project" ? projects : blogs;

  const filteredCards = useMemo(() => {
    return activePosts.filter((card) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        card.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTag =
        !selectedTopicTag ||
        card.tags.some(
          (tagItem) =>
            normalizeTag(tagItem).toLowerCase() === selectedTopicTag
        );

      return matchesSearch && matchesTag;
    });
  }, [activePosts, searchTerm, selectedTopicTag]);

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
        <RotatingLines
          visible
          width="48"
          strokeWidth="2"
          animationDuration="0.75"
          ariaLabel="loading work content"
        />
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

      {/* Tag filters: All + topics */}
      <div className="mb-8 flex max-h-[10.5rem] flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
          <button
            type="button"
            onClick={handleAllTagClick}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedTopicTag === null
                ? "bg-[#DE5B6F] text-white outline outline-2 outline-offset-2 outline-[#478BA2]"
                : "bg-[#DE5B6F] text-white hover:bg-[#c94d60]"
            }`}
          >
            All
          </button>
          {topicFilterTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTopicTagClick(tag)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedTopicTag === normalizeTag(tag).toLowerCase()
                  ? "bg-[#DE5B6F] text-white outline outline-2 outline-offset-2 outline-[#478BA2]"
                  : "bg-[#DE5B6F] text-white hover:bg-[#c94d60]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + results */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <label className="flex flex-wrap items-center gap-2 text-[#333333]">
          <span>Sort:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
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

      {/* Projects | Blogs tabs */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div
          className="inline-flex rounded-lg border border-[#DE5B6F]/30 p-1"
          role="tablist"
          aria-label="Content type"
        >
          {(
            [
              { id: "project" as const, label: "Projects" },
              { id: "blog" as const, label: "Blogs" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => handleTabChange(id)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-[#DE5B6F] text-white"
                  : "text-[#DE5B6F] hover:bg-[#DE5B6F]/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-[#666666]">
          Toggle to switch tabs
        </p>
      </div>

      {/* Cards */}
      <div
        ref={gridRef}
        className="scroll-mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
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
