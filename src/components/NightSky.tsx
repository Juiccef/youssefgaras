import type { CSSProperties, ReactNode } from "react";
import { SkyMotion } from "@/components/SkyMotion";

// Background for the classic sections: the night outside the room's window.
// The sky itself stays put while the page scrolls over it (a sticky,
// viewport-sized layer): stars at three depths, a faint Milky Way, two
// constellations, the moon, satellites drifting across and the odd shooting
// star. All of it shifts against the mouse and drifts as the page scrolls,
// nearer things more (.par in globals.css, fed by SkyMotion). The Atlanta
// skyline rises at the end and runs into the footer. CSS/SVG only.

/** Deterministic PRNG so server and client render the same sky. */
function prng(seed: number) {
  let a = seed;
  return () => (a = (a * 16807) % 2147483647) / 2147483647;
}

/** How far a layer moves: `d` px against the mouse, `s` of the page's scroll. */
const depth = (d: number, s = 0) => ({ "--d": d, "--s": s }) as CSSProperties;

// mostly blue-white, a few warm stars and a few cool ones
const TINTS = ["226,232,255", "226,232,255", "226,232,255", "255,228,186", "186,214,255"];

function starLayer(seed: number, count: number, max = 0.75, sizes = [1, 1.6]) {
  const r = prng(seed);
  return Array.from({ length: count }, () => {
    const x = (r() * 100).toFixed(2);
    const y = (r() * 100).toFixed(2);
    const o = (0.18 + r() * (max - 0.18)).toFixed(2);
    const s = r() < 0.12 ? sizes[1] : sizes[0];
    const tint = TINTS[Math.floor(r() * TINTS.length)];
    return `radial-gradient(${s}px ${s}px at ${x}% ${y}%, rgba(${tint},${o}), transparent)`;
  }).join(",");
}

// Far to near: small tiles of faint stars at the back (so a phone's narrow
// screen still gets a full sky), fewer and brighter ones toward the front.
const STAR_FIELDS = [
  { tile: 560, stars: starLayer(7, 44, 0.55), d: 6, s: 0.02 },
  { tile: 760, stars: starLayer(4201, 30, 0.8), d: 13, s: 0.045 },
  { tile: 900, stars: starLayer(613, 14, 0.95, [1.6, 2.4]), d: 22, s: 0.08 },
];
// The Milky Way is a strip across the sky, densest along its middle and gone
// by its edges. The fall-off is in the stars themselves (each is dimmed by
// how far out it sits) and not a mask over the strip: a masked layer is
// composited again on every frame it moves.
const MILKY_FADE = (u: number) => {
  const d = Math.abs(u - 0.5) * 2;
  return d < 0.27 ? 1 - (d / 0.27) * 0.4 : 0.6 * (1 - (d - 0.27) / 0.73);
};
const MILKY_STARS = (() => {
  const r = prng(99);
  return Array.from({ length: 64 }, () => {
    const x = r();
    const y = (r() * 100).toFixed(2);
    const o = ((0.18 + r() * 0.32) * MILKY_FADE(x)).toFixed(2);
    const s = r() < 0.12 ? 1.6 : 1;
    const tint = TINTS[Math.floor(r() * TINTS.length)];
    return `radial-gradient(${s}px ${s}px at ${(x * 100).toFixed(2)}% ${y}%, rgba(${tint},${o}), transparent)`;
  }).join(",");
})();
const MILKY_HAZE = "linear-gradient(90deg, transparent 5%, rgba(160,170,235,0.037) 41%, rgba(190,180,240,0.07) 50%, rgba(160,170,235,0.037) 59%, transparent 95%)";
/** How wide the strip is: it crosses the screen on a slant, so it grows with both sides. */
const MILKY_WIDTH = "(38.9vw + 20.6lvh)";

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
    <svg
      width={c.w * 0.65}
      height={(c.h + 16) * 0.65}
      viewBox={`0 0 ${c.w} ${c.h + 16}`}
      data-constellation={c.label}
      className={`par absolute ${className}`}
      style={depth(15, 0.03)}
    >
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

// Two rows, each a little wider than the page so it can slide sideways with
// the mouse: the near row moves further than the hazy one behind it.
const ROW = "par-x absolute -left-8 top-0 h-full w-[calc(100%+4rem)]";

function Skyline() {
  return (
    <>
      <svg viewBox={`0 0 1200 ${GROUND}`} preserveAspectRatio="xMidYMax slice" className={ROW} style={depth(7)} aria-hidden>
        <path d={skylinePath(FAR)} fill="#0c1122" />
      </svg>
      <svg viewBox={`0 0 1200 ${GROUND}`} preserveAspectRatio="xMidYMax slice" className={ROW} style={depth(17)} aria-hidden>
        <path d={skylinePath(NEAR)} fill="#05070d" />
        {WINDOWS.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={2.2} height={2.8} fill={w.warm ? "#fcd9a0" : "#dbeafe"} opacity={w.warm ? 0.5 : 0.4} />
        ))}
        <circle cx={MAST_TOP.x} cy={MAST_TOP.y} r={1.6} fill="#fb7185" className="sky-blink" />
      </svg>
    </>
  );
}

// ─── The sky ─────────────────────────────────────────────────────────────

