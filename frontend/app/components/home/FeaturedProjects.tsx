"use client";

import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import FeatProjectCard from "./FeatProjectCard";
import { urlCleaner } from "../utils/tools";

interface TempFeaturedProject {
  id: string;
  imageSrc: string;
  imageAlt: string;
  timeLabel: string;
  title: string;
  description: string;
  tags: string[];
  caseStudyHref: string;
}

interface ProjectApiItem {
  type: "blog" | "project";
  item: {
  id: string;
  slug: string;
  title: string;
  header_img_url: string;
  header_img_alt: string;
  created_on: string;
  description: string;
  tags: string[];
  };
}

interface ProjectApiResponse {
  items: ProjectApiItem[];
}

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

function inferTimeLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<TempFeaturedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${FASTAPI_ROUTE_BASE}/work-featured`);
        const data: ProjectApiResponse = await response.json();
        const mapped = data.items.slice(0, 3).map((entry) => ({
          id: entry.item.id,
          imageSrc: entry.item.header_img_url,
          imageAlt: entry.item.header_img_alt,
          timeLabel: inferTimeLabel(entry.item.created_on),
          title: entry.item.title,
          description: entry.item.description,
          tags: entry.item.tags,
          caseStudyHref:
            entry.type === "blog"
              ? `/work/blogs/${entry.item.slug ?? urlCleaner(entry.item.title)}`
              : `/work/projects/${entry.item.slug ?? urlCleaner(entry.item.title)}`,
        }));
        setProjects(mapped);
      } catch (error) {
        console.error("Error loading temporary featured content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section className="w-full bg-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h2
          id="featured-projects"
          className="mb-8 text-2xl font-light text-[#333333]"
        >
          Featured Post
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <RotatingLines
              visible
              width="48"
              strokeWidth="2"
              animationDuration="0.75"
              ariaLabel="loading featured content"
            />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="w-full max-w-md shrink-0 md:w-[calc((100%-2rem)/2)] md:max-w-none lg:w-[calc((100%-4rem)/3)]"
              >
                <FeatProjectCard
                  imageSrc={project.imageSrc}
                  imageAlt={project.imageAlt}
                  timeLabel={project.timeLabel}
                  title={project.title}
                  description={project.description}
                  tags={project.tags}
                  caseStudyHref={project.caseStudyHref}
                  index={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
