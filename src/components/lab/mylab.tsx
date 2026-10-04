// Youssef's actual homelab, drawn from a photo of the real thing:
// Tecmojo 6U 10" rack on a black cabinet — blank panel, Tecmojo 12-port Cat6
// patch panel, TP-Link TL-SG108E on a shelf (short white Cat6a jumpers),
// Lenovo ThinkStation P340 Tiny with a 2 TB SSD on top, HEZI PDU at the rear.
// Every part is a hotspot that opens a 3D close-up.

import { Box, FloorShadow, Led, boxHull, type Device, type Hotspot, type Tag } from "./devices";
import { faceLeft, faceRect, faceRight, faceTop, iso, onLeft, onRight, pathD, pts, rng, type Pt } from "./iso";
import {
  BF, BLANK, D, H, P, P340, PART_LOCAL, PATCH, PDU_V, PLUGGED, SSD, SWITCH, SW_BODY, TF, TINY, U, W,
  P340Front, P340Leds, PatchFront, SsdFront, SsdLeds, SwitchFront, SwitchLeds, patchX, swX,
  type PartId,
} from "./parts";

/**
 * Rack-local units → world units. At 0.9 the rack is life-size next to the
 * furniture (about as big as the CRT, like the real 12″ × 13″ rack); it stays
 * the focus through its spotlight and LEDs rather than its size.
 */
export const RACK_SCALE = 0.9;
const S = RACK_SCALE;
/** Carry handles rise this far above the top (world units). */
const HANDLE = 9.6 * S;

// Cabinet it sits on (world units)
const CW = 84;
const CD = 60;
const CH = 48;

const POST = "#d6dadd";
const POST_DIM = "#b5bbbf";

export type WorldBox = { x: number; y: number; z: number; w: number; d: number; h: number };

