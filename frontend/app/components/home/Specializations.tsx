import React from "react";
import SpecializationsEntry from "./SpecializationsEntry";

const ITEMS = [
  {
    label: "Data Platforms (Kafka, Spark, Streaming)",
    bulletVariant: "pink" as const,
  },
  {
    label: "Cloud Architecture (AWS, GCP, scalable systems)",
    bulletVariant: "teal" as const,
  },
  {
    label: "AI Systems (RAG, Agents, LLM workflows)",
    bulletVariant: "pink" as const,
  },
  {
    label: "Performance Engineering (low latency systems)",
    bulletVariant: "teal" as const,
  },
];

export default function Specializations() {
  return (
    <section className="w-full bg-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 inline-block text-2xl font-light text-[#333333]">
          <span className=" pb-1">
            Specialization
          </span>
        </h2>
        
        <ul className="flex list-none flex-col gap-3 p-0 mx-auto max-w-6xl" role="list">
          {ITEMS.map((item) => (
            <li key={item.label}>
              <SpecializationsEntry
                label={item.label}
                bulletVariant={item.bulletVariant}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
