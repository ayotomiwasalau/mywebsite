"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SpecializationBulletVariant = "pink" | "teal";

export interface SpecializationsEntryProps {
  label: string;
  bulletVariant: SpecializationBulletVariant;
  index: number;
}

const bulletColors: Record<SpecializationBulletVariant, string> = {
  pink: "bg-[#D65A78]",
  teal: "bg-[#438CAB]",
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const SpecializationsEntry: React.FC<SpecializationsEntryProps> = ({
  label,
  bulletVariant,
  index,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex items-center justify-between rounded-2xl border border-[#9aa0a6] bg-white px-6 py-3 sm:px-8"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.45, delay: index * 0.08, ease: easeOut }
      }
      whileHover={
        reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }
      }
    >
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${bulletColors[bulletVariant]}`}
        aria-hidden
      />
      <p className="px-4 text-center text-base text-[#4b5563] sm:text-xl lg:text-2xl">
        {label}
      </p>
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${bulletColors[bulletVariant]}`}
        aria-hidden
      />
    </motion.div>
  );
};

export default SpecializationsEntry;
