import { memo } from "react";
import { Desk, LED, boxHull, type Device, type Hotspot, type LedColor, type Tag } from "./devices";
import { Camera, MyRack } from "./mylab";
import { RecordPlayer } from "./record";
import { Chair, DeskItems, Lamp, ROOM, ROOM_CORNERS, Room } from "./room";
import { faceTop, iso, pathD, pts, screenLength, type Pt } from "./iso";

// ─── Layout ──────────────────────────────────────────────────────────────
// One room: the desk with the CRT against the window wall, the real rack on
// its cabinet against the other wall, the Canon on the desk. Cables are run
// the way you'd really run them, tucked along the baseboards: the internet
// comes down from the wall jack into the back of the rack, and the rack's
// line to the CRT follows the wall to the corner, passes behind the lamp and
// disappears behind the desk.

const camera = Camera({ x: 668, y: 518, z: 65 });
const CAMERA: Device = {
  base: (
    <g data-base="camera" opacity={0.42}>
      {camera.base}
    </g>
  ),
  lights: <g data-lights="camera" opacity={0} />,
  occluders: [boxHull(668, 518, 65, 26, 24, 21)],
  hotspots: [camera.hotspot],
};

const RACK = MyRack({ x: 452, y: 620, seed: 83 });
const ROOM_DEVICE = Room();
const CHAIR = Chair({ x: 608, y: 600 });

// Paint order after the room shell + floor cables (later = in front)
const DEVICES: Device[] = [
  Lamp(),
  Desk({ x: 546, y: 460, seed: 41 }),
  DeskItems({ x: 546, y: 460, z: 65 }),
  CAMERA,
  RecordPlayer(),
  RACK,
  CHAIR,
];
const ALL = [ROOM_DEVICE, ...DEVICES];

/** Clickable objects, in paint order (later = on top). */
export const HOTSPOTS: Hotspot[] = ALL.flatMap((d) => d.hotspots ?? []);
export const HOTSPOT_BY_ID: Record<string, Hotspot> = Object.fromEntries(HOTSPOTS.map((h) => [h.id, h]));
/** World-space boxes of the rack and its parts (3D close-ups start from these). */
export const PART_BOXES = RACK.parts;
const TAGS: Tag[] = ALL.flatMap((d) => d.tags ?? []);

// Baseboard runs, 4 units out from the wall (walls are the planes x = 430 and y = 440).
// The rack's cabinet stands at x 452–536, y 620–680, so anything between it and
// the wall is hidden behind it — that's where both cables reach the rack.
export const CABLES: Record<string, { pts: Pt[]; color: LedColor }> = {
  // wall jack (left wall, near the front) → down to the floor → along the wall → into the back of the rack
  wan: { pts: [[431, 745.5, 17], [431, 745.5, 1.5], [434, 745.5, 0], [434, 652, 0], [470, 652, 0]], color: "cyan" },
  // back of the rack → along the left wall → the corner, behind the lamp → along the window wall → up behind the desk to the CRT
  desk: { pts: [[470, 630, 0], [437, 630, 0], [437, 444, 0], [604, 444, 0], [604, 444, 66]], color: "amber" },
};

export const CABLE_LENGTH = Object.fromEntries(
  Object.entries(CABLES).map(([k, c]) => [k, screenLength(c.pts)]),
) as Record<keyof typeof CABLES, number>;

/** Where a hostile packet dies: on the baseboard, just before it reaches the rack. */
const BLOCK_PT: Pt = [434, 694, 0];
export const WAN_BLOCK_AT = screenLength([...CABLES.wan.pts.slice(0, 3), BLOCK_PT]) / CABLE_LENGTH.wan;

/** Devices without rack units — their lights group powers on as one piece. */
export const SINGLE_LIGHTS = ["room", "desk", "deskitems", "camera", "record"];

const PACKETS: { cable: keyof typeof CABLES; dir: 1 | -1; color: LedColor; n: number }[] = [
  { cable: "wan", dir: 1, color: "white", n: 1 },
  { cable: "wan", dir: -1, color: "cyan", n: 1 },
  { cable: "desk", dir: 1, color: "amber", n: 1 },
  { cable: "desk", dir: -1, color: "cyan", n: 1 },
];

const POOLS: { id: string; x: number; y: number; r: number; color: LedColor }[] = [
  { id: "room", x: 456, y: 468, r: 95, color: "warm" },
  { id: "room", x: 714, y: 520, r: 120, color: "blue" },
  { id: "desk", x: 596, y: 572, r: 95, color: "amber" },
  { id: "myrack", x: 494, y: 652, r: 105, color: "cyan" },
];

