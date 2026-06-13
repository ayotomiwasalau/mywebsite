import React from "react";
import WhatIdoComponent, { WhatIdoItem } from "./WhatIdoComponent";

const ITEMS: WhatIdoItem[] = [
  {
    title: "Data Platforms",
    description: "Batch & streaming systems (Kafka, Spark)",
    iconSrc: "/stacklogo/aboutme/wid_dataplat.svg",
    variant: "blue",
  },
  {
    title: "Cloud Architecture",
    description: "AWS, GCP, Azure scalable distributed systems",
    iconSrc: "/stacklogo/aboutme/wid_cloud.svg",
    variant: "salmon",
  },
  {
    title: "AI Systems",
    description: "RAG pipelines, multi-agent workflows",
    iconSrc: "/stacklogo/aboutme/wid_ai.svg",
    variant: "blue",
  },
  {
    title: "Performance Engineering",
    description: "Low-latency, high-throughput systems",
    iconSrc: "/stacklogo/aboutme/wid_performance.svg",
    variant: "salmon",
  },
];

const WhatIdoSection = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold uppercase tracking-wide text-[#333333] md:text-3xl">
        What I do
      </h2>
      <p className="mb-8 mt-2 max-w-3xl text-sm leading-relaxed text-[#666666] md:text-base">
        Core areas where I design and deliver production-ready data and AI systems.
      </p>

      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="w-full max-w-sm shrink-0 md:w-[calc((100%-2rem)/2)] md:max-w-none lg:w-[calc((100%-4rem)/3)]"
          >
            <WhatIdoComponent item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatIdoSection;
