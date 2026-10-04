// Youssef's room as a floating diorama: plank floor, two walls (window with
// the Atlanta skyline, his certificates, a photo print, a map of the
// homelab), a lamp, a plant, a rug and a desk chair. Resume, work badge and
// phone lie on the desk. Every object here opens a close-up.

import type { ReactNode } from "react";
import { Box, FloorShadow, LED, TONES, boxHull, type Device, type Hotspot } from "./devices";
import { K, faceLeft, faceRect, faceRight, faceTop, iso, onLeft, onRight, pts, rng, type Pt } from "./iso";
import { PHOTOS, ROOM_POSTER } from "@/lib/content";

export const ROOM = { x0: 430, y0: 440, x1: 860, y1: 790, h: 180, t: 6, slab: 12 };
const { x0, y0, x1, y1, h: WH, t: T, slab: SLAB } = ROOM;
const RW = x1 - x0; // back-right wall, along x
const LW = y1 - y0; // back-left wall, along y

/** Outer corners of the diorama (for framing the camera). */
export const ROOM_CORNERS: Pt[] = [
  [x0 - T, y0 - T, WH],
  [x0 - T, y1, WH],
  [x1, y0 - T, WH],
  [x1, y1, -SLAB],
  [x0 - T, y1, -SLAB],
  [x1, y0 - T, -SLAB],
];

// Right wall inner face (plane y = y0): u runs from the corner toward +x
const rightFace = faceLeft(x0, y0, WH);
const rightAt = onLeft(x0, y0, WH);
// Left wall inner face (plane x = x0): u runs from the front end toward the corner
const leftFace = faceRight(x0, y1, WH);
const leftAt = onRight(x0, y1, WH);

const WALL_R = { top: "#30363c", left: "#1a1e22", right: "#262b31" };
const WALL_L = { top: "#30363c", left: "#262b31", right: "#15181c" };

const quad = (map: (u: number, v: number) => Pt, u: number, v: number, w: number, h: number): [Pt, Pt, Pt] => [
  map(u, v),
  map(u + w, v),
  map(u, v + h),
];

/** An iso circle (horizontal) projects to an axis-aligned ellipse. */
const isoEllipse = (r: number) => ({ rx: 1.2247 * r * K, ry: 0.7071 * r * K });

// ─── Wall art ────────────────────────────────────────────────────────────

/** `band`: a colored strip across the top of the certificate, like the real CompTIA one. */
type Cert = { id: string; u: number; brand: ReactNode; title: string; seal: string; label: string; band?: string };

const CERT_W = 36;
const CERT_H = 28;
const CERT_V = 34;

// u runs from the front of the wall toward the corner: CodePath hangs nearest the rack
const CERT_FRAMES: Cert[] = [
  {
    id: "cert-codepath",
    u: 182,
    brand: <tspan fill="#1f2d3d" fontWeight={700}>CodePath</tspan>,
    title: "Web Dev",
    seal: "#2f6fde",
    label: "CodePath Web Development certificate",
  },
  { id: "cert-ccna", u: 224, brand: <tspan fill="#1ba0d7" fontWeight={700}>CISCO</tspan>, title: "CCNA", seal: "#1ba0d7", label: "CCNA certificate" },
  {
    id: "cert-secplus",
    u: 266,
    brand: <tspan fill="#ffffff" fontWeight={700}>CompTIA</tspan>,
    title: "Security+",
    seal: "#c8102e",
    band: "#c8102e",
    label: "CompTIA Security+ certificate",
  },
  {
    id: "cert-gux",
    label: "Google UX Design certificate",
    u: 308,
    brand: (
      <>
        <tspan fill="#4285f4">G</tspan>
        <tspan fill="#ea4335">o</tspan>
        <tspan fill="#fbbc05">o</tspan>
        <tspan fill="#4285f4">g</tspan>
        <tspan fill="#34a853">l</tspan>
        <tspan fill="#ea4335">e</tspan>
      </>
    ),
    title: "UX Design",
    seal: "#34a853",
  },
];

