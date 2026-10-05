import type { ReactNode } from "react";
import { faceLeft, faceRect, faceTop, onLeft, pts, rng, type Pt } from "./iso";

// Every device renders into two layers that share one viewBox:
//   base   — static art (never repaints after power-up)
//   lights — LEDs, screens, glows (the only layer that animates)
// plus `occluders`: silhouettes used to mask floor cables and packets that
// pass behind or under the device.

/**
 * A clickable object: screen-space polygon, plus the world-space face it sits
 * on (top-left, top-right, bottom-left corners) — the close-up view lifts off
 * that face when it opens.
 */
/** `label` names the object (screen readers, and the hover label when hints.tsx has no shorter one); `quiet`: no hover label at all. */
export type Hotspot = { id: string; label: string; points: string; face?: [Pt, Pt, Pt]; quiet?: boolean };
/** Boot label shown while a part powers on (screen coords: leader anchor + label's right edge). */
export type Tag = { id: string; text: string; anchor: [number, number]; box: [number, number] };

export type Device = {
  base: ReactNode;
  lights: ReactNode;
  occluders: Pt[][];
  hotspots?: Hotspot[];
  tags?: Tag[];
};

export type Tone = { top: string; left: string; right: string };

export const TONES = {
  chassis: { top: "#1c232a", left: "#12181e", right: "#0c1014" },
  wood: { top: "#2a2119", left: "#1b1510", right: "#140f0b" },
  metal: { top: "#3b444d", left: "#272e35", right: "#1c2127" },
  plastic: { top: "#191e23", left: "#101418", right: "#0b0e11" },
  putty: { top: "#a39b86", left: "#8a8371", right: "#6c665a" },
  puttyDark: { top: "#8a8371", left: "#736d5e", right: "#5a554a" },
  fabric: { top: "#22262c", left: "#181b20", right: "#121418" },
} satisfies Record<string, Tone>;

export const LED = {
  green: "#4ade80",
  emerald: "#34d399",
  cyan: "#22d3ee",
  blue: "#60a5fa",
  amber: "#fbbf24",
  red: "#fb7185",
  white: "#f1f5f9",
  warm: "#fdba74",
} as const;
export type LedColor = keyof typeof LED;

const RIM = "rgba(160,255,230,0.08)";
const RIM_TOP = "rgba(160,255,230,0.15)";
const LABEL = "rgba(210,255,240,0.38)";

export function boxHull(x: number, y: number, z: number, w: number, d: number, h: number): Pt[] {
  return [
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
    [x, y + d, z + h],
  ];
}

export function Box({
  x, y, z = 0, w, d, h, tone = TONES.chassis, rim = true, fillOpacity,
}: {
  x: number; y: number; z?: number; w: number; d: number; h: number;
  tone?: Tone; rim?: boolean; fillOpacity?: number;
}) {
  const s = rim ? RIM : "none";
  return (
    <g fillOpacity={fillOpacity}>
      <polygon points={pts([[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]])} fill={tone.left} stroke={s} strokeWidth={0.6} strokeLinejoin="round" />
      <polygon points={pts([[x + w, y + d, z + h], [x + w, y, z + h], [x + w, y, z], [x + w, y + d, z]])} fill={tone.right} stroke={s} strokeWidth={0.6} strokeLinejoin="round" />
      <polygon points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={tone.top} stroke={rim ? RIM_TOP : "none"} strokeWidth={0.6} strokeLinejoin="round" />
    </g>
  );
}

/** Soft contact shadow on the floor under a footprint. */
export function FloorShadow({ x, y, w, d, spread = 16 }: { x: number; y: number; w: number; d: number; spread?: number }) {
  return (
    <g transform={faceTop(x - spread, y - spread, 0)}>
      <rect width={w + spread * 2} height={d + spread * 2} rx={spread} fill="url(#lab-shadow)" />
    </g>
  );
}

