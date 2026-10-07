// Record player on a walnut record cabinet, right of the desk under the
// homelab map. The vinyl spins at 33⅓ rpm (1.8 s a turn); notes float up
// while the song is actually playing (html[data-lab-music], set by LabHero).

import { Box, FloorShadow, LED, boxHull, type Device, type Hotspot } from "./devices";
import { faceLeft, faceTop, iso, pts, type Pt } from "./iso";

const CAB = { x: 752, y: 446, w: 56, d: 42, h: 34, legs: 6 };
const CAB_TOP = CAB.legs + CAB.h;
const TT = { x: 757, y: 451, w: 46, d: 33, h: 6 };
const TT_TOP = CAB_TOP + TT.h;
/** Turntable-local positions (u along x, v along y from the plinth's back-left corner). */
const DISC = { u: 15, v: 16.5, r: 13.5 };
const PIVOT = { u: 39, v: 6 };
const STYLUS = { u: 25, v: 22 };

const WALNUT = { top: "#3a2a1d", left: "#2c2016", right: "#21180f" };
const SPINES = ["#7a2f22", "#2d4b6e", "#c9a14a", "#3c5d3a", "#8b5a2b", "#1f1f22", "#6b3a6b", "#a8432c", "#d6cfbf", "#2c6f73", "#4a4a52", "#b8862f", "#5a2a2a", "#7c8a99"];

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)].map((n) => n.toFixed(2)).join(" ");
  return `M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}`;
};