function CertFrame({ c }: { c: Cert }) {
  const { u } = c;
  const v = CERT_V;
  return (
    <g>
      <rect x={u + 1.2} y={v + 1.6} width={CERT_W} height={CERT_H} fill="rgba(0,0,0,0.45)" />
      <rect x={u} y={v} width={CERT_W} height={CERT_H} fill="#0c0d0e" />
      <rect x={u + 2.4} y={v + 2.4} width={CERT_W - 4.8} height={CERT_H - 4.8} fill="#e9e6de" />
      {c.band && <rect x={u + 2.4} y={v + 2.4} width={CERT_W - 4.8} height={7} fill={c.band} />}
      <text x={u + 4.6} y={v + 8} fontSize={3.2}>{c.brand}</text>
      <text x={u + 4.6} y={v + 12.6} fontSize={3.3} fill="#1f2328" fontWeight={700}>{c.title}</text>
      {[16, 18.4].map((dy, i) => (
        <rect key={i} x={u + 4.6} y={v + dy} width={i === 1 ? 12 : 19} height={0.8} fill="#b5b1a8" />
      ))}
      <circle cx={u + CERT_W - 7.4} cy={v + CERT_H - 7} r={3} fill={c.seal} opacity={0.85} />
      <circle cx={u + CERT_W - 7.4} cy={v + CERT_H - 7} r={1.9} fill="none" stroke="#f5f3ee" strokeWidth={0.4} />
    </g>
  );
}

// between the lamp and the CRT, high and narrow enough that the CRT doesn't cut into its corner
const PRINT = { u: 24, v: 30, w: 80, h: 58 };
// left wall, front end (u runs from the front toward the corner): the bare stretch before the rack
const POSTER = { u: 22, v: 36, w: 64, h: 64 };
const MAP = { u: 344, v: 36, w: 80, h: 46 };
const WIN = { u: 236, v: 26, w: 96, h: 78 };

function NetworkMap() {
  const { u, v, w, h } = MAP;
  const node = (x: number, y: number, label: string) => (
    <g key={label}>
      <circle cx={u + x} cy={v + y} r={1.8} fill="#0f1a24" stroke="#e2e8f0" strokeWidth={0.45} />
      <text x={u + x} y={v + y + 4.6} fontSize={2.1} fill="#cbd5e1" textAnchor="middle" className="lab-mono">{label}</text>
    </g>
  );
  return (
    <g>
      <rect x={u + 1.2} y={v + 1.6} width={w} height={h} fill="rgba(0,0,0,0.45)" />
      <rect x={u} y={v} width={w} height={h} fill="#0c0d0e" />
      <rect x={u + 2} y={v + 2} width={w - 4} height={h - 4} fill="#0f1a24" />
      <text x={u + 5} y={v + 7.4} fontSize={2.8} fill="#e2e8f0" className="lab-mono">homelab.map</text>
      <g stroke="#94a3b8" strokeWidth={0.4} fill="none" opacity={0.8}>
        <path d={`M${u + 10} ${v + 25} L${u + 27} ${v + 25}`} />
        <path d={`M${u + 27} ${v + 25} L${u + 45} ${v + 15} M${u + 27} ${v + 25} L${u + 45} ${v + 25} M${u + 27} ${v + 25} L${u + 45} ${v + 35}`} />
        <path d={`M${u + 45} ${v + 15} L${u + 64} ${v + 15} M${u + 45} ${v + 25} L${u + 64} ${v + 25} M${u + 45} ${v + 35} L${u + 64} ${v + 35}`} strokeDasharray="1 1" />
      </g>
      {node(10, 25, "wan")}
      {node(27, 25, "caddy")}
      {node(45, 15, "adguard")}
      {node(45, 25, "docker")}
      {node(45, 35, "tailscale")}
      {node(64, 15, "dns")}
      {node(64, 25, "9+ apps")}
      {node(64, 35, "vpn")}
    </g>
  );
}