export type Blink = "act" | "disk" | "pulse";
const BLINK_RANGE: Record<Blink, [number, number]> = { act: [0.7, 1.9], disk: [1.8, 4.6], pulse: [2.6, 4.4] };

/** `r2`: two random numbers drawn when the scene is built (never during render, so SSR and hydration agree). */
export function Led({
  cx, cy, c, blink, r2, r = 0.8, glow = 3.4,
}: {
  cx: number; cy: number; c: LedColor; blink?: Blink; r2?: [number, number]; r?: number; glow?: number;
}) {
  let style: React.CSSProperties | undefined;
  if (blink && r2) {
    const [lo, hi] = BLINK_RANGE[blink];
    const dur = lo + r2[0] * (hi - lo);
    style = { animationDuration: `${dur.toFixed(2)}s`, animationDelay: `${(-r2[1] * dur).toFixed(2)}s` };
  }
  return (
    <g className={blink ? `lab-led-${blink}` : undefined} style={style}>
      {glow > 0 && <circle cx={cx} cy={cy} r={r * glow} fill={`url(#lab-glow-${c})`} />}
      <circle cx={cx} cy={cy} r={r} fill={LED[c]} />
    </g>
  );
}

export function Label({ x, y, children, size = 3, anchor, fill = LABEL }: { x: number; y: number; children: ReactNode; size?: number; anchor?: "middle" | "end"; fill?: string }) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} className="lab-mono" letterSpacing={0.1}>
      {children}
    </text>
  );
}

// ─── Desk with an old CRT ───────────────────────────────────────────────

const AMBER = "#ffb347";
const AMBER_DIM = "rgba(255,179,71,0.45)";

/** Front face of the CRT housing (face-local units). */
export const CRT = { w: 72, h: 62, screen: { u: 9, v: 6, w: 54, h: 40.5 } };

