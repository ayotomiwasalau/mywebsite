"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  fadeUpInitial,
  fadeUpTransition,
  fadeUpVisible,
  scrollViewport,
  staggerDelay,
} from "../../../lib/motion";

interface FadeInViewProps extends HTMLMotionProps<"div"> {
  delay?: number;
  index?: number;
  staggerStep?: number;
}

export default function FadeInView({
  delay = 0,
  index = 0,
  staggerStep = 0.08,
  children,
  transition,
  ...props
}: FadeInViewProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={fadeUpInitial(!!reduceMotion)}
      whileInView={fadeUpVisible}
      viewport={scrollViewport}
      transition={
        transition ??
        fadeUpTransition(!!reduceMotion, staggerDelay(index, delay, staggerStep))
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