// Atlanta at night, in window-local units (0..96 × 0..78): [x, top, width]
const SKYLINE_FAR = [
  [0, 56, 7], [6, 50, 6], [11, 54, 5], [15, 47, 6], [20, 52, 6], [25, 44, 5], [49, 46, 6], [54, 50, 4], [68, 48, 5], [80, 45, 6], [85, 52, 5], [90, 48, 6],
];
const SKYLINE_NEAR = [
  [0, 64, 9], [8, 60, 7], [14, 66, 8], [21, 61, 6], [26, 58, 5], [50, 62, 8], [57, 66, 6], [66, 60, 7], [72, 64, 9], [80, 58, 6], [86, 63, 10],
];
// Westin Peachtree Plaza (round), 191 Peachtree (twin crowns), BoA Plaza (spire), One Atlantic Center (gable)
const LANDMARKS = [
  "M30 78 V27 Q33.5 24.5 37 27 V78 Z",
  "M39 78 V29 H40.5 V27 H42 V29 H45 V27 H46.5 V29 H48 V78 Z",
  "M58 78 V22 L62 13 L66 22 V78 Z",
  "M72 78 V26 L75.5 20 L79 26 V78 Z",
];
const STARS = [[6, 6], [14, 14], [22, 5], [31, 11], [44, 7], [52, 15], [70, 9], [89, 20], [38, 18], [60, 4]];

function WindowGlass() {
  const { u, v, w, h } = WIN;
  return (
    <g transform={`translate(${u} ${v})`}>
      <clipPath id="lab-win-clip">
        <rect width={w} height={h} />
      </clipPath>
      <g clipPath="url(#lab-win-clip)">
        <rect width={w} height={h} fill="url(#lab-sky)" />
        {STARS.map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={0.35} fill="#dbe4f5" opacity={0.7} />
        ))}
        <circle cx={82} cy={12} r={4.6} fill="#e7ecf4" />
        <circle cx={80.4} cy={11} r={1} fill="#cfd6e2" />
        {SKYLINE_FAR.map(([bx, by, bw], i) => (
          <rect key={i} x={bx} y={by} width={bw} height={h - by} fill="#141b2c" />
        ))}
        {LANDMARKS.map((d) => (
          <path key={d} d={d} fill="#0c1120" />
        ))}
        <line x1={62} y1={13} x2={62} y2={5} stroke="#0c1120" strokeWidth={0.6} />
        {SKYLINE_NEAR.map(([bx, by, bw], i) => (
          <rect key={i} x={bx} y={by} width={bw} height={h - by} fill="#070a12" />
        ))}
      </g>
    </g>
  );
}

// Lit office windows (every fourth one twinkles)
const CITY_LIGHTS = [
  [31.5, 32], [34.5, 38], [31.5, 46], [41, 34], [45.5, 40], [41, 52], [60, 28], [63.5, 33], [60, 44], [63.5, 52], [74, 32], [77, 40], [74, 50],
  [16.5, 50], [22, 56], [51, 50], [70, 52], [82, 49], [92, 54], [2, 60], [9.5, 64], [67.5, 64], [88, 66],
];

// ─── The room ───────────────────────────────────────────────────────────

const LAMP = { x: 452, y: 462, z0: 94, z1: 110, r0: 12, r1: 8.5 };
// tucked into the far corner, past the record cabinet
const POT = { x: 826, y: 454, s: 22, h: 20 };

