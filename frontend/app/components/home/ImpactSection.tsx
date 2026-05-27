"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import ImpactComponent from "./ImpactComponent";

const IMPACT_ITEMS: { text: string; variant: "blue" | "salmon" }[] = [
  { text: "5B+ rows processed daily", variant: "blue" },
  { text: "50% faster data processing", variant: "salmon" },
  { text: "5 days → 13 min ML retraining", variant: "blue" },
  { text: "98% NLP insight accuracy", variant: "salmon" },
  { text: "70% better data accessibility", variant: "blue" },
  { text: "85% fewer pipeline breakages", variant: "salmon" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function ImpactSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-[#efefef] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="mb-8 text-2xl font-light text-[#333333]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.45, ease: easeOut }
          }
        >
          Impact
        </motion.h2>

        <div className="mx-auto grid w-full max-w-full grid-cols-2 gap-3 sm:gap-4 md:max-w-none md:grid-cols-3 lg:max-w-[43rem] lg:gap-2 xl:max-w-[46rem] xl:gap-2.5">
          {IMPACT_ITEMS.map((item, index) => (
            <ImpactComponent
              key={item.text}
              text={item.text}
              variant={item.variant}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