export function Desk({ x, y, seed }: { x: number; y: number; seed: number }): Device {
  const rand = rng(seed);
  const w = 200, d = 92, zt = 60, th = 5;
  const top = zt + th;
  // CRT: deep funnel at the back, thick housing at the front (screen faces +y)
  const cx = x + 22, cy = y + 36, cz = top + 3;
  const front = faceLeft(cx, cy + 18, cz + CRT.h);
  const frontAt = onLeft(cx, cy + 18, cz + CRT.h);
  const { screen: sc } = CRT;
  // keyboard
  const kx = x + 30, ky = y + 62;

  const bars = Array.from({ length: 12 }, (_, i) => i);
  const base = (
    <g data-base="desk" opacity={0.42}>
      <FloorShadow x={x} y={y} w={w} d={d} spread={18} />
      {[[x + 4, y + 4], [x + w - 10, y + 4], [x + 4, y + d - 10], [x + w - 10, y + d - 10]].map(([lx, ly], i) => (
        <Box key={i} x={lx} y={ly} w={6} d={6} h={zt} tone={TONES.metal} rim={false} />
      ))}
      <Box x={x} y={y} z={zt} w={w} d={d} h={th} tone={TONES.wood} />

      {/* CRT: stand, funnel, housing */}
      <Box x={x + 34} y={y + 24} z={top} w={48} d={30} h={3} tone={TONES.puttyDark} rim={false} />
      <Box x={x + 32} y={y + 4} z={top + 8} w={52} d={32} h={44} tone={TONES.puttyDark} rim={false} />
      <Box x={cx} y={cy} z={cz} w={CRT.w} d={18} h={CRT.h} tone={TONES.putty} rim={false} />
      <g transform={front}>
        {/* bezel bevel + glass */}
        <rect x={sc.u - 3} y={sc.v - 3} width={sc.w + 6} height={sc.h + 6} rx={4} fill="#6f6958" />
        <rect x={sc.u - 1.2} y={sc.v - 1.2} width={sc.w + 2.4} height={sc.h + 2.4} rx={3.2} fill="#1d1a14" />
        <rect x={sc.u} y={sc.v} width={sc.w} height={sc.h} rx={2.6} fill="#0b0904" />
        {/* badge, vents, power */}
        <text x={sc.u} y={CRT.h - 7.2} fontSize={2.6} fill="#4a4538" fontWeight={700} letterSpacing={0.3}>YG-386</text>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={sc.u + 22 + i * 2.4} y={CRT.h - 9.4} width={1.2} height={3.4} rx={0.4} fill="#6f6958" />
        ))}
        <rect x={CRT.w - 15} y={CRT.h - 10} width={6} height={3.6} rx={0.6} fill="#77705f" />
      </g>

      {/* keyboard: beige, chunky */}
      <Box x={kx} y={ky} z={top} w={58} d={19} h={2.4} tone={TONES.putty} rim={false} />
      <g transform={faceTop(kx, ky, top + 2.4)}>
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 15 }, (_, c) => (
            <rect key={`${r}-${c}`} x={2.4 + c * 3.6} y={2.2 + r * 3.8} width={2.9} height={2.9} rx={0.4} fill={r === 3 && c > 3 && c < 11 ? "#d8d0bb" : "#c9c0a9"} />
          )),
        )}
      </g>
      {/* mug */}
      <Box x={x + 18} y={y + 66} z={top} w={9} d={9} h={11} tone={TONES.metal} rim={false} />
    </g>
  );

  const lights = (
    <g data-lights="desk" opacity={0}>
      {/* amber phosphor: a tiny DOS shell */}
      <g data-screen="" transform={front}>
        <rect x={sc.u} y={sc.v} width={sc.w} height={sc.h} rx={2.6} fill="#1a0f03" />
        <rect x={sc.u} y={sc.v} width={sc.w} height={sc.h} rx={2.6} fill="url(#lab-crt-glow)" />
        <g className="lab-mono" fontSize={2.5} fill={AMBER}>
          <text x={sc.u + 3} y={sc.v + 5}>C:\YG&gt; dir projects</text>
          {["door-lock  .py", "panther    .js", "word-bot   .py", "ufc-rsvp   .htm"].map((f, i) => (
            <text key={f} x={sc.u + 3} y={sc.v + 9.2 + i * 3.4} fill={AMBER_DIM}>{f}</text>
          ))}
          <text x={sc.u + 3} y={sc.v + 24.4}>C:\YG&gt; threats</text>
          <text data-blocked-count="" x={sc.u + 3} y={sc.v + 32} fontSize={6}>0</text>
          <text x={sc.u + 3} y={sc.v + 37}>C:\YG&gt;<tspan className="lab-caret">█</tspan></text>
        </g>
        {/* traffic bars */}
        <line x1={sc.u + 30} y1={sc.v + 34} x2={sc.u + 51} y2={sc.v + 34} stroke={AMBER_DIM} strokeWidth={0.3} />
        {bars.map((i) => {
          const hgt = 5 + rand() * 18;
          return <rect key={i} data-bar="" x={sc.u + 30.4 + i * 1.75} y={sc.v + 34 - hgt} width={1.1} height={hgt} fill={AMBER} opacity={0.7} />;
        })}
        <text x={sc.u + 30} y={sc.v + 5} fontSize={2.2} fill={AMBER_DIM} className="lab-mono">wan0</text>
        <rect x={sc.u} y={sc.v} width={sc.w} height={sc.h} rx={2.6} fill="url(#lab-scan)" />
      </g>
      <g transform={front}>
        <Led cx={CRT.w - 12} cy={CRT.h - 8.2} r={0.7} glow={4} c="green" />
      </g>
    </g>
  );

  const face: [Pt, Pt, Pt] = [frontAt(0, 0), frontAt(CRT.w, 0), frontAt(0, CRT.h)];

  return {
    base,
    lights,
    occluders: [
      boxHull(x, y, 0, w, d, top),
      boxHull(x + 32, y + 4, top, 52, 50, CRT.h + 3),
    ],
    hotspots: [{ id: "monitor", label: "Projects — the CRT", points: faceRect(frontAt, 0, 0, CRT.w, CRT.h), face }],
  };
}
