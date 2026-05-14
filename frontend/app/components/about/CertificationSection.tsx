"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import certificationsData from "../../data/certifications.json";
import CertificationComponent, {
  CertificationEntry,
} from "./CertificationComponent";

const certifications = certificationsData as CertificationEntry[];

/** Phone: one column, two rows per slide. */
const SLIDE_SIZE_PHONE = 2;
/** Tablet (md–lg): two per row, two rows per slide. */
const SLIDE_SIZE_TABLET = 4;
/** Large screens: three per row, two rows per slide. */
const SLIDE_SIZE_DESKTOP = 6;

function perSlideForWidth(width: number): number {
  if (width < 768) return SLIDE_SIZE_PHONE;
  if (width < 1024) return SLIDE_SIZE_TABLET;
  return SLIDE_SIZE_DESKTOP;
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

const CertificationSection = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [perSlide, setPerSlide] = useState(SLIDE_SIZE_DESKTOP);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const sync = () => setPerSlide(perSlideForWidth(window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const slides = useMemo(
    () => chunk(certifications, perSlide),
    [perSlide]
  );

  useEffect(() => {
    setActiveSlide(0);
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: 0 });
  }, [perSlide]);

  const slideCount = slides.length;

  const scrollToSlide = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el || slideCount === 0) return;
      const next = Math.max(0, Math.min(index, slideCount - 1));
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setActiveSlide(next);
    },
    [slideCount]
  );

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || slideCount === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveSlide(Math.max(0, Math.min(idx, slideCount - 1)));
  }, [slideCount]);

  return (
    <section
      className="mb-12 bg-white md:mb-16"
      aria-roledescription="carousel"
      aria-label="Education and certifications"
    >
      <h2 className="text-xl font-bold uppercase tracking-wide text-black md:text-2xl lg:text-3xl">
        Education
      </h2>
      <p className="mb-10 mt-2 max-w-3xl text-sm leading-relaxed text-[#666666] md:mb-12 md:text-base">
        Certifications and continuous learning milestones from recent programs.
      </p>

      <div className="relative px-10 md:px-14">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="-mx-1 flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] md:-mx-2 [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((batch, slideIndex) => (
            <div
              key={slideIndex}
              className="w-full min-w-full shrink-0 snap-center snap-always px-1 md:px-2"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:grid-rows-2 lg:gap-6">
                {batch.map((entry) => (
                  <div key={entry.id} className="min-h-0">
                    <CertificationComponent entry={entry} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-neutral-800 bg-white text-neutral-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_2px_8px_rgba(0,0,0,0.08)] transition hover:border-neutral-950 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 md:h-11 md:w-11"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide + 1)}
              disabled={activeSlide >= slideCount - 1}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-neutral-800 bg-white text-neutral-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_2px_8px_rgba(0,0,0,0.08)] transition hover:border-neutral-950 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 md:h-11 md:w-11"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {slideCount > 1 && (
        <div
          className="mt-4 flex justify-center gap-2"
          role="tablist"
          aria-label="Certification slides"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeSlide}
              aria-label={`Go to slide ${i + 1} of ${slideCount}`}
              onClick={() => scrollToSlide(i)}
              className={`h-2.5 w-2.5 rounded-full transition md:h-3 md:w-3 ${
                i === activeSlide
                  ? "bg-[#E56B73]"
                  : "bg-[#d4d4d8] hover:bg-[#b4b4b8]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CertificationSection;