export function Room(): Device {
  const plankPath = (() => {
    const P = 16;
    const segs: string[] = [];
    for (let r = 1; r * P < LW; r++) segs.push(`M0 ${r * P}H${RW}`);
    for (let r = 0; r * P < LW; r++)
      for (let u = ((r * 53) % 97) + 20; u < RW; u += 97) segs.push(`M${u} ${r * P}v${P}`);
    return segs.join("");
  })();

  const { u: pu, v: pv, w: pw, h: ph } = PRINT;

  const base = (
    <g data-base="room" opacity={0.42}>
      {/* slab + plank floor */}
      <Box x={x0 - T} y={y0 - T} z={-SLAB} w={RW + T} d={LW + T} h={SLAB} tone={{ top: "#1a1511", left: "#2a221b", right: "#211a14" }} rim={false} />
      <g transform={faceTop(x0, y0, 0)}>
        <rect width={RW} height={LW} fill="#1a1511" />
        {Array.from({ length: Math.ceil(LW / 16) }, (_, r) =>
          r % 2 ? <rect key={r} y={r * 16} width={RW} height={16} fill="#1d1813" /> : null,
        )}
        <path d={plankPath} stroke="#0f0c09" strokeWidth={0.6} fill="none" />
        {/* rug in front of the desk */}
        <g transform={`translate(${580 - x0} ${598 - y0})`}>
          <rect width={206} height={156} rx={2} fill="#1b1a2c" />
          <rect x={6} y={6} width={194} height={144} fill="none" stroke="#3a3656" strokeWidth={1.4} />
          <rect x={12} y={12} width={182} height={132} fill="none" stroke="#2a2740" strokeWidth={0.6} />
          <g stroke="#3a3656" strokeWidth={0.6}>
            {Array.from({ length: 26 }, (_, i) => (
              <path key={i} d={`M-3 ${4 + i * 5.9}h3M206 ${4 + i * 5.9}h3`} />
            ))}
          </g>
        </g>
      </g>

      {/* walls: back-right first, the back-left one overlaps it at the corner */}
      <Box x={x0 - T} y={y0 - T} w={RW + T} d={T} h={WH} tone={WALL_R} rim={false} />
      <Box x={x0 - T} y={y0} w={T} d={LW} h={WH} tone={WALL_L} rim={false} />

      <g transform={rightFace}>
        <rect y={WH - 5} width={RW} height={5} fill="#0e1113" />
        {/* window */}
        <rect x={WIN.u - 3.5} y={WIN.v - 3.5} width={WIN.w + 7} height={WIN.h + 7} fill="#0b0d0f" />
        <WindowGlass />
        <rect x={WIN.u + WIN.w / 2 - 1} y={WIN.v} width={2} height={WIN.h} fill="#0b0d0f" />
        <rect x={WIN.u} y={WIN.v + 34} width={WIN.w} height={2} fill="#0b0d0f" />
        {/* photo print */}
        <rect x={pu + 1.4} y={pv + 1.8} width={pw} height={ph} fill="rgba(0,0,0,0.45)" />
        <rect x={pu} y={pv} width={pw} height={ph} fill="#0c0d0e" />
        <rect x={pu + 2.4} y={pv + 2.4} width={pw - 4.8} height={ph - 4.8} fill="#ecebe7" />
        <clipPath id="lab-print-clip">
          <rect x={pu + 6} y={pv + 6} width={pw - 12} height={ph - 12} />
        </clipPath>
        <image
          href={PHOTOS[0]}
          x={pu + 6}
          y={pv + 6}
          width={pw - 12}
          height={ph - 12}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#lab-print-clip)"
        />
        <NetworkMap />
      </g>
      {/* window sill */}
      <Box x={x0 + WIN.u - 5} y={y0} z={WH - WIN.v - WIN.h - 3} w={WIN.w + 10} d={6} h={3} tone={{ top: "#343a41", left: "#22272c", right: "#1b1f23" }} rim={false} />

      <g transform={leftFace}>
        <rect y={WH - 5} width={LW} height={5} fill="#0e1113" />
        {CERT_FRAMES.map((c) => (
          <CertFrame key={c.id} c={c} />
        ))}
        {/* Hasbulla, framed */}
        <rect x={POSTER.u + 1.2} y={POSTER.v + 1.6} width={POSTER.w} height={POSTER.h} fill="rgba(0,0,0,0.45)" />
        <rect x={POSTER.u} y={POSTER.v} width={POSTER.w} height={POSTER.h} fill="#0c0d0e" />
        <clipPath id="lab-poster-clip">
          <rect x={POSTER.u + 1.8} y={POSTER.v + 1.8} width={POSTER.w - 3.6} height={POSTER.h - 3.6} />
        </clipPath>
        <image
          href={ROOM_POSTER.wall}
          x={POSTER.u + 1.8}
          y={POSTER.v + 1.8}
          width={POSTER.w - 3.6}
          height={POSTER.h - 3.6}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#lab-poster-clip)"
        />
        {/* ethernet wall plate: the internet comes in here */}
        <rect x={40} y={156} width={9} height={11} rx={0.8} fill="#c9ccd0" />
        <rect x={42.3} y={159.4} width={4.4} height={3.6} fill="#1a1c1e" />
      </g>

      {/* floor lamp's shadow (the lamp itself is drawn after the floor cables: see Lamp) */}
      <FloorShadow x={LAMP.x - 7} y={LAMP.y - 7} w={14} d={14} spread={10} />

      {/* plant in the far corner */}
      <FloorShadow x={POT.x} y={POT.y} w={POT.s} d={POT.s} spread={10} />
      <Box x={POT.x} y={POT.y} w={POT.s} d={POT.s} h={POT.h} tone={{ top: "#3d2c21", left: "#34251b", right: "#271b14" }} rim={false} />
      <g transform={faceTop(POT.x + 2, POT.y + 2, POT.h)}>
        <rect width={POT.s - 4} height={POT.s - 4} fill="#120d0a" />
      </g>
      <Leaves at={iso(POT.x + POT.s / 2, POT.y + POT.s / 2, POT.h)} />
    </g>
  );

  // Picture lights, baseboard strip, window glow, lamp light
  const strip = (width: number) => (
    <>
      <rect y={WH - 16} width={width} height={11} fill={LED.warm} opacity={0.05} />
      <rect y={WH - 5.6} width={width} height={0.7} fill={LED.warm} opacity={0.55} />
    </>
  );
  const pictureLight = (cx: number, top: number, key: string) => (
    <g key={key}>
      <ellipse cx={cx} cy={top + 10} rx={20} ry={14} fill="url(#lab-glow-white)" opacity={0.28} />
      <rect x={cx - 7} y={top - 3} width={14} height={1.6} rx={0.8} fill="#2b2f33" />
    </g>
  );
  const [lx, ly] = iso(LAMP.x, LAMP.y, LAMP.z0);
  const lights = (
    <g data-lights="room" opacity={0}>
      <g transform={rightFace}>
        {strip(RW)}
        {pictureLight(pu + pw / 2, pv, "p")}
        {pictureLight(MAP.u + MAP.w / 2, MAP.v, "m")}
        <g transform={`translate(${WIN.u} ${WIN.v})`}>
          <circle cx={82} cy={12} r={13} fill="url(#lab-glow-white)" opacity={0.35} />
          {CITY_LIGHTS.map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx}
              y={cy}
              width={0.9}
              height={0.9}
              fill={i % 3 ? "#fcd9a0" : "#dbeafe"}
              opacity={0.75}
              className={i % 4 === 0 ? "lab-led-pulse" : undefined}
              style={i % 4 === 0 ? { animationDelay: `${-i * 0.37}s` } : undefined}
            />
          ))}
        </g>
      </g>
      <g transform={leftFace}>
        {strip(LW)}
        {CERT_FRAMES.map((c) => pictureLight(c.u + CERT_W / 2, CERT_V, c.id))}
        {pictureLight(POSTER.u + POSTER.w / 2, POSTER.v, "poster")}
      </g>
      {/* lamp: warm light spilling out under the shade */}
      <ellipse cx={lx} cy={ly} rx={46} ry={30} fill="url(#lab-glow-warm)" opacity={0.6} />
      <ellipse cx={lx} cy={ly} {...isoEllipse(LAMP.r0 - 1)} fill="#fde2b8" opacity={0.6} />
    </g>
  );

  const hotspots: Hotspot[] = [
    ...CERT_FRAMES.map((c) => ({
      id: c.id,
      label: c.label,
      points: faceRect(leftAt, c.u, CERT_V, c.u + CERT_W, CERT_V + CERT_H),
      face: quad(leftAt, c.u, CERT_V, CERT_W, CERT_H),
    })),
    {
      id: "poster",
      label: "Hasbulla poster",
      points: faceRect(leftAt, POSTER.u, POSTER.v, POSTER.u + POSTER.w, POSTER.v + POSTER.h),
      face: quad(leftAt, POSTER.u, POSTER.v, POSTER.w, POSTER.h),
    },
    { id: "print", label: "Photography — framed print", points: faceRect(rightAt, pu, pv, pu + pw, pv + ph), face: quad(rightAt, pu, pv, pw, ph) },
    {
      id: "map",
      label: "What runs in my homelab — network map",
      points: faceRect(rightAt, MAP.u, MAP.v, MAP.u + MAP.w, MAP.v + MAP.h),
      face: quad(rightAt, MAP.u, MAP.v, MAP.w, MAP.h),
    },
  ];

  return { base, lights, occluders: [], hotspots };
}

