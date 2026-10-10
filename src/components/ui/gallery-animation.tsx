"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpandableGalleryProps {
  images: string[];
  className?: string;
}

const two = (n: number) => String(n).padStart(2, "0");

const ExpandableGallery: React.FC<ExpandableGalleryProps> = ({ images, className = "" }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // the viewer is mounted on <body> the first time a photo is opened
  const [opened, setOpened] = useState(false);
  // phone row: which photo is in the middle
  const rowRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // While a photo is open the page behind it holds still (globals.css): a swipe on the photo used to scroll it
  const viewing = selectedIndex !== null;
  useEffect(() => {
    if (!viewing) return;
    const el = document.documentElement;
    el.dataset.photoOpen = "";
    return () => {
      delete el.dataset.photoOpen;
    };
  }, [viewing]);

  const openImage = (index: number) => {
    setOpened(true);
    setSelectedIndex(index);
  };
  const closeImage = () => setSelectedIndex(null);

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const getFlexValue = (index: number) => {
    if (hoveredIndex === null) return 1;
    return hoveredIndex === index ? 2 : 0.5;
  };

  const onRowScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    const middle = row.scrollLeft + row.clientWidth / 2;
    let nearest = 0;
    let gap = Infinity;
    Array.from(row.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - middle);
      if (d < gap) {
        gap = d;
        nearest = i;
      }
    });
    setCurrent(nearest);
  };

  return (
    <div className={className}>
      {/* Phones: one large photo at a time, swiped sideways and snapping into
          place; the next one peeks in from the edge. Every photo is cut to the
          same tall shape here; tapping opens the whole picture. */}
      <div className="md:hidden">
        <div
          ref={rowRef}
          onScroll={onRowScroll}
          className="no-scrollbar relative -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => openImage(index)}
              aria-label={`Open photo ${index + 1} of ${images.length}`}
              className="relative aspect-[4/5] w-[76vw] max-w-[22rem] shrink-0 snap-center overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              <Image src={image} alt={`Photography ${index + 1}`} fill sizes="(max-width: 768px) 76vw, 22rem" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div aria-hidden className="flex gap-1.5">
            {images.map((image, i) => (
              <span key={image} className={cn("h-1.5 rounded-full transition-all duration-300", i === current ? "w-5 bg-sec" : "w-1.5 bg-white/20")} />
            ))}
          </div>
          <p className="font-mono text-[11px] text-white/45">
            {two(current + 1)} / {two(images.length)}
          </p>
        </div>
      </div>

      {/* Wider screens: the strip, widening under the mouse */}
      <div className="hidden h-96 w-full gap-2 md:flex">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-xl"
            style={{ flex: 1 }}
            animate={{ flex: getFlexValue(index) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openImage(index)}
          >
            {/* lazy: these are the full-size originals, and a phone (where this strip is
                hidden) would otherwise download all of them the moment the page opens */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`Photography ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredIndex === index ? 0 : 0.35 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* The viewer goes on <body>: inside the page it would sit under the nav bar */}
      {opened &&
        createPortal(
          <AnimatePresence>
            {selectedIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10"
                style={{ backgroundColor: "#080808" }}
                onClick={closeImage}
              >
                <button
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
                  onClick={closeImage}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {images.length > 1 && (
                  <button
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors sm:left-4"
                    onClick={goToPrev}
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <motion.img
                  key={selectedIndex}
                  src={images[selectedIndex]}
                  alt={`Photography ${selectedIndex + 1}`}
                  className="rounded-xl"
                  style={{ maxWidth: "90vw", maxHeight: "85vh", width: "auto", height: "auto", objectFit: "contain" }}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                />

                {images.length > 1 && (
                  <button
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors sm:right-4"
                    onClick={goToNext}
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                  {selectedIndex + 1} / {images.length}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export { ExpandableGallery };
