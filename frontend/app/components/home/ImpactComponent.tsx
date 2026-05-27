"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ImpactCardVariant = "blue" | "salmon";

export interface ImpactComponentProps {
  text: string;
  variant: ImpactCardVariant;
  index: number;
}

const backgrounds: Record<ImpactCardVariant, string> = {
  blue: "bg-[#BBD5DC]",
  salmon: "bg-[#E6A892]",
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const ImpactComponent: React.FC<ImpactComponentProps> = ({
  text,
  variant,
  index,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex aspect-square min-h-[10rem] w-full max-w-full items-center justify-center rounded-2xl px-4 py-6 text-center sm:min-h-[11rem] lg:mx-auto lg:min-h-0 lg:max-w-[14rem] lg:px-4 lg:py-5 xl:max-w-[15rem] ${backgrounds[variant]}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.45, delay: index * 0.08, ease: easeOut }
      }
      whileHover={
        reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
      }
    >
      <p className="text-lg font-semibold leading-snug text-[#243344] sm:text-xl lg:text-xl xl:text-2xl">
        {text}
      </p>
    </motion.div>
  );
};

export default ImpactComponent;
