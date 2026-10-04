import { BlurFade } from "@/components/ui/BlurFade";

interface SectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  lede?: string;
}

// Single source of truth for section headings — keeps type scale,
// spacing, and voice identical across every section.
export function SectionHeader({ index, kicker, title, lede }: SectionHeaderProps) {
  return (
    <BlurFade className="mb-12 md:mb-16">
      <p className="text-putty text-xs font-mono tracking-[0.2em] uppercase mb-3">
        <span className="text-putty/70 mr-2">{index}.</span>
        {kicker}
      </p>
      <h2 className="text-4xl md:text-5xl font-bold">{title}</h2>
      {lede && <p className="text-white/65 text-lg mt-4 max-w-lg">{lede}</p>}
    </BlurFade>
  );
}
