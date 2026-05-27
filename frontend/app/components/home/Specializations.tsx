"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
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

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Specializations() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-white px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="mb-8 inline-block text-2xl font-light text-[#333333]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.45, ease: easeOut }
          }
        >
          <span className="pb-1">Specialization</span>
        </motion.h2>

        <ul
          className="mx-auto flex max-w-6xl list-none flex-col gap-3 p-0"
          role="list"
        >
          {ITEMS.map((item, index) => (
            <li key={item.label}>
              <SpecializationsEntry
                label={item.label}
                bulletVariant={item.bulletVariant}
                index={index}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
