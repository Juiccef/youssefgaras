import type { ReactNode } from "react";

// Background for the classic sections: the night outside the room's window.
// The sky itself stays put while the page scrolls over it (a sticky,
// viewport-sized layer): stars, a faint Milky Way, two constellations, the
// moon, satellites drifting across and the odd shooting star. The Atlanta
// skyline rises at the end and runs into the footer. CSS/SVG only.

/** Deterministic PRNG so server and client render the same sky. */
function prng(seed: number) {
  let a = seed;
  return () => (a = (a * 16807) % 2147483647) / 2147483647;
}

function starLayer(seed: number, count: number, max = 0.75) {
  const r = prng(seed);
  return Array.from({ length: count }, () => {
    const x = (r() * 100).toFixed(2);
    const y = (r() * 100).toFixed(2);
    const o = (0.18 + r() * (max - 0.18)).toFixed(2);
    const s = r() < 0.12 ? 1.6 : 1;
    return `radial-gradient(${s}px ${s}px at ${x}% ${y}%, rgba(226,232,255,${o}), transparent)`;
  }).join(",");
}

const STARS = `${starLayer(7, 40)}, ${starLayer(4201, 24)}`;
const MILKY_STARS = starLayer(99, 70, 0.5);
const BAND = "linear-gradient(118deg, transparent 28%, rgba(0,0,0,0.6) 44%, #000 50%, rgba(0,0,0,0.6) 56%, transparent 72%)";

/** Brighter stars that twinkle: [left %, top %, delay s, duration s]. */
const TWINKLES = (() => {
  const r = prng(31);
  return Array.from({ length: 12 }, () => [r() * 100, 8 + r() * 86, -r() * 6, 3 + r() * 4] as const);
})();

// ─── Constellations (real shapes), drawn like a little network map ──────

const DIPPER = {
  stars: [[4, 10], [6, 44], [58, 52], [62, 20], [100, 17], [138, 12], [176, 30]],
  links: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  label: "ursa major",
  w: 184,
  h: 64,
};
const CASSIOPEIA = {
  stars: [[4, 16], [34, 50], [64, 22], [96, 54], [126, 10]],
  links: [[0, 1], [1, 2], [2, 3], [3, 4]],
  label: "cassiopeia",
  w: 132,
  h: 62,
};

function Constellation({ c, className }: { c: typeof DIPPER; className: string }) {
  return (
    // drawn at 65% so it fits in the side margin beside the content column
    <svg width={c.w * 0.65} height={(c.h + 16) * 0.65} viewBox={`0 0 ${c.w} ${c.h + 16}`} className={`absolute ${className}`}>
      {c.links.map(([a, b], i) => (
        <line key={i} x1={c.stars[a][0]} y1={c.stars[a][1]} x2={c.stars[b][0]} y2={c.stars[b][1]} stroke="rgba(190,205,255,0.16)" strokeWidth={0.8} />
      ))}
      {c.stars.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={4} fill="rgba(210,222,255,0.08)" />
          <circle cx={x} cy={y} r={1.4} fill="#e2e8ff" opacity={0.85} />
        </g>
      ))}
      <text x={0} y={c.h + 12} fontSize={11} letterSpacing={2} fill="rgba(210,222,255,0.3)" className="font-mono uppercase">
        {c.label}
      </text>
    </svg>
  );
}

function Satellite() {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
      <rect x="0" y="3" width="7" height="4" fill="#3a4a6b" stroke="#6b7fa8" strokeWidth="0.4" />
      <rect x="15" y="3" width="7" height="4" fill="#3a4a6b" stroke="#6b7fa8" strokeWidth="0.4" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="0.8" fill="#9aa6bd" />
      <line x1="7" y1="5" x2="8.5" y2="5" stroke="#9aa6bd" strokeWidth="0.6" />
      <line x1="13.5" y1="5" x2="15" y2="5" stroke="#9aa6bd" strokeWidth="0.6" />
      <circle cx="11" cy="1.2" r="1" fill="#fb7185" className="sky-blink" />
    </svg>
  );
}

// ─── Atlanta skyline: a hazy far row and a near row with lit windows ─────

type Bldg = { x: number; w: number; h: number; roof?: "round" | "twin" | "spire" | "gable" };

// Downtown landmarks: Westin Peachtree Plaza (round), Bank of America Plaza
// (spire), 191 Peachtree (twin crowns), One Atlantic Center (gable)
const LANDMARKS: Bldg[] = [
  { x: 470, w: 30, h: 92, roof: "round" },
  { x: 560, w: 34, h: 104, roof: "spire" },
  { x: 652, w: 36, h: 96, roof: "twin" },
  { x: 770, w: 30, h: 98, roof: "gable" },
];

function buildings(seed: number, minH: number, maxH: number, withLandmarks: boolean): Bldg[] {
  const r = prng(seed);
  const out: Bldg[] = withLandmarks ? [...LANDMARKS] : [];
  let x = -10;
  while (x < 1210) {
    const w = 18 + r() * 30;
    // lower buildings toward the edges, taller downtown in the middle
    const centre = 1 - Math.min(1, Math.abs(x - 620) / 620);
    const h = minH + r() * (maxH - minH) * (0.45 + 0.55 * centre);
    out.push({ x, w, h, roof: r() < 0.08 ? "gable" : undefined });
    x += w + (r() < 0.25 ? 4 : 0);
  }
  return out;
}

const GROUND = 150;

