"use client";

import type { CSSProperties } from "react";
import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LED } from "@/components/lab/devices";
import { rng } from "@/components/lab/iso";
import { H, PARTS, PART_LOCAL, RackFront, W, swX, type PartId } from "@/components/lab/parts";
import { setView } from "@/components/lab/view";
import { HOMELAB } from "@/lib/content";

// The homelab in classic view: the rack itself on one side (the same drawing
// as the one in the room, seen straight on), what I've built on it on the
// other.

type RackPart = Exclude<PartId, "rack">;

/** What's numbered on the drawing, top of the rack to the bottom. The PDU is at the rear, behind the blank panel. */
const CALLOUTS: RackPart[] = ["pdu", "patch", "switch", "ssd", "p340"];
/** The one line of each part's specs (parts.tsx) that says the most here; the first unless listed. */
const SPEC: Partial<Record<RackPart, number>> = { patch: 1, ssd: 1 };

const two = (n: number) => String(n).padStart(2, "0");

// ─── The drawing ─────────────────────────────────────────────────────────

/** Blink timings, drawn once so the server and the browser agree. */
const rand = rng(2026);
const R2 = Array.from({ length: 10 }, () => [rand(), rand()] as [number, number]);
const BLINK = { act: [0.7, 1.9], disk: [1.8, 4.6] } as const;

/**
 * A status LED. The room's LEDs take their glow from gradients defined in
 * the room's own SVG, which isn't on screen in classic view, so these have a
 * plain halo instead.
 */
