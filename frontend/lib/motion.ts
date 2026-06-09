export const easeOut = [0.22, 1, 0.36, 1] as const;

export const scrollViewport = { once: true, margin: "-40px" } as const;

export function fadeUpInitial(reduceMotion: boolean) {
  return reduceMotion ? false : { opacity: 0, y: 20 };
}

export const fadeUpVisible = { opacity: 1, y: 0 };

export function fadeUpTransition(
  reduceMotion: boolean,
  delay = 0,
  duration = 0.45
) {
  return reduceMotion ? { duration: 0 } : { duration, delay, ease: easeOut };
}

export function staggerDelay(index: number, base = 0, step = 0.08) {
  return base + index * step;
}