export function MyRack({ x, y, seed }: { x: number; y: number; seed: number }): Device & { parts: Record<PartId, WorldBox> } {
  const rand = rng(seed);
  // World size of the rack; face art is drawn in local units and scaled by S
  const WW = W * S;
  const DD = D * S;
  const HH = H * S;
  const rx = x + (CW - WW) / 2;
  const ry = y + (CD - DD) / 2;
  const z0 = CH;
  const zt = CH + HH;
  const front = `${faceLeft(rx, ry + DD, zt)} scale(${S})`;
  const side = `${faceRight(rx + WW, ry + DD, zt)} scale(${S})`;
  const top = `${faceTop(rx, ry, zt)} scale(${S})`;
  const frontMap = onLeft(rx, ry + DD, zt);
  const sideMap = onRight(rx + WW, ry + DD, zt);
  const frontAt = (u: number, v: number) => frontMap(u * S, v * S);
  const sideAt = (u: number, v: number) => sideMap(u * S, v * S);

  const handle = (x0: number, x1: number, key: string) => {
    const yMid = ry + DD / 2;
    const d = pathD([[x0, yMid, zt], [x0, yMid, zt + HANDLE], [x1, yMid, zt + HANDLE], [x1, yMid, zt]]);
    return (
      <g key={key} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke="#0b0c0d" strokeWidth={4.4} />
        <path d={d} stroke="rgba(255,255,255,0.14)" strokeWidth={0.8} />
      </g>
    );
  };

  // Wall-mounted spotlight aimed at the rack (it's the centrepiece)
  const yc = ry + DD / 2;
  const head = iso(438, yc, 159);
  const beam = [iso(437, yc - 3, 160), iso(437, yc + 3, 160), iso(rx + WW + 8, ry - 6, CH), iso(rx - 6, ry + DD + 8, CH)];
  const beamEnd = iso(rx + WW / 2, ry + DD / 2, CH);

  const base = (
    <g data-base="myrack" opacity={0.42}>
      <Box x={430} y={yc - 2} z={163} w={6} d={4} h={2.6} tone={{ top: "#2a2e33", left: "#1a1d20", right: "#131518" }} rim={false} />
      <Box x={434} y={yc - 3.5} z={156} w={8} d={7} h={8} tone={{ top: "#23272b", left: "#15181b", right: "#0e1012" }} rim={false} />
      <FloorShadow x={x} y={y} w={CW} d={CD} spread={16} />

      {/* Cabinet */}
      <Box x={x} y={y} w={CW} d={CD} h={CH} tone={{ top: "#17191b", left: "#0f1113", right: "#0a0b0c" }} />
      <g transform={faceLeft(x, y + CD, CH)}>
        <rect x={CW / 2 - 0.3} y={4} width={0.6} height={CH - 8} fill="#050606" />
        <rect x={CW / 2 - 4} y={12} width={1.6} height={9} rx={0.8} fill="#2b2f33" />
        <rect x={CW / 2 + 2.4} y={12} width={1.6} height={9} rx={0.8} fill="#2b2f33" />
        {/* label-maker tape */}
        <rect x={6} y={5} width={22} height={4.6} rx={0.4} fill="#eeece4" />
        <text x={17} y={8.4} fontSize={2.9} fill="#111" textAnchor="middle" fontWeight={700} className="lab-mono" letterSpacing={0.4}>HOMELAB</text>
      </g>

      {/* Side: smoked translucent panel, gear visible through it, PDU at the rear */}
      <g transform={side}>
        <rect width={D} height={H} fill="#090b0c" />
        <rect x={4} y={SW_BODY[0]} width={30} height={SW_BODY[1] - SW_BODY[0]} fill="#1a1d20" />
        <rect x={4} y={P340[0]} width={36} height={P340[1] - P340[0]} fill="#121416" />
        <rect x={6} y={SSD[0]} width={26} height={SSD[1] - SSD[0]} fill="#474b4f" />
        <rect x={D - 13} y={PDU_V[0]} width={12} height={PDU_V[1] - PDU_V[0]} fill="#111315" stroke="rgba(255,255,255,0.1)" strokeWidth={0.3} />
        <rect width={D} height={H} fill="rgba(175,205,220,0.09)" />
        <rect width={3} height={H} fill={POST_DIM} />
        <rect x={D - 3} width={3} height={H} fill={POST_DIM} />
        <rect width={D} height={TF - 2} fill={POST_DIM} />
        <rect y={H - BF + 1} width={D} height={BF - 1} fill={POST_DIM} />
      </g>

      {/* Top: perforated plate */}
      <g transform={top}>
        <rect width={W} height={D} fill="#1c1f22" stroke="rgba(255,255,255,0.14)" strokeWidth={0.5} />
        <rect x={4} y={4} width={W - 8} height={D - 8} fill="url(#lab-perf)" />
      </g>

      {/* Front */}
      <g transform={front}>
        <rect width={W} height={H} fill="#0a0c0e" />
        <rect width={P} height={H} fill={POST} />
        <rect x={W - P} width={P} height={H} fill={POST} />
        <rect width={W} height={TF} fill="#e2e5e7" />
        <rect y={H - BF} width={W} height={BF} fill={POST} />
        <text x={W / 2 - 3.5} y={3} fontSize={1.8} fill="#111" className="lab-mono">Tec</text>
        <text x={W / 2} y={6.6} fontSize={3.8} fontWeight={700} fill="#111" textAnchor="middle" letterSpacing={0.2}>MOJO</text>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <circle cx={P / 2} cy={TF + i * U + U / 2} r={0.8} fill="#7d8489" />
            <circle cx={W - P / 2} cy={TF + i * U + U / 2} r={0.8} fill="#7d8489" />
            <text x={P / 2} y={TF + i * U + 2.6} fontSize={1.4} fill="#8a9196" textAnchor="middle">{`0${6 - i}`}</text>
          </g>
        ))}

        {/* 1U blank */}
        <rect x={2} y={BLANK[0] + 0.3} width={W - 4} height={U - 0.6} fill="#0e1012" stroke="rgba(255,255,255,0.06)" strokeWidth={0.3} />
        {[[4, BLANK[0] + 2.6], [4, BLANK[1] - 2.6], [W - 4, BLANK[0] + 2.6], [W - 4, BLANK[1] - 2.6]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={0.9} fill="#454b50" />
        ))}

        <g transform={`translate(2 ${PATCH[0]})`}>
          <PatchFront />
        </g>

        {/* Switch shelf + TL-SG108E */}
        <rect x={2} y={SWITCH[0] + 0.5} width={6} height={U - 1} fill="#121416" />
        <rect x={W - 8} y={SWITCH[0] + 0.5} width={6} height={U - 1} fill="#121416" />
        <rect x={7} y={SWITCH[1] - 1} width={W - 14} height={1} fill="#1d2023" />
        <g transform={`translate(13 ${SW_BODY[0]})`}>
          <SwitchFront />
        </g>

        {/* White Cat6a jumpers: patch 3–10 → switch 1–8 */}
        <g fill="none" stroke="#eef1f3" strokeWidth={0.9} strokeLinecap="round" opacity={0.85}>
          {PLUGGED.map((p, i) => {
            const x1 = 2 + patchX(p) + 1.45;
            const y1 = PATCH[0] + 4;
            const x2 = 13 + swX(i) + 1.7;
            const y2 = SW_BODY[0] + 3.4;
            return <path key={p} d={`M${x1} ${y1} C${x1 - 1.5} ${y1 + 6}, ${x2 + 2.5} ${y2 - 5}, ${x2} ${y2}`} />;
          })}
        </g>

        {/* P340 shelf: ThinkStation P340 Tiny + 2 TB SSD on top */}
        <rect x={2} y={TINY[0] + 0.5} width={6} height={2 * U - 1} fill="#121416" />
        <rect x={W - 8} y={TINY[0] + 0.5} width={6} height={2 * U - 1} fill="#121416" />
        <rect x={7} y={TINY[1] - 1} width={W - 14} height={1} fill="#1d2023" />
        <g transform={`translate(31 ${SSD[0]})`}>
          <SsdFront />
        </g>
        <g transform={`translate(12 ${P340[0]})`}>
          <P340Front />
        </g>

        {/* Bottom vented shelf */}
        <rect x={2} y={TINY[1] + 0.5} width={6} height={U - 1} fill="#121416" />
        <rect x={W - 8} y={TINY[1] + 0.5} width={6} height={U - 1} fill="#121416" />
        <rect x={7} y={H - BF - 2} width={W - 14} height={2} fill="#15181b" />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={9 + i * 2.2} y={H - BF - 1.6} width={1} height={1.2} fill="#050607" />
        ))}
      </g>

      {handle(rx + 5.2 * S, rx + 19.3 * S, "h1")}
      {handle(rx + WW - 19.3 * S, rx + WW - 5.2 * S, "h2")}
    </g>
  );

  // Lights power on part by part (DOM order = boot order)
  const lights = (
    <g data-lights="myrack">
      <g data-unit="" data-part="spot" opacity={0}>
        <linearGradient id="lab-beam" gradientUnits="userSpaceOnUse" x1={head[0]} y1={head[1]} x2={beamEnd[0]} y2={beamEnd[1]}>
          <stop offset="0%" stopColor="#e6f0ff" stopOpacity={0.3} />
          <stop offset="55%" stopColor="#e6f0ff" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#e6f0ff" stopOpacity={0.02} />
        </linearGradient>
        <polygon points={beam.map((p) => p.join(",")).join(" ")} fill="url(#lab-beam)" />
        <circle cx={head[0]} cy={head[1] + 1} r={10} fill="url(#lab-glow-white)" opacity={0.8} />
      </g>
      <g data-unit="" data-part="pdu" opacity={0} transform={side}>
        <rect x={D - 8.2} y={PDU_V[0] + 1.7} width={2.4} height={3.4} fill="#fb923c" />
        <Led cx={D - 7} cy={PDU_V[0] + 3.4} r={1} glow={4} c="amber" />
      </g>
      <g data-unit="" data-part="switch" opacity={0} transform={front}>
        <g transform={`translate(13 ${SW_BODY[0]})`}>
          <SwitchLeds r2={Array.from({ length: 8 }, () => [rand(), rand()] as [number, number])} />
        </g>
      </g>
      <g data-unit="" data-part="p340" opacity={0} transform={front}>
        <g transform={`translate(12 ${P340[0]})`}>
          <P340Leds r2={[rand(), rand()]} />
        </g>
      </g>
      <g data-unit="" data-part="ssd" opacity={0} transform={front}>
        <g transform={`translate(31 ${SSD[0]})`}>
          <SsdLeds r2={[rand(), rand()]} />
        </g>
      </g>
    </g>
  );

  const hotspots: Hotspot[] = [
    { id: "rack", label: "Tecmojo 6U 10-inch rack", points: pts(boxHull(rx, ry, z0, WW, DD, HH + HANDLE)) },
    { id: "pdu", label: "HEZI 10-inch PDU (rear)", points: faceRect(sideAt, D - 13, TF, D, TF + U) },
    { id: "patch", label: "Tecmojo 12-port Cat6 patch panel", points: faceRect(frontAt, 2, PATCH[0] - 0.5, W - 2, SW_BODY[0]) },
    { id: "switch", label: "TP-Link TL-SG108E switch", points: faceRect(frontAt, 2, SW_BODY[0], W - 2, SWITCH[1]) },
    { id: "ssd", label: "2 TB external SSD", points: faceRect(frontAt, 29, SSD[0] - 1, 61, SSD[1]) },
    { id: "p340", label: "Lenovo ThinkStation P340 Tiny", points: faceRect(frontAt, 2, P340[0], W - 2, TINY[1]) },
  ];

  // World-space box of every part (for the 3D close-up to start from)
  const parts = Object.fromEntries(
    (Object.keys(PART_LOCAL) as PartId[]).map((id) => {
      const l = PART_LOCAL[id];
      return [
        id,
        {
          x: rx + l.u[0] * S,
          y: ry + DD - l.d[1] * S,
          z: zt - l.v[1] * S,
          w: (l.u[1] - l.u[0]) * S,
          d: (l.d[1] - l.d[0]) * S,
          h: (l.v[1] - l.v[0]) * S,
        },
      ];
    }),
  ) as Record<PartId, WorldBox>;

  // Boot labels: a column to the left of the rack, leader lines to each part
  const [colX, colY] = iso(rx, ry + DD, zt);
  const right = colX - 34;
  const tagAt = (row: number, text: string, id: string, anchor: [number, number]): Tag => ({
    id,
    text,
    anchor,
    box: [right, colY - 18 + row * 22],
  });
  const tags: Tag[] = [
    tagAt(0, "hezi pdu · 4 outlets live", "pdu", iso(...sideAt(D - 6, TF + U / 2))),
    tagAt(1, "tl-sg108e · 8/8 ports up", "switch", iso(...frontAt(8, SW_BODY[0] + 4))),
    tagAt(2, "2 TB ssd · mounted", "ssd", iso(...frontAt(31, SSD[0] + 2))),
    tagAt(3, "p340 tiny · debian 13 · online", "p340", iso(...frontAt(12, P340[0] + 5))),
  ];

  return {
    base,
    lights,
    occluders: [boxHull(x, y, 0, CW, CD, CH), boxHull(rx, ry, z0, WW, DD, HH + HANDLE)],
    hotspots,
    tags,
    parts,
  };
}

