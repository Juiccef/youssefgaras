import type { ReactNode } from "react";
import { BlurFade } from "@/components/ui/BlurFade";

interface SectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  lede?: ReactNode;
}

// Single source of truth for section headings — keeps type scale,
// spacing, and voice identical across every section. Plain on purpose: the
// title is just the type, and the only colour is the small label, which
// takes the colour of the section it's in (data-sec).
export function SectionHeader({ index, kicker, title, lede }: SectionHeaderProps) {
  return (
    <BlurFade className="mb-12 md:mb-16">
      <p className="text-sec text-xs font-mono tracking-[0.2em] uppercase mb-3">
        <span className="opacity-70 mr-2">{index}.</span>
        {kicker}
      </p>
      <h2 className="display sec-title">{title}</h2>
      {lede && <p className="text-white/65 text-lg mt-5 max-w-lg">{lede}</p>}
    </BlurFade>
  );
}