// ─── Floor lamp in the back corner ──────────────────────────────────────
// Its own device so it's painted over the cable that runs behind it along
// the baseboard (its light lives in the room's lights layer).

export function Lamp(): Device {
  const base = (
    <g data-base="room" opacity={0.42}>
      <Box x={LAMP.x - 7} y={LAMP.y - 7} w={14} d={14} h={2.4} tone={TONES.metal} rim={false} />
      <Box x={LAMP.x - 1.5} y={LAMP.y - 1.5} z={2.4} w={3} d={3} h={LAMP.z0 - 2.4} tone={TONES.metal} rim={false} />
      <LampShade />
    </g>
  );
  return {
    base,
    lights: null,
    // base plate and pole (not the shade: its lit underside is drawn on top of it)
    occluders: [boxHull(LAMP.x - 7, LAMP.y - 7, 0, 14, 14, 2.4), boxHull(LAMP.x - 1.5, LAMP.y - 1.5, 0, 3, 3, LAMP.z0)],
  };
}

/** Drum shade: two iso ellipses joined at their widest points. */
function LampShade() {
  const [bx, by] = iso(LAMP.x, LAMP.y, LAMP.z0);
  const [tx, ty] = iso(LAMP.x, LAMP.y, LAMP.z1);
  const b = isoEllipse(LAMP.r0);
  const t = isoEllipse(LAMP.r1);
  return (
    <g>
      <path
        d={`M${bx - b.rx} ${by} A${b.rx} ${b.ry} 0 0 0 ${bx + b.rx} ${by} L${tx + t.rx} ${ty} A${t.rx} ${t.ry} 0 0 1 ${tx - t.rx} ${ty} Z`}
        fill="#3b3127"
      />
      <ellipse cx={tx} cy={ty} rx={t.rx} ry={t.ry} fill="#4a3e31" />
    </g>
  );
}

