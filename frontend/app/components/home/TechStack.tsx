"use client";

import Image from "next/image";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface TechStackItem {
  name: string;
  logoSrc: string;
}

interface TechStackProps {
  item: TechStackItem;
  index: number;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

const TechStack: React.FC<TechStackProps> = ({ item, index }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex w-full max-w-[3.75rem] flex-col items-center gap-1.5 sm:max-w-[5.25rem] sm:gap-2 md:w-24 md:max-w-none lg:w-[6.5rem] xl:w-28"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: easeOut }
      }
      whileHover={
        reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
      }
    >
      <div className="relative aspect-square w-full max-w-[2.75rem] sm:max-w-[3.75rem] md:max-w-[4.25rem] lg:max-w-[4.75rem] xl:max-w-[5.25rem]">
        <Image
          src={item.logoSrc}
          alt={item.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 52px, (max-width: 1024px) 68px, 84px"
        />
      </div>
      <span className="text-center text-[10px] font-medium leading-tight text-[#333333] sm:text-xs md:text-sm lg:text-base">
        {item.name}
      </span>
    </motion.div>
  );
};

export default TechStack;