function skylinePath(list: Bldg[]) {
  return list
    .map(({ x, w, h, roof }) => {
      const top = GROUND - h;
      const r = x + w;
      const cap =
        roof === "round"
          ? `Q${x + w / 2} ${top - 10} ${r} ${top}`
          : roof === "gable"
            ? `L${x + w / 2} ${top - 11} L${r} ${top}`
            : roof === "spire"
              ? `L${x + w / 2} ${top - 20} L${r} ${top}`
              : roof === "twin"
                ? `h${w * 0.18} v-6 h${w * 0.16} v6 h${w * 0.32} v-6 h${w * 0.16} v6 h${w * 0.18}`
                : `H${r}`;
      const mast = roof === "spire" ? `M${x + w / 2 - 0.7} ${top - 19} V${top - 36} h1.4 V${top - 19} Z` : "";
      return `M${x} ${GROUND} V${top} ${cap} V${GROUND} Z ${mast}`;
    })
    .join(" ");
}

const FAR = buildings(911, 30, 88, false);
const NEAR = buildings(52, 14, 58, true);

const WINDOWS = (() => {
  const r = prng(77);
  const lit: { x: number; y: number; warm: boolean }[] = [];
  for (const b of NEAR) {
    if (b.h < 26) continue;
    for (let y = GROUND - b.h + 7; y < GROUND - 6; y += 7)
      for (let x = b.x + 4; x < b.x + b.w - 4; x += 6) if (r() < 0.13) lit.push({ x, y, warm: r() < 0.75 });
  }
  return lit;
})();

// the aircraft warning light on top of the Bank of America Plaza mast
const MAST_TOP = { x: 560 + 34 / 2, y: GROUND - 104 - 36 };

function Skyline() {
  return (
    <svg viewBox={`0 0 1200 ${GROUND}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d={skylinePath(FAR)} fill="#0c1122" />
      <path d={skylinePath(NEAR)} fill="#05070d" />
      {WINDOWS.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width={2.2} height={2.8} fill={w.warm ? "#fcd9a0" : "#dbeafe"} opacity={w.warm ? 0.5 : 0.4} />
      ))}
      <circle cx={MAST_TOP.x} cy={MAST_TOP.y} r={1.6} fill="#fb7185" className="sky-blink" />
    </svg>
  );
}

// ─── The sky ─────────────────────────────────────────────────────────────

export function NightSky({ children }: { children: ReactNode }) {
  return (
    <div
      // `clip`, not `hidden`: hidden would make this a scroll container and break the sticky sky
      className="relative z-10 overflow-clip"
      style={{ background: "linear-gradient(180deg, #06080f 0%, #080b16 30%, #0b0f1d 65%, #121129 88%, #1c1530 100%)" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: STARS, backgroundSize: "1400px 1100px, 950px 1300px", backgroundPosition: "0 0, 310px 520px" }} />
          {/* Milky Way: a faint band with denser stars */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `${MILKY_STARS}, linear-gradient(118deg, transparent 30%, rgba(160,170,235,0.05) 46%, rgba(190,180,240,0.07) 50%, rgba(160,170,235,0.05) 54%, transparent 70%)`,
              backgroundSize: "700px 600px, 100% 100%",
              maskImage: BAND,
              WebkitMaskImage: BAND,
            }}
          />
          {TWINKLES.map(([x, y, delay, dur], i) => (
            <span
              key={i}
              className="sky-twinkle absolute h-[2px] w-[2px] rounded-full bg-[#eef2ff] shadow-[0_0_5px_1px_rgba(210,222,255,0.6)]"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay.toFixed(2)}s`, animationDuration: `${dur.toFixed(2)}s` }}
            />
          ))}

          {/* only where the margins beside the content are wide enough */}
          <Constellation c={DIPPER} className="left-[1.2%] top-[64%] hidden min-[1400px]:block" />
          <Constellation c={CASSIOPEIA} className="right-[1.5%] top-[40%] hidden min-[1400px]:block" />

          {/* the moon from the window */}
          <div className="absolute right-[9%] top-24 h-14 w-14 rounded-full bg-[#e7ecf4] opacity-80 shadow-[0_0_60px_18px_rgba(200,214,240,0.10)] md:top-28 md:h-16 md:w-16">
            <span className="absolute left-[22%] top-[26%] h-[18%] w-[18%] rounded-full bg-[#cfd6e2]" />
            <span className="absolute left-[55%] top-[55%] h-[12%] w-[12%] rounded-full bg-[#d6dce7]" />
          </div>

          {/* satellites crossing (Nilesat, Arabsat, Hotbird…) */}
          <div className="sky-moving sky-drift-east absolute left-0 top-[24%]" style={{ animationDuration: "110s", animationDelay: "-35s" }}>
            <Satellite />
          </div>
          <div className="sky-moving sky-drift-west absolute left-0 top-[68%] scale-75" style={{ animationDuration: "140s", animationDelay: "-90s" }}>
            <Satellite />
          </div>

          {/* shooting stars */}
          {[
            { left: "72%", top: "14%", dur: "17s", delay: "3s" },
            { left: "38%", top: "44%", dur: "23s", delay: "12s" },
          ].map((s) => (
            <div key={s.left} className="sky-moving absolute -rotate-[24deg]" style={{ left: s.left, top: s.top }}>
              <span
                className="sky-shoot block h-px w-28 bg-gradient-to-r from-white/90 to-transparent"
                style={{ animationDuration: s.dur, animationDelay: s.delay }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* hand-off from the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#06080f] to-transparent" />

      <div className="relative">{children}</div>

      {/* city glow + skyline, flowing into the footer */}
      <div aria-hidden className="pointer-events-none relative h-32 md:h-44">
        <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(140,90,160,0.2),transparent_70%)]" />
        <Skyline />
      </div>
    </div>
  );
}

/** Footer background: the ground under the skyline. */
export const NIGHT_GROUND = "#05070d";