const LEAVES = [
  [-24, 30, 5, "#1d3a28"], [22, 32, 5, "#1a3424"], [-8, 40, 5.5, "#24452f"], [8, 38, 5, "#21402c"],
  [-38, 22, 4.5, "#18301f"], [36, 24, 4.5, "#1a3424"], [0, 44, 5, "#2a5036"], [-16, 26, 4, "#2a5036"], [16, 26, 4, "#24452f"],
] as const;

function Leaves({ at: [px, py] }: { at: [number, number] }) {
  return (
    <g>
      {LEAVES.map(([a, len, wd, c], i) => (
        <g key={i} transform={`translate(${px} ${py - 2}) rotate(${a})`}>
          <path d={`M0 0 C${-wd * 1.4} ${-len * 0.35}, ${-wd} ${-len * 0.85}, 0 ${-len} C${wd} ${-len * 0.85}, ${wd * 1.4} ${-len * 0.35}, 0 0 Z`} fill={c} />
          <path d={`M0 0 L0 ${-len * 0.92}`} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
        </g>
      ))}
    </g>
  );
}

// ─── Desk chair (in front of the keyboard, facing the desk) ─────────────

export function Chair({ x, y }: { x: number; y: number }): Device {
  const legs = Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2 + 0.3);
  const base = (
    <g data-base="room" opacity={0.42}>
      <FloorShadow x={x - 20} y={y - 20} w={40} d={40} spread={10} />
      <g transform={faceTop(x - 24, y - 24, 3)}>
        {legs.map((a, i) => (
          <g key={i}>
            <path d={`M24 24 L${24 + Math.cos(a) * 21} ${24 + Math.sin(a) * 21}`} stroke="#2a2f35" strokeWidth={2.6} strokeLinecap="round" />
            <circle cx={24 + Math.cos(a) * 21} cy={24 + Math.sin(a) * 21} r={2} fill="#0d0f11" />
          </g>
        ))}
      </g>
      <Box x={x - 2} y={y - 2} z={4} w={4} d={4} h={38} tone={TONES.metal} rim={false} />
      <Box x={x - 18} y={y - 18} z={42} w={36} d={36} h={7} tone={TONES.fabric} rim={false} />
      <Box x={x - 17} y={y + 13} z={49} w={34} d={5} h={48} tone={TONES.fabric} rim={false} />
      <g transform={faceLeft(x - 17, y + 18, 97)}>
        <rect x={3} y={4} width={28} height={40} rx={4} fill="rgba(255,255,255,0.025)" />
      </g>
    </g>
  );
  // seat + gas lift, and the backrest
  return { base, lights: null, occluders: [boxHull(x - 18, y - 18, 0, 36, 36, 49), boxHull(x - 17, y + 13, 0, 34, 5, 97)] };
}

