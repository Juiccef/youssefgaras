"use client";

import { TubesCursor } from "@/components/ui/tube-cursor";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export function Hero() {
  return (
    <section id="hero" className="relative">
      <TubesCursor
        height="h-[135vh]"
        title="Youssef"
        subtitle="Garas"
        caption="Cybersecurity Engineer · AI Systems · Network Defense"
        initialColors={["#00d4aa", "#1d4ed8", "#4ade80"]}
        lightColors={["#4ade80", "#22d3ee", "#3b82f6", "#00ff88"]}
        lightIntensity={220}
        titleSize="text-[72px] md:text-[100px]"
        subtitleSize="text-[52px] md:text-[72px]"
        captionSize="text-base md:text-lg"
        enableRandomizeOnClick
      >
        <div className="flex items-center justify-center gap-4 pt-2">
          <LiquidButton
            size="lg"
            className="text-white font-semibold"
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
          >
            View Projects
          </LiquidButton>
          <LiquidButton
            size="lg"
            className="text-white/80 font-medium"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            Get in Touch
          </LiquidButton>
        </div>
      </TubesCursor>
      {/* Fade hero into next section */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{
          height: "50vh",
          zIndex: 9999,
          background: "linear-gradient(to top, #080808 0%, #080808 20%, rgba(8,8,8,0.9) 40%, rgba(8,8,8,0.6) 70%, transparent 100%)",
        }}
      />
    </section>
  );
}