/** Everything in the sky, for a box the size of the screen: the page's sticky layer and the room's backdrop each hold one. */
function Sky() {
  return (
    <>
      {/* Each field is taller than the screen by one tile and a margin, so
          it can drift up as the page scrolls (wrapping a tile at a time)
          and shift with the mouse without showing an edge. */}
      {STAR_FIELDS.map(({ tile, stars, d, s }) => (
        <div
          key={tile}
          className="par-wrap absolute -inset-x-10 -top-10"
          style={
            {
              height: `calc(100lvh + ${tile}px + 5rem)`,
              backgroundImage: stars,
              backgroundSize: `${tile}px ${tile}px`,
              "--wrap": `${tile}px`,
              ...depth(d, s),
            } as CSSProperties
          }
        />
      ))}
      {/* Milky Way: a faint strip with denser stars, leaning across the sky */}
      <div
        className="par absolute h-[170vmax] rotate-[28deg] opacity-70"
        style={{
          width: `calc(${MILKY_WIDTH})`,
          left: `calc(50% - ${MILKY_WIDTH} / 2)`,
          top: "calc(50lvh - 85vmax)",
          backgroundImage: `${MILKY_STARS}, ${MILKY_HAZE}`,
          backgroundSize: "100% 600px, 100% 100%",
          ...depth(9),
        }}
      />
      {/* the twinkling ones, two screens of them so they can wrap as well */}
      <div className="par-wrap absolute inset-x-0 top-0 h-[200lvh]" style={{ "--wrap": "100lvh", ...depth(18, 0.065) } as CSSProperties}>
        {[0, 1].map((screen) => (
          <div key={screen} className="absolute inset-x-0 h-lvh" style={{ top: `${screen * 100}lvh` }}>
            {TWINKLES.map(([x, y, delay, dur], i) => (
              <span
                key={i}
                className="sky-twinkle absolute h-[2px] w-[2px] rounded-full bg-[#eef2ff] shadow-[0_0_5px_1px_rgba(210,222,255,0.6)]"
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay.toFixed(2)}s`, animationDuration: `${dur.toFixed(2)}s` }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Cassiopeia sits top left under the nav until the side margins are
          wide enough for both, beside the content */}
      <Constellation c={DIPPER} className="left-[1.2%] top-[64%] hidden min-[1400px]:block" />
      <Constellation c={CASSIOPEIA} className="left-[5%] top-[5.25rem] min-[1400px]:left-auto min-[1400px]:right-[1.5%] min-[1400px]:top-[40%]" />

      {/* the moon from the window */}
      <div
        data-moon=""
        className="par absolute right-[9%] top-24 h-14 w-14 rounded-full bg-[#e7ecf4] opacity-80 shadow-[0_0_60px_18px_rgba(200,214,240,0.10)] md:top-28 md:h-16 md:w-16"
        style={depth(26, 0.035)}
      >
        <span className="absolute left-[22%] top-[26%] h-[18%] w-[18%] rounded-full bg-[#cfd6e2]" />
        <span className="absolute left-[55%] top-[55%] h-[12%] w-[12%] rounded-full bg-[#d6dce7]" />
      </div>

      {/* satellites crossing (Nilesat, Arabsat, Hotbird…): the nearest things in the sky */}
      <div className="sky-moving sky-drift-east par absolute left-0 top-[24%]" style={{ animationDuration: "110s", animationDelay: "-35s", ...depth(44) }}>
        <Satellite />
      </div>
      <div className="sky-moving sky-drift-west par absolute left-0 top-[68%] scale-75" style={{ animationDuration: "140s", animationDelay: "-90s", ...depth(34) }}>
        <Satellite />
      </div>

      {/* shooting stars */}
      {[
        { left: "72%", top: "14%", dur: "17s", delay: "3s" },
        { left: "38%", top: "44%", dur: "23s", delay: "12s" },
      ].map((s) => (
        <div key={s.left} className="sky-moving par absolute -rotate-[24deg]" style={{ left: s.left, top: s.top, ...depth(30) }}>
          <span
            className="sky-shoot block h-px w-28 bg-gradient-to-r from-white/90 to-transparent"
            style={{ animationDuration: s.dur, animationDelay: s.delay }}
          />
        </div>
      ))}
    </>
  );
}

export function NightSky({ children }: { children: ReactNode }) {
  return (
    <div
      // `clip`, not `hidden`: hidden would make this a scroll container and break the sticky sky
      className="relative z-10 overflow-clip"
      style={{ background: "linear-gradient(180deg, #06080f 0%, #080b16 30%, #0b0f1d 65%, #121129 88%, #1c1530 100%)" }}
    >
      <SkyMotion />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div data-sky-vars="" className="sticky top-0 h-lvh overflow-hidden">
          <Sky />
        </div>
      </div>
      <div className="relative">{children}</div>

      {/* city glow + skyline, flowing into the footer */}
      <div aria-hidden data-sky-vars="" className="pointer-events-none relative h-32 md:h-44">
        <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(140,90,160,0.2),transparent_70%)]" />
        <Skyline />
      </div>
    </div>
  );
}

/**
 * The same sky behind the room, wherever the room is the view (a phone's Room
 * view, and anywhere once you've stepped inside): the room floats in it.
 * Fixed to the screen, under the room's own layers. It keeps running while
 * the page is showing instead (hidden, see globals.css), so the two skies
 * stay in step.
 */
export function RoomSky() {
  return (
    <div
      aria-hidden
      data-room-sky=""
      data-sky-vars=""
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #06080f 0%, #070a13 100%)" }}
    >
      <Sky />
    </div>
  );
}

/** Footer background: the ground under the skyline. */
export const NIGHT_GROUND = "#05070d";
