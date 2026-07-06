"use client";

import { TubesCursor } from "@/components/ui/tube-cursor";
import { Terminal } from "@/components/ui/Terminal";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export function Hero() {
  return (
    <section id="hero" className="relative">
      <TubesCursor
        height="min-h-[100svh]"
        initialColors={["#2563eb", "#0d9488", "#4ade80"]}
        lightColors={["#4ade80", "#22d3ee", "#2dd4bf", "#00ff88"]}
        lightIntensity={140}
        canvasOpacity={0.55}
        enableRandomizeOnClick
      >
        {/* Static glow — composes the center even if the WebGL script never loads */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] max-w-full h-[420px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />

        <div className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 pt-24 pb-24">
          <p className="font-mono text-xs md:text-sm text-emerald-400 tracking-[0.25em] mb-5 select-none">
            ~ $ whoami
          </p>

          <h1 className="text-center font-bold uppercase tracking-tight leading-[0.95] text-[44px] sm:text-6xl md:text-7xl lg:text-[80px] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
            Youssef <br className="sm:hidden" />
            Garas
          </h1>

          <p className="mt-5 text-center font-mono text-sm md:text-base text-white/75 tracking-wide">
            Cybersecurity Engineer · AI Systems · Network Defense
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <LiquidButton
              size="lg"
              className="text-white font-semibold"
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Projects
            </LiquidButton>
            <LiquidButton
              size="lg"
              className="text-white/85 font-medium"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Get in Touch
            </LiquidButton>
          </div>

          <Terminal className="mt-12 max-w-2xl" />
        </div>

        {/* Fade into the next section */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-36 z-[5] bg-gradient-to-b from-transparent to-[#080808]" />

        {/* Scroll cue */}
        <a
          href="#projects"
          aria-label="Scroll to projects"
          className="group absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/50 group-hover:text-white/80 transition-colors">
            scroll
          </span>
          <span className="relative block w-px h-8 overflow-hidden bg-white/10">
            <span className="absolute left-0 top-0 w-px h-3 bg-emerald-400 motion-safe:animate-[scroll-cue_2.2s_ease-in-out_infinite]" />
          </span>
        </a>
      </TubesCursor>
    </section>
  );
}
