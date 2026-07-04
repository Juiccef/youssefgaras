"use client";
import { motion, useReducedMotion } from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// Animates opacity/translate only — no filter. Animating blur() on large
// card-sized elements creates heavy composite layers that Chromium can fail
// to paint when a WebGL canvas is on the page (cards stayed invisible,
// leaving a big void after the Projects grid).
export function BlurFade({ children, className, delay = 0 }: BlurFadeProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