// ─── Rubber band ball ───────────────────────────────────────────────────

// natural "regular" bands, and the colorful ones (a touch muted for the dim room); about 70% of the top layer is colored
const BAND_TAN = ["#c59a62", "#b8894f", "#d1aa72"];
const BAND_COLORS = ["#d8452f", "#2f6fd6", "#3b9e4f", "#e8b72c", "#e47524", "#8a52c4", "#de5c96", "#1e9e98"];

/**
 * Each band is a great circle at a random angle; only the half facing us is
 * drawn (a half-ellipse from one edge of the ball to the other), so the
 * ball reads as solid. Under the colored bands sits a layer of thin tan ones.
 */
function RubberBandBall({ x, y, z, r, seed }: { x: number; y: number; z: number; r: number; seed: number }) {
  const rand = rng(seed);
  const [cx, cy] = iso(x, y, z + r);
  // a sphere projects to a circle; our isometric view is a true one scaled by √(3/2)
  const R = r * K * 1.2247;
  const k = r / 21; // band widths were tuned at r = 21

  const band = (i: number, thin: boolean) => {
    const a = rand() * Math.PI * 2;
    const nz = 0.1 + rand() * 0.88; // how much the band's axis points at us
    const s = Math.sqrt(1 - nz * nz);
    const [nx, ny] = [s * Math.cos(a), s * Math.sin(a)];
    // the band crosses the silhouette at ±u and bulges toward -n (its front half)
    const [ux, uy] = [ny / s, -nx / s];
    const d = Math.atan2(-ny, -nx) - Math.atan2(uy, ux);
    const sweep = Math.sin(d) > 0 ? 1 : 0;
    const rot = ((Math.atan2(uy, ux) * 180) / Math.PI).toFixed(1);
    const f = (n: number) => n.toFixed(2);
    const path = `M${f(cx + R * ux)} ${f(cy + R * uy)} A${f(R)} ${f(R * nz)} ${rot} 0 ${sweep} ${f(cx - R * ux)} ${f(cy - R * uy)}`;
    const tan = thin || rand() < 0.3;
    const color = tan ? BAND_TAN[i % BAND_TAN.length] : BAND_COLORS[Math.floor(rand() * BAND_COLORS.length)];
    const w = (thin ? 1 + rand() * 0.6 : 1.5 + rand() * 1.3) * k;
    return { path, color, w };
  };
  const under = Array.from({ length: 26 }, (_, i) => band(i, true));
  const over = Array.from({ length: 30 }, (_, i) => band(i, false));
  const clip = `lab-rbb-clip-${seed}`;
  const shade = `lab-rbb-shade-${seed}`;

  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <radialGradient id={shade} cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="40%" stopColor="#fff" stopOpacity={0} />
          <stop offset="78%" stopColor="#000" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.62} />
        </radialGradient>
      </defs>
      {/* contact shadow on the desk */}
      <g transform={faceTop(x - r, y - r, z)}>
        <circle cx={r} cy={r} r={r * 0.95} fill="url(#lab-shadow)" />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="#a87d48" />
      <g clipPath={`url(#${clip})`} fill="none" strokeLinecap="butt">
        {[...under, ...over].map((b, i) => (
          <g key={i}>
            <path d={b.path} stroke="rgba(0,0,0,0.32)" strokeWidth={b.w + k} />
            <path d={b.path} stroke={b.color} strokeWidth={b.w} />
          </g>
        ))}
      </g>
      <circle cx={cx} cy={cy} r={R} fill={`url(#${shade})`} />
      <circle cx={cx} cy={cy} r={R - 0.4} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={0.8} />
    </g>
  );
}

// ─── On the desk: resume, work badge, phone ─────────────────────────────