const GLOW_COLORS = Object.keys(LED) as LedColor[];
/** Boot labels use the site accent (putty), not an LED color. */
const TAG = "#e6d9b5";

/** The diorama's outline on screen (viewBox units). */
export const ROOM_BOUNDS = (() => {
  const p = ROOM_CORNERS.map(([x, y, z]) => iso(x, y, z ?? 0));
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
})();

/** Before the camera is framed on the client (the scene is hidden until then). */
export const INITIAL_VIEWBOX = [ROOM_BOUNDS.x - 60, ROOM_BOUNDS.y - 60, ROOM_BOUNDS.w + 120, ROOM_BOUNDS.h + 120]
  .map((n) => Math.round(n))
  .join(" ");

const [haloX, haloY] = iso((ROOM.x0 + ROOM.x1) / 2, (ROOM.y0 + ROOM.y1) / 2, 0);
const [burstX, burstY] = iso(...BLOCK_PT);

export const LabScene = memo(function LabScene() {
  return (
    <>
      {/* ── Static layer ── */}
      <svg data-cam="" className="absolute inset-0 h-full w-full" viewBox={INITIAL_VIEWBOX} preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <radialGradient id="lab-shadow">
            <stop offset="0%" stopColor="#000" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="lab-halo">
            <stop offset="0%" stopColor="#12302b" stopOpacity={0.55} />
            <stop offset="60%" stopColor="#0b1a18" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#050706" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="lab-lens" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#3b4a6b" />
            <stop offset="55%" stopColor="#141b2b" />
            <stop offset="100%" stopColor="#05070b" />
          </radialGradient>
          <linearGradient id="lab-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080c1a" />
            <stop offset="55%" stopColor="#141a33" />
            <stop offset="100%" stopColor="#3a2a44" />
          </linearGradient>
          <pattern id="lab-perf" width={3} height={3} patternUnits="userSpaceOnUse">
            <rect width={1.3} height={1.3} fill="#0a0b0c" />
          </pattern>
        </defs>

        <ellipse cx={haloX} cy={haloY} rx={720} ry={420} fill="url(#lab-halo)" />

        {ROOM_DEVICE.base}

        {/* floor cables */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {Object.entries(CABLES).map(([k, c]) => (
            <g key={k}>
              <path d={pathD(c.pts)} stroke="#0c1211" strokeWidth={3.2} />
              <path d={pathD(c.pts)} stroke="rgba(160,255,230,0.07)" strokeWidth={1} />
            </g>
          ))}
        </g>

        {DEVICES.map((d, i) => (
          <g key={i}>{d.base}</g>
        ))}
      </svg>

      {/* ── Animated layer (own compositing layer: repaints never touch the static art) ── */}
      <svg
        data-cam=""
        className="absolute inset-0 h-full w-full [will-change:transform]"
        viewBox={INITIAL_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          {GLOW_COLORS.map((c) => (
            <radialGradient key={c} id={`lab-glow-${c}`}>
              <stop offset="0%" stopColor={LED[c]} stopOpacity={0.7} />
              <stop offset="35%" stopColor={LED[c]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={LED[c]} stopOpacity={0} />
            </radialGradient>
          ))}
          {GLOW_COLORS.map((c) => (
            <radialGradient key={`p-${c}`} id={`lab-pool-${c}`}>
              <stop offset="0%" stopColor={LED[c]} stopOpacity={0.16} />
              <stop offset="45%" stopColor={LED[c]} stopOpacity={0.05} />
              <stop offset="100%" stopColor={LED[c]} stopOpacity={0} />
            </radialGradient>
          ))}
          <radialGradient id="lab-crt-glow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#ffb347" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#ffb347" stopOpacity={0} />
          </radialGradient>
          <pattern id="lab-scan" width={4} height={1.1} patternUnits="userSpaceOnUse">
            <rect width={4} height={0.45} fill="rgba(0,0,0,0.35)" />
          </pattern>
          {/* Floor and wall lights are hidden where a device stands in front of them */}
          <mask id="lab-occlude" maskUnits="userSpaceOnUse" x={-400} y={-400} width={2400} height={1900}>
            <rect x={-400} y={-400} width={2400} height={1900} fill="#fff" />
            {DEVICES.flatMap((d) => d.occluders).map((hull, i) => (
              <polygon key={i} points={pts(hull)} fill="#000" />
            ))}
          </mask>
        </defs>

        <g mask="url(#lab-occlude)">
          {/* wall lights sit behind the furniture */}
          {ROOM_DEVICE.lights}

          {POOLS.map((p, i) => (
            <g key={i} data-pool={p.id} opacity={0} transform={faceTop(p.x - p.r, p.y - p.r, 0)}>
              <circle cx={p.r} cy={p.r} r={p.r} fill={`url(#lab-pool-${p.color})`} />
            </g>
          ))}

          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {Object.entries(CABLES).map(([k, c]) => (
              <g key={k} data-cable={k} opacity={0}>
                <path d={pathD(c.pts)} stroke={LED[c.color]} strokeOpacity={0.12} strokeWidth={5} />
                <path id={`lab-cable-${k}`} d={pathD(c.pts)} stroke={LED[c.color]} strokeOpacity={0.55} strokeWidth={1.1} />
              </g>
            ))}
          </g>

          {PACKETS.flatMap((p) =>
            Array.from({ length: p.n }, (_, i) => (
              <g key={`${p.cable}${p.dir}${i}`} data-pkt="" data-cable={p.cable} data-dir={p.dir} opacity={0}>
                <circle r={9} fill={`url(#lab-glow-${p.color})`} />
                <circle r={2} fill="#ecfdf5" />
              </g>
            )),
          )}

          <g data-blocked-pkt="" opacity={0}>
            <circle r={9} fill="url(#lab-glow-red)" />
            <circle r={2} fill={LED.red} />
          </g>
        </g>

        {/* the firewall on the P340 drops it */}
        <circle data-fw-burst="" cx={burstX} cy={burstY} r={2} fill="none" stroke={LED.red} strokeWidth={1} opacity={0} />
        {/* floats on the wall above the jack, with a leader down to where the packet died */}
        <g data-fw-alert="" opacity={0}>
          <polyline points={`${burstX},${burstY - 2} ${burstX - 8},${burstY - 26}`} fill="none" stroke={LED.red} strokeOpacity={0.6} strokeWidth={0.8} />
          <rect x={burstX - 78} y={burstY - 41} width={82} height={15} rx={3} fill="rgba(20,6,8,0.92)" stroke={LED.red} strokeOpacity={0.6} strokeWidth={0.8} />
          <text x={burstX - 37} y={burstY - 30.6} fontSize={8.6} fill="#fecdd3" textAnchor="middle" className="lab-mono">blocked · ufw</text>
        </g>

        {DEVICES.map((d, i) => (
          <g key={i}>{d.lights}</g>
        ))}

        {TAGS.map((t) => {
          const w = t.text.length * 5.9 + 14;
          const [bx, by] = t.box;
          return (
            <g key={t.id} data-tag={t.id} opacity={0}>
              <polyline
                points={`${bx},${by} ${bx + 10},${by} ${t.anchor[0]},${t.anchor[1]}`}
                fill="none" stroke={TAG} strokeOpacity={0.6} strokeWidth={0.8}
              />
              <circle cx={t.anchor[0]} cy={t.anchor[1]} r={1.8} fill={TAG} />
              <rect x={bx - w} y={by - 8} width={w} height={16} rx={3} fill="rgba(8,9,10,0.9)" stroke={TAG} strokeOpacity={0.45} strokeWidth={0.8} />
              <text x={bx - w + 7} y={by + 3.4} fontSize={9.8} fill="#efe6cc" className="lab-mono">{t.text}</text>
            </g>
          );
        })}
      </svg>
    </>
  );
});

// ─── Click targets (same camera as the scene) ────────────────────────────

export function LabHotspots({
  enabled,
  active,
  onPick,
  onHover,
}: {
  enabled: boolean;
  active?: string;
  onPick: (id: string, at?: { x: number; y: number }) => void;
  /** The mouse or keyboard focus is on this object (null: on nothing). */
  onHover?: (id: string | null) => void;
}) {
  return (
    <svg
      data-cam=""
      className="absolute inset-0 h-full w-full"
      viewBox={INITIAL_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      data-hotspots={enabled ? "on" : "off"}
    >
      {HOTSPOTS.map((h) => (
        <polygon
          key={h.id}
          points={h.points}
          data-hot={h.id}
          data-active={active === h.id ? "" : undefined}
          className="lab-hot"
          role="button"
          tabIndex={enabled ? 0 : -1}
          aria-label={h.label}
          onClick={(e) => {
            e.stopPropagation();
            onPick(h.id, { x: e.clientX, y: e.clientY });
          }}
          onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(h.id)}
          onPointerLeave={(e) => e.pointerType === "mouse" && onHover?.(null)}
          onFocus={() => onHover?.(h.id)}
          onBlur={() => onHover?.(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPick(h.id);
            }
          }}
        >
          {!h.quiet && <title>{h.label}</title>}
        </polygon>
      ))}
    </svg>
  );
}
