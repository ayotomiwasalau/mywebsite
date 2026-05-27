"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@lib/adminFetch";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import BoardCard from "./BoardCard";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

interface WorkSummary {
  projects: number;
  blogs: number;
  subscribers: number;
  images: number;
  messages: number;
}

const DEFAULT_SUMMARY: WorkSummary = {
  projects: 0,
  blogs: 0,
  subscribers: 0,
  images: 0,
  messages: 0,
};

const BoardSection = () => {
  const [summary, setSummary] = useState<WorkSummary>(DEFAULT_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const response = await adminFetch(`${FASTAPI_ROUTE_BASE}/work-summary`);

        if (!response.ok) {
          throw new Error("Unable to load dashboard summary.");
        }

        const data = (await response.json()) as WorkSummary;
        if (!isMounted) return;

        setSummary(data);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load dashboard summary.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    { label: "Projects", value: summary.projects },
    { label: "Blogs", value: summary.blogs },
    { label: "Subscribers", value: summary.subscribers },
    { label: "Images", value: summary.images },
    { label: "No of messages", value: summary.messages },
  ];

  return (
    <section className="mt-5">
      <h2 className="text-[1.85rem] font-bold leading-tight text-[#111111] sm:text-[2.2rem] md:text-[2.8rem]">
        Dashboard
      </h2>
      {isLoading ? (
        <p className="mt-3 text-[0.95rem] italic text-[#555555]">Loading dashboard summary...</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-[0.95rem] italic text-[#8A2438]">{error}</p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 justify-items-stretch gap-3 sm:mt-7 sm:grid-cols-3 sm:justify-items-start sm:gap-x-8 sm:gap-y-6 md:gap-x-12 md:gap-y-7">
        {stats.map((item) => (
          <BoardCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
};

export default BoardSection;