export function RecordPlayer(): Device {
  const top = faceTop(TT.x, TT.y, TT_TOP);
  const frontAt = faceLeft(CAB.x, CAB.y + CAB.d, CAB_TOP);
  const cw = { u: PIVOT.u + (PIVOT.u - STYLUS.u) * 0.25, v: PIVOT.v + (PIVOT.v - STYLUS.v) * 0.25 };

  const base = (
    <g data-base="record" opacity={0.42}>
      <FloorShadow x={CAB.x} y={CAB.y} w={CAB.w} d={CAB.d} spread={12} />
      {/* mid-century legs */}
      {[
        [CAB.x + 3, CAB.y + 3],
        [CAB.x + CAB.w - 6, CAB.y + 3],
        [CAB.x + 3, CAB.y + CAB.d - 6],
        [CAB.x + CAB.w - 6, CAB.y + CAB.d - 6],
      ].map(([lx, ly], i) => (
        <Box key={i} x={lx} y={ly} w={3} d={3} h={CAB.legs} tone={WALNUT} rim={false} />
      ))}
      {/* the cabinet: an open cubby full of records, and a door */}
      <Box x={CAB.x} y={CAB.y} z={CAB.legs} w={CAB.w} d={CAB.d} h={CAB.h} tone={WALNUT} rim={false} />
      <g transform={frontAt}>
        <rect x={3} y={4} width={25} height={CAB.h - 8} fill="#120d09" />
        {SPINES.map((c, i) => (
          <rect key={i} x={4 + i * 1.7} y={CAB.h - 4 - (23 + ((i * 7) % 4))} width={1.4} height={23 + ((i * 7) % 4)} fill={c} />
        ))}
        <rect x={31} y={4} width={22} height={CAB.h - 8} fill="#30231a" stroke="rgba(0,0,0,0.35)" strokeWidth={0.4} />
        <rect x={33} y={CAB.h / 2 - 3} width={0.9} height={6} rx={0.45} fill="#c9a14a" />
      </g>

      {/* turntable plinth: walnut sides, black top plate */}
      <Box x={TT.x} y={TT.y} z={CAB_TOP} w={TT.w} d={TT.d} h={TT.h} tone={{ top: "#17181b", left: "#3a2a1d", right: "#2c2016" }} rim={false} />
      <g transform={top}>
        <rect x={0.8} y={0.8} width={TT.w - 1.6} height={TT.d - 1.6} fill="#1d1e21" stroke="rgba(255,255,255,0.06)" strokeWidth={0.3} />
        {/* platter rim */}
        <circle cx={DISC.u} cy={DISC.v} r={DISC.r + 0.8} fill="#8b9096" />
        {/* start / speed controls */}
        <circle cx={4} cy={TT.d - 4} r={1.4} fill="#2b2d31" stroke="#6b7076" strokeWidth={0.3} />
        <rect x={7.5} y={TT.d - 5} width={4} height={1.6} rx={0.4} fill="#2b2d31" />
        <text x={TT.w - 4} y={TT.d - 2.4} fontSize={1.6} fill="rgba(255,255,255,0.35)" textAnchor="end" className="lab-mono">33 · 45</text>
      </g>
    </g>
  );

  const [nx, ny] = iso(TT.x + DISC.u, TT.y + DISC.v, TT_TOP + 10);
  const lights = (
    <g data-lights="record" opacity={0}>
      <defs>
        <linearGradient id="lab-vinyl-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0} />
          <stop offset="44%" stopColor="#fff" stopOpacity={0} />
          <stop offset="50%" stopColor="#fff" stopOpacity={0.13} />
          <stop offset="56%" stopColor="#fff" stopOpacity={0} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* data-vinyl: hidden while the record is lifted out into the close-up */}
      <g data-vinyl="" transform={faceTop(TT.x, TT.y, TT_TOP + 0.6)}>
        {/* the record: spins around its own centre (fill-box) */}
        <g className="lab-spin">
          <circle cx={DISC.u} cy={DISC.v} r={DISC.r} fill="#0b0b0c" />
          {[12.6, 11.4, 10.2, 9, 7.8, 6.6].map((r) => (
            <circle key={r} cx={DISC.u} cy={DISC.v} r={r} fill="none" stroke="#1d1d20" strokeWidth={0.35} />
          ))}
          <path d={arc(DISC.u, DISC.v, 11.8, 20, 70)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={0.5} />
          <path d={arc(DISC.u, DISC.v, 8.6, 200, 245)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.45} />
          {/* label: MF DOOM, metal-mask silver */}
          <circle cx={DISC.u} cy={DISC.v} r={4.6} fill="#c2c6cb" />
          <path d={`M${DISC.u - 4.6} ${DISC.v} A4.6 4.6 0 0 0 ${DISC.u + 4.6} ${DISC.v} Z`} fill="#8f959c" />
          <text x={DISC.u} y={DISC.v - 1.4} fontSize={1.25} fontWeight={700} fill="#15171a" textAnchor="middle">
            MF DOOM
          </text>
          <text x={DISC.u} y={DISC.v + 2.6} fontSize={0.95} fill="#101214" textAnchor="middle">
            doomsday
          </text>
          <circle cx={DISC.u} cy={DISC.v} r={0.5} fill="#cfd3d8" />
        </g>
        {/* the light stays put while the record turns under it */}
        <circle cx={DISC.u} cy={DISC.v} r={DISC.r} fill="url(#lab-vinyl-sheen)" />
      </g>
      {/* tone arm, resting in the groove */}
      <g transform={faceTop(TT.x, TT.y, TT_TOP + 2.6)}>
        <circle cx={PIVOT.u} cy={PIVOT.v} r={2.6} fill="#9aa0a6" />
        <circle cx={PIVOT.u} cy={PIVOT.v} r={1.2} fill="#5b6167" />
        <circle cx={cw.u} cy={cw.v} r={1.7} fill="#4b5056" stroke="#9aa0a6" strokeWidth={0.3} />
        <path d={`M${PIVOT.u} ${PIVOT.v} L${STYLUS.u} ${STYLUS.v}`} stroke="#c9ced3" strokeWidth={0.8} strokeLinecap="round" />
        <rect x={STYLUS.u - 1.6} y={STYLUS.v - 0.9} width={3.2} height={1.8} rx={0.4} fill="#2a2d31" transform={`rotate(${(Math.atan2(STYLUS.v - PIVOT.v, STYLUS.u - PIVOT.u) * 180) / Math.PI} ${STYLUS.u} ${STYLUS.v})`} />
      </g>
      {/* power light on the plinth */}
      <g transform={faceLeft(TT.x, TT.y + TT.d, TT_TOP)}>
        <circle cx={TT.w - 3} cy={TT.h / 2} r={0.55} fill={LED.amber} />
      </g>
      {/* notes drift up while it's actually playing */}
      {["♪", "♫", "♪"].map((n, i) => (
        <text
          key={i}
          x={nx - 6 + i * 7}
          y={ny}
          fontSize={9}
          fill="#e6d9b5"
          className="lab-note"
          style={{ animationDelay: `${i * 0.85}s` }}
        >
          {n}
        </text>
      ))}
    </g>
  );

  // the close-up lifts the record off the platter: its square, on the turntable's top
  const z = TT_TOP + 0.6;
  const [u0, v0, d] = [TT.x + DISC.u - DISC.r, TT.y + DISC.v - DISC.r, DISC.r * 2];
  const face: [Pt, Pt, Pt] = [[u0, v0, z], [u0 + d, v0, z], [u0, v0 + d, z]];
  const hotspot: Hotspot = {
    id: "record",
    label: "Record player",
    // no hover label: what it plays is a surprise
    quiet: true,
    points: pts(boxHull(CAB.x, CAB.y, 0, CAB.w, CAB.d, TT_TOP + 4)),
    face,
  };

  return { base, lights, hotspots: [hotspot] };
}
