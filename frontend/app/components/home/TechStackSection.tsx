"use client";

import React, { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TechStack, { TechStackItem } from "./TechStack";

const ROW_1: TechStackItem[] = [
  { name: "Python", logoSrc: "/stacklogo/techlogo/python.svg" },
  { name: "Java", logoSrc: "/stacklogo/techlogo/java.svg" },
  { name: "SQL", logoSrc: "/stacklogo/techlogo/sql.svg" },
  { name: "C++", logoSrc: "/stacklogo/techlogo/cpp.svg" },
  { name: "Kafka", logoSrc: "/stacklogo/techlogo/kafka.svg" },
  { name: "Spark", logoSrc: "/stacklogo/techlogo/spark.svg" },
  { name: "AWS", logoSrc: "/stacklogo/techlogo/aws.svg" },
];

const ROW_2: TechStackItem[] = [
  { name: "GCP", logoSrc: "/stacklogo/techlogo/gcp.svg" },
  { name: "dbt", logoSrc: "/stacklogo/techlogo/dbt.svg" },
  { name: "OpenAI", logoSrc: "/stacklogo/techlogo/openai.svg" },
  { name: "VectorDB", logoSrc: "/stacklogo/techlogo/chromadb.svg" },
  { name: "Airflow", logoSrc: "/stacklogo/techlogo/airflow.svg" },
  { name: "Terraform", logoSrc: "/stacklogo/techlogo/terraform.svg" },
];

const ALL_ITEMS: TechStackItem[] = [...ROW_1, ...ROW_2];

const easeOut = [0.22, 1, 0.36, 1] as const;

function SeparatorDot({ dotIndex }: { dotIndex: number }) {
  const teal = dotIndex % 2 === 0;
  return (
    <span
      aria-hidden
      className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${
        teal ? "bg-[#438CAB]" : "bg-[#D65A78]"
      }`}
    />
  );
}

function TechRow({
  items,
  startIndex,
}: {
  items: TechStackItem[];
  startIndex: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-8 md:gap-x-1 lg:gap-x-0.5 xl:gap-x-1">
      {items.map((item, i) => (
        <Fragment key={item.name}>
          <TechStack item={item} index={startIndex + i} />
          {i < items.length - 1 && (
            <SeparatorDot dotIndex={startIndex + i} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default function TechStackSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-white px-6 py-12">
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
          Tech Stack
        </motion.h2>

        <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 md:gap-x-3 lg:hidden">
          {ALL_ITEMS.map((item, index) => (
            <TechStack key={item.name} item={item} index={index} />
          ))}
        </div>

        <div className="hidden flex-col items-center gap-10 lg:flex xl:gap-12">
          <TechRow items={ROW_1} startIndex={0} />
          <TechRow items={ROW_2} startIndex={ROW_1.length} />
        </div>
      </div>
    </section>
  );
}