// ─── Canon EOS M50 (sits on the desk, lens toward the viewer) ─────────────

export function Camera({ x, y, z }: { x: number; y: number; z: number }) {
  const w = 26;
  const d = 13;
  const h = 16;
  const lensU = 10;
  const lensV = 9.5;
  const lensLen = 10;
  const body = { top: "#202326", left: "#15171a", right: "#0d0e10" };

  const base = (
    <g>
      <Box x={x} y={y} z={z} w={w} d={d} h={h} tone={body} />
      {/* EVF hump + mode dial */}
      <Box x={x + 7} y={y + 2} z={z + h} w={11} d={10} h={4.5} tone={body} />
      <g transform={faceLeft(x + 7, y + 12, z + h + 4.5)}>
        <text x={5.5} y={3.2} fontSize={2.3} fill="rgba(255,255,255,0.9)" textAnchor="middle" fontWeight={700}>Canon</text>
      </g>
      <Box x={x + 19.5} y={y + 3} z={z + h} w={5} d={5} h={2} tone={{ top: "#34383c", left: "#1d2023", right: "#16181a" }} rim={false} />
      {/* grip */}
      <Box x={x + w - 7} y={y + d} z={z + 1.5} w={6} d={3} h={h - 3} tone={body} rim={false} />
      {/* lens: stacked rings along +y read as a cylinder */}
      {Array.from({ length: lensLen + 1 }, (_, k) => {
        const last = k === lensLen;
        const ring = k === 4 || k === 7;
        return (
          <g key={k} transform={faceLeft(x, y + d + k, z + h)}>
            <circle cx={lensU} cy={lensV} r={7} fill={last ? "#0b0c0e" : ring ? "#2f3338" : "#121417"} stroke={ring ? "#8b929a" : "none"} strokeWidth={0.4} />
            {last && (
              <>
                <circle cx={lensU} cy={lensV} r={5.2} fill="url(#lab-lens)" />
                <circle cx={lensU} cy={lensV} r={5.2} fill="none" stroke="#3a3f45" strokeWidth={0.5} />
                <ellipse cx={lensU - 1.8} cy={lensV - 1.9} rx={1.5} ry={0.9} fill="rgba(255,255,255,0.35)" />
              </>
            )}
          </g>
        );
      })}
    </g>
  );

  const face: [Pt, Pt, Pt] = [[x, y + d, z + h], [x + w, y + d, z + h], [x, y + d, z]];
  const hotspot: Hotspot = {
    id: "camera",
    label: "Canon EOS M50 — my photography",
    points: pts(boxHull(x, y, z, w, d + lensLen + 1, h + 4.5)),
    face,
  };

  return { base, hotspot };
}
