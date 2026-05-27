"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotatingLines } from "react-loader-spinner";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import { urlCleaner } from "../utils/tools";
import WorkInsightComponent, {
  WorkInsightEntry,
} from "./WorkInsightComponent";

interface WorkApiItem {
  type: "blog" | "project";
  item: {
    id: string;
    slug: string;
    header_img_url: string;
    header_img_alt: string;
    created_on: string;
    title: string;
    description: string;
    tags: string[];
    href: string;
  };
}

interface WorkApiResponse {
  items: WorkApiItem[];
}

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

function inferTimeLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

const WorkAndInsight = () => {
  const [entries, setEntries] = useState<WorkInsightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch(`${FASTAPI_ROUTE_BASE}/work`);
        const data: WorkApiResponse = await response.json();
        const mapped = data.items.slice(0, 4).map((entry) => ({
          id: entry.item.id,
          type: entry.type,
          imageSrc: entry.item.header_img_url,
          imageAlt: entry.item.header_img_alt,
          timeLabel: inferTimeLabel(entry.item.created_on),
          title: entry.item.title,
          summary: entry.item.description,
          tags: entry.item.tags,
          href:
            entry.type === "blog"
              ? `/work/blogs/${entry.item.slug ?? urlCleaner(entry.item.title)}`
              : `/work/projects/${entry.item.slug ?? urlCleaner(entry.item.title)}`,
        }));
        setEntries(mapped);
      } catch (error) {
        console.error("Error loading work and insight entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  return (
    <section className="w-full bg-[#efefef] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-2xl font-light text-[#333333]">
          Latest work and insights
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <RotatingLines
              visible
              width="48"
              strokeWidth="2"
              animationDuration="0.75"
              ariaLabel="loading work and insight entries"
            />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <WorkInsightComponent key={entry.id} entry={entry} index={index} />
              ))}
            </div>
            <motion.div
              className="mt-6 flex justify-end"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: entries.length * 0.1, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Link
                href="/work"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D65A78] px-6 text-2xl text-white transition-transform hover:scale-[1.02] hover:opacity-90 active:scale-[0.97]"
              >
                View all
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default WorkAndInsight;