function Lamp({ x, y, r, color, blink, r2 }: { x: number; y: number; r: number; color: string; blink?: keyof typeof BLINK; r2?: [number, number] }) {
  let style: CSSProperties | undefined;
  if (blink && r2) {
    const [lo, hi] = BLINK[blink];
    const dur = lo + r2[0] * (hi - lo);
    style = { animationDuration: `${dur.toFixed(2)}s`, animationDelay: `${(-r2[1] * dur).toFixed(2)}s` };
  }
  return (
    <g className={blink ? `lab-led-${blink}` : undefined} style={style}>
      <circle cx={x} cy={y} r={r * 3} fill={color} opacity={0.2} />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
}

/** Top-left corner of a part on the rack's front (rack-local units, see parts.tsx). */
const corner = (id: RackPart) => [PART_LOCAL[id].u[0], PART_LOCAL[id].v[0]] as const;

function RackDrawing() {
  const [sx, sy] = corner("switch");
  const [px, py] = corner("p340");
  const [dx, dy] = corner("ssd");
  // the numbers sit in a column to the right of the rack, each on a line to its part
  const col = W + 11;
  return (
    <svg
      viewBox={`-10 -12 ${W + 27} ${H + 22}`}
      role="img"
      aria-label="Front view of my homelab: a 6U 10-inch rack with a patch panel, a switch, and a ThinkStation P340 Tiny with an SSD on top"
      className="mx-auto block h-auto w-full max-w-[26rem] [mask-image:linear-gradient(#000_90%,transparent)]"
    >
      {/* carry handles */}
      {[
        [7, 26],
        [W - 26, W - 7],
      ].map(([a, b]) => (
        <g key={a} fill="none" strokeLinejoin="round">
          <path d={`M${a} 0 V-8 H${b} V0`} stroke="#2a2e33" strokeWidth={2.6} />
          <path d={`M${a} 0 V-8 H${b} V0`} stroke="rgba(255,255,255,0.18)" strokeWidth={0.5} />
        </g>
      ))}

      <RackFront />

      {/* lights: the switch's ports and power, the P340's power and disk, the SSD */}
      {Array.from({ length: 8 }, (_, i) => (
        <Lamp key={i} x={sx + swX(i) + 1.7} y={sy + 2.6} r={0.45} color={LED.green} blink="act" r2={R2[i]} />
      ))}
      <Lamp x={sx + 2.2} y={sy + 6} r={0.5} color={LED.green} />
      <Lamp x={px + 46.5} y={py + 6.8} r={0.6} color={LED.white} />
      <Lamp x={px + 33.8} y={py + 7.6} r={0.35} color={LED.amber} blink="disk" r2={R2[8]} />
      <Lamp x={dx + 26.4} y={dy + 2.2} r={0.45} color={LED.blue} blink="disk" r2={R2[9]} />

      {/* the cabinet it stands on, with its label-maker tape */}
      <rect x={-8.5} y={H} width={W + 17} height={10} fill="#14171a" />
      <rect x={-8.5} y={H} width={W + 17} height={0.6} fill="rgba(255,255,255,0.14)" />
      <rect x={-3} y={H + 2.6} width={22} height={4.6} rx={0.4} fill="#eeece4" />
      <text x={8} y={H + 6} fontSize={2.9} fill="#111" textAnchor="middle" fontWeight={700} className="lab-mono" letterSpacing={0.4}>
        HOMELAB
      </text>

      {/* callouts */}
      {CALLOUTS.map((id, i) => {
        const { u, v } = PART_LOCAL[id];
        const y = (v[0] + v[1]) / 2;
        return (
          <g key={id}>
            <path d={`M${u[1] - 1.5} ${y} H${col - 3.4}`} className="stroke-sec" strokeWidth={0.45} fill="none" />
            <circle cx={u[1] - 1.5} cy={y} r={0.9} className="fill-sec" />
            <circle cx={col} cy={y} r={3.4} fill="#0a0d19" className="stroke-sec" strokeWidth={0.6} />
            <text x={col} y={y + 1.25} fontSize={3.6} fontWeight={700} textAnchor="middle" className="lab-mono fill-sec">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── The section ─────────────────────────────────────────────────────────

const label = "font-mono text-xs uppercase tracking-[0.2em]";

/**
 * Into the room from down here: the way in is the room's picture in the intro
 * (HeroRoom), so go back up to it and through it. The room then opens the
 * same way as from the top of the page, and steps back out to it.
 */
function toRoom() {
  const door = document.querySelector<HTMLButtonElement>("[data-room-door]");
  if (!door) return setView("room");
  window.scrollTo({ top: 0, behavior: "instant" });
  requestAnimationFrame(() => door.click());
}

export function Homelab() {
  return (
    <section id="homelab" data-sec="dusk" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          index="02"
          kicker="Self-hosted"
          title="Homelab"
          lede="The rack in my room: one small server and a managed switch, running around the clock, and everything I've built on top of them."
        />

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* One side: the rack */}
          <BlurFade delay={0.05}>
            <p className={`${label} mb-5 text-sec`}>The hardware</p>
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0d19] p-5 md:p-6">
              <div className="mb-4 flex items-baseline justify-between gap-3 font-mono text-[11px] text-white/45">
                <span>{PARTS.rack.title}</span>
                <span className="shrink-0 uppercase tracking-[0.2em]">front</span>
              </div>
              <RackDrawing />
              <ol className="mt-5 grid gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {CALLOUTS.map((id, i) => (
                  <li key={id} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sec/60 font-mono text-[10px] font-bold text-sec">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-white">{PARTS[id].title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                        <span className="text-sec/80">{PARTS[id].kicker}</span> · {PARTS[id].specs[SPEC[id] ?? 0]}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </BlurFade>

          {/* The other: what runs on it */}
          <BlurFade delay={0.15}>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className={`${label} text-sec`}>What I&apos;ve built on it</p>
              <p className="font-mono text-[11px] text-white/45">
                {HOMELAB.host} · {HOMELAB.os}
              </p>
            </div>

            {/* the services, stacked like units in a rack: a numbered post with a status light, then the unit */}
            <ol className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d19]">
              {HOMELAB.services.map((s, i) => (
                <li key={s.name} className="grid grid-cols-[2.75rem_minmax(0,1fr)] md:grid-cols-[3.25rem_minmax(0,1fr)]">
                  <div className="flex flex-col items-center gap-2.5 border-r border-white/[0.07] bg-white/[0.03] pt-5 font-mono text-[10px] text-white/40">
                    {two(i + 1)}
                    <span
                      aria-hidden
                      className="lab-led-pulse h-1.5 w-1.5 rounded-full bg-emerald-400"
                      style={{ animationDelay: `${(-i * 0.7).toFixed(1)}s` }}
                    />
                  </div>
                  <div className="p-5 md:px-6">
                    <h3 className="display text-[1.55rem] text-white">{s.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{s.role}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9 grid gap-9 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div>
                <p className={`${label} mb-3 text-white/50`}>Locked down</p>
                <ul className="flex flex-wrap gap-1.5">
                  {HOMELAB.hardening.map((h) => (
                    <li key={h} className="rounded-lg border border-sec/25 bg-sec/10 px-2.5 py-1 text-xs text-sec">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={`${label} mb-3 text-white/50`}>Broke it, fixed it</p>
                <ul className="space-y-2.5">
                  {HOMELAB.stories.map((story) => (
                    <li key={story} className="flex gap-3 text-sm leading-relaxed text-white/65">
                      <span className="shrink-0 text-sec/70">›</span>
                      {story}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={toRoom}
              className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/80"
            >
              see it in the room →
            </button>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