export function DeskItems({ x, y, z }: { x: number; y: number; z: number }): Device {
  // positions relative to the desk's top-left corner
  const paper = { x: x + 152, y: y + 8, w: 30, d: 39 };
  const badge = { x: x + 3, y: y + 73, w: 13, d: 17 };
  const phone = { x: x + 100, y: y + 70, w: 11, d: 20 };
  const TILT = -7;

  const base = (
    <g data-base="deskitems" opacity={0.42}>
      {/* resume: two sheets, the top one slightly turned */}
      <g transform={faceTop(paper.x, paper.y, z + 0.2)}>
        <rect x={2} y={-1.5} width={paper.w} height={paper.d} fill="#d9d6cf" />
        <g transform={`rotate(${TILT} ${paper.w / 2} ${paper.d / 2})`}>
          <rect width={paper.w} height={paper.d} fill="#f1efe9" />
          <rect x={4} y={4} width={16} height={2} fill="#1f2328" />
          <rect x={4} y={7.6} width={10} height={0.9} fill="#8a8f96" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={4} y={11 + i * 3.1} width={i % 3 === 2 ? 14 : 22} height={0.8} fill="#b8b4ab" />
          ))}
        </g>
      </g>

      {/* McKenney's badge on a lanyard */}
      <g transform={faceTop(badge.x, badge.y, z + 0.3)}>
        <path d={`M${badge.w / 2 - 2} 0 C -6 -10, 30 -14, ${badge.w / 2 + 2} 0`} fill="none" stroke="#1d4ed8" strokeWidth={1.2} />
        <rect width={badge.w} height={badge.d} rx={1} fill="#f1f5f9" />
        <rect width={badge.w} height={4} rx={1} fill="#1e3a8a" />
        <rect x={2} y={6} width={5} height={6} fill="#94a3b8" />
        <rect x={8} y={7} width={3.5} height={0.8} fill="#475569" />
        <rect x={8} y={9} width={3} height={0.8} fill="#94a3b8" />
      </g>

      {/* phone */}
      <Box x={phone.x} y={phone.y} z={z} w={phone.w} d={phone.d} h={1.2} tone={{ top: "#0b0c0d", left: "#1a1c1f", right: "#131517" }} rim={false} />

      {/* rubber band ball, ~6" across, right of the CRT at the back of the desk */}
      <RubberBandBall x={x + 116} y={y + 28} z={z} r={12.6} seed={7} />
    </g>
  );

  const lights = (
    <g data-lights="deskitems" opacity={0}>
      <g transform={faceTop(phone.x, phone.y, z + 1.25)}>
        <rect x={0.9} y={1.2} width={phone.w - 1.8} height={phone.d - 2.4} rx={1.2} fill="#0f172a" />
        <rect x={1.8} y={3} width={phone.w - 3.6} height={3.2} rx={0.8} fill="#e2e8f0" opacity={0.85} />
        <rect x={2.4} y={3.9} width={4} height={0.6} fill="#334155" />
      </g>
    </g>
  );

  const padBox = (b: { x: number; y: number; w: number; d: number }, pad: number, h = 2) =>
    pts([
      [b.x - pad, b.y - pad, z + h],
      [b.x + b.w + pad, b.y - pad, z + h],
      [b.x + b.w + pad, b.y + b.d + pad, z + h],
      [b.x - pad, b.y + b.d + pad, z + h],
    ]);
  const flat = (b: { x: number; y: number; w: number; d: number }, dz: number): [Pt, Pt, Pt] => [
    [b.x, b.y, z + dz],
    [b.x + b.w, b.y, z + dz],
    [b.x, b.y + b.d, z + dz],
  ];

  // The top sheet is turned by TILT around its centre
  const a = (TILT * Math.PI) / 180;
  const turn = (u: number, v: number): Pt => {
    const du = u - paper.w / 2;
    const dv = v - paper.d / 2;
    return [
      paper.x + paper.w / 2 + du * Math.cos(a) - dv * Math.sin(a),
      paper.y + paper.d / 2 + du * Math.sin(a) + dv * Math.cos(a),
      z + 0.2,
    ];
  };

  const hotspots: Hotspot[] = [
    { id: "resume", label: "Resume", points: padBox(paper, 4), face: [turn(0, 0), turn(paper.w, 0), turn(0, paper.d)] },
    { id: "badge", label: "Experience — work badge", points: padBox(badge, 5), face: flat(badge, 0.3) },
    { id: "phone", label: "Contact — phone", points: padBox(phone, 5), face: flat(phone, 1.25) },
  ];

  return { base, lights, occluders: [], hotspots };
}
