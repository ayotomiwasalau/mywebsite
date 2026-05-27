"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import { tagsOverlap } from "@lib/tags";
import ContentCard from "../work/ContentCard";
import { PostsSchema } from "../utils/interface";
import { urlCleaner } from "../utils/tools";

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

interface RelatedItemsProps {
  postSelected: PostsSchema;
}

const RelatedItems = ({ postSelected }: RelatedItemsProps) => {
  const [posts, setPosts] = useState<PostsSchema[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${FASTAPI_ROUTE_BASE}/work?per_page=100`);
        const data: WorkApiResponse = await response.json();
        const transformedData: PostsSchema[] = (data.items ?? []).map((entry) => ({
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
        setPosts(transformedData);
      } catch (error) {
        console.error("Error fetching related work:", error);
        setPosts([]);
      }
    };

    void fetchPosts();
  }, []);

  const relatedCards = useMemo(() => {
    const selectedTags = postSelected.tags ?? [];

    return posts
      .filter((item) => item.id !== postSelected.id)
      .filter((item) => tagsOverlap(selectedTags, item.tags ?? []))
      .sort(
        (a, b) =>
          new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime(),
      )
      .slice(0, 6);
  }, [posts, postSelected]);

  if (relatedCards.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-8">
      <h2 className="mx-auto mb-3 max-w-5xl px-6 text-xl font-bold text-[#333333]">
        Related work
      </h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
        {relatedCards.map((card, index) => (
          <ContentCard
            key={card.id}
            imageSrc={card.imageSrc}
            title={card.title}
            timeAgo={card.timeAgo}
            tags={card.tags}
            index={index}
            id={card.id}
            slug={card.slug ?? urlCleaner(card.title)}
            kind={card.kind}
            description={card.description}
            href={card.href}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedItems;
