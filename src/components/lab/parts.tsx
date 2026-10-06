// The parts in Youssef's real rack: specs, Amazon links, and face art.
// The art is drawn in rack-local units and shared by the isometric scene
// (mylab.tsx) and the 3D close-ups (model.tsx), so a part that lifts out of
// the rack looks exactly like the one drawn in it.

import { Led } from "./devices";

export type PartId = "rack" | "patch" | "switch" | "p340" | "ssd" | "pdu";

type Part = {
  kicker: string;
  title: string;
  specs: string[];
  amazon?: string;
  extra?: { label: string; href: string };
};

export const PARTS: Record<PartId, Part> = {
  rack: {
    kicker: "the rack",
    title: "Tecmojo 6U 10\" network rack",
    specs: ["6U · 10-inch · 7.9 in deep", "white frame, translucent side panels, two carry handles", "everything in my homelab lives in here"],
    amazon: "https://www.amazon.com/dp/B0F4JZ9YJW",
  },
  patch: {
    kicker: "cabling",
    title: "Tecmojo 12-port Cat6 patch panel",
    specs: ["0.5U keystone panel", "ports 3 to 10 patched down to the switch"],
    amazon: "https://www.amazon.com/dp/B0F4K4SR9J",
    extra: { label: "The white jumpers: Cat6a slim, 0.5 ft", href: "https://www.amazon.com/dp/B0FR99JZG2" },
  },
  switch: {
    kicker: "network",
    title: "TP-Link TL-SG108E",
    specs: ["8× gigabit · Easy Smart managed", "VLANs · QoS · IGMP snooping · LAG"],
    amazon: "https://www.amazon.com/dp/B00K4DS5KU",
  },
  p340: {
    kicker: "compute",
    title: "Lenovo ThinkStation P340 Tiny",
    specs: ["32 GB RAM · Debian 13, headless, 24/7", "Caddy · AdGuard Home · Tailscale · 9+ containers", "encrypted offsite backups to Backblaze B2"],
  },
  ssd: {
    kicker: "storage",
    title: "2 TB external SSD",
    specs: ["2 TB", "sits on top of the P340"],
  },
  pdu: {
    kicker: "power · rear",
    title: "HEZI 10\" 1U PDU",
    specs: ["4 outlets · 1200 J surge protection", "15 A overload switch · 6 ft 14 AWG cord"],
    amazon: "https://www.amazon.com/dp/B0FXKYJL9L",
  },
};

export const PART_ORDER: PartId[] = ["rack", "patch", "switch", "p340", "ssd", "pdu"];
export const isPart = (id: string | null | undefined): id is PartId => !!id && id in PARTS;

// ─── Rack geometry (rack-local units: u → right, v → down, d → back) ─────

export const W = 76;
export const D = 50;
export const P = 7;
export const U = 11;
export const TF = 8;
export const BF = 5;
export const H = TF + 6 * U + BF;

export const BLANK = [TF, TF + U] as const;
export const PATCH = [TF + U + 0.3, TF + U + 5.7] as const;
export const SWITCH = [TF + 2 * U, TF + 3 * U] as const;
export const SW_BODY = [SWITCH[0] + 2.2, SWITCH[0] + 9.8] as const;
export const TINY = [TF + 3 * U, TF + 5 * U] as const;
export const P340 = [TINY[1] - 12, TINY[1] - 1.2] as const;
export const SSD = [P340[0] - 4.4, P340[0]] as const;
export const PDU_V = [TF + 1.5, TF + U - 1.5] as const;

/** Where each part sits inside the rack. */
export const PART_LOCAL: Record<PartId, { u: [number, number]; v: [number, number]; d: [number, number] }> = {
  rack: { u: [0, W], v: [0, H], d: [0, D] },
  patch: { u: [2, W - 2], v: [PATCH[0], PATCH[1]], d: [0, 9] },
  switch: { u: [13, 63], v: [SW_BODY[0], SW_BODY[1]], d: [2, 34] },
  p340: { u: [12, 62], v: [P340[0], P340[1]], d: [0, 49] },
  ssd: { u: [31, 59], v: [SSD[0], SSD[1]], d: [4, 30] },
  pdu: { u: [2, W - 2], v: [PDU_V[0], PDU_V[1]], d: [37, 49] },
};

/** Size of a part (w, h, d) in rack-local units. */
export const partSize = (id: PartId) => {
  const l = PART_LOCAL[id];
  return { w: l.u[1] - l.u[0], h: l.v[1] - l.v[0], d: l.d[1] - l.d[0] };
};

/** Patch ports 3–10 are cabled, like the photo. */
export const PLUGGED = [2, 3, 4, 5, 6, 7, 8, 9];
export const patchX = (i: number) => 11 + i * (50 / 12);
export const swX = (i: number) => 11 + i * 4.6;

type R2 = [number, number];

// ─── Face art (origin = the face's top-left corner) ─────────────────────

const PLUG = "#eef1f3";

export function PatchFront() {
  return (
    <>
      <rect width={72} height={5.4} fill="#0b0c0e" stroke="rgba(255,255,255,0.08)" strokeWidth={0.3} />
      <text x={6.4} y={3.4} fontSize={1.3} fill="#e5e7eb">MOJO</text>
      <text x={65.4} y={3.4} fontSize={1.3} fill="#e5e7eb" textAnchor="end">CAT6</text>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <rect x={patchX(i)} y={1.3} width={2.9} height={2.8} fill="#040506" />
          {PLUGGED.includes(i) && <rect x={patchX(i) + 0.2} y={1.6} width={2.5} height={2.4} fill={PLUG} />}
        </g>
      ))}
    </>
  );
}

export function SwitchFront({ plugs = false }: { plugs?: boolean }) {
  return (
    <>
      <rect width={50} height={7.6} fill="#262a2e" stroke="rgba(255,255,255,0.1)" strokeWidth={0.3} />
      <text x={1.4} y={2.2} fontSize={1.5} fill="rgba(255,255,255,0.6)">tp-link</text>
      <text x={48.6} y={2.2} fontSize={1.15} fill="rgba(255,255,255,0.4)" textAnchor="end">TL-SG108E</text>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={swX(i)} y={3.3} width={3.4} height={2.9} fill="#060708" />
          {plugs && <rect x={swX(i) + 0.3} y={3.5} width={2.8} height={2.5} fill={PLUG} />}
        </g>
      ))}
    </>
  );
}

export function SwitchLeds({ r2 }: { r2: R2[] }) {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <Led key={i} cx={swX(i) + 1.7} cy={2.6} r={0.45} glow={3.2} c="green" blink="act" r2={r2[i]} />
      ))}
      <Led cx={2.2} cy={6} r={0.5} glow={3} c="green" />
    </>
  );
}

export function P340Front() {
  return (
    <>
      <rect width={50} height={10.8} fill="#121417" stroke="rgba(255,255,255,0.08)" strokeWidth={0.3} />
      <rect x={1} y={0.6} width={7} height={1.8} fill="#2b2f33" />
      <text x={4.5} y={2} fontSize={1.2} fill="#cbd5e1" textAnchor="middle">Lenovo</text>
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 15 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={2 + c * 1.65 + (r % 2) * 0.82} cy={3.6 + r * 1.5} r={0.5} fill="#050607" />
        )),
      )}
      <rect x={27.8} y={1} width={2.6} height={8.6} fill="#b91c1c" />
      <text x={0} y={0} fontSize={1.5} fill="#fff" textAnchor="middle" transform="translate(29.6 5.3) rotate(-90)">P340</text>
      <rect x={32.2} y={4} width={3.2} height={1.5} fill="#050607" />
      <rect x={36.2} y={4} width={3.2} height={1.5} fill="#050607" />
      <circle cx={40.8} cy={4.8} r={0.7} fill="#050607" />
      <text x={49} y={2.6} fontSize={1.5} fill="rgba(255,255,255,0.7)" textAnchor="end" fontStyle="italic">ThinkStation</text>
      <circle cx={46.5} cy={6.8} r={1.5} fill="#0c0d0f" stroke="#5b6167" strokeWidth={0.3} />
    </>
  );
}

export function P340Leds({ r2 }: { r2: R2 }) {
  return (
    <>
      <Led cx={46.5} cy={6.8} r={0.6} glow={4} c="white" />
      <Led cx={33.8} cy={7.6} r={0.35} glow={3} c="amber" blink="disk" r2={r2} />
    </>
  );
}

export function SsdFront() {
  return (
    <>
      <rect width={28} height={4.4} rx={0.8} fill="#6a6f74" />
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 15 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={1.6 + c * 1.6 + (r % 2) * 0.8} cy={1 + r * 1.2} r={0.32} fill="#575b60" />
        )),
      )}
    </>
  );
}

export function SsdLeds({ r2 }: { r2: R2 }) {
  return <Led cx={26.4} cy={2.2} r={0.45} glow={3.4} c="blue" blink="disk" r2={r2} />;
}

// ─── The whole front of the rack (origin = its top-left corner, W × H) ───

const POST = "#d6dadd";

/**
 * The rack straight on: frame, unit numbers, shelves, and every part in its
 * slot. No lights (the room and the classic Homelab section add their own).
 */
export function RackFront() {
  return (
    <>
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
    </>
  );
}

/** Outlet side of the PDU (it faces the back of the rack). */
export function PduFront() {
  const outlet = (x: number) => (
    <g key={x}>
      <rect x={x} y={1.3} width={8} height={5.4} rx={1.2} fill="#1d1f22" stroke="#2c2f33" strokeWidth={0.25} />
      <rect x={x + 2.2} y={2.2} width={0.8} height={2} rx={0.2} fill="#050607" />
      <rect x={x + 5} y={2.2} width={0.8} height={2.4} rx={0.2} fill="#050607" />
      <path d={`M${x + 3.4} 6 a0.6 0.6 0 0 1 1.2 0 v0.2 h-1.2 z`} fill="#050607" />
    </g>
  );
  return (
    <>
      <rect width={72} height={8} fill="#121315" stroke="rgba(255,255,255,0.08)" strokeWidth={0.3} />
      {[0, 68].map((x) => (
        <g key={x}>
          <rect x={x} width={4} height={8} fill="#1b1d20" />
          <rect x={x + 1.2} y={1.6} width={1.6} height={1.2} rx={0.6} fill="#050607" />
          <rect x={x + 1.2} y={5.2} width={1.6} height={1.2} rx={0.6} fill="#050607" />
        </g>
      ))}
      <rect x={6.5} y={1.6} width={7} height={4.8} rx={0.6} fill="#3b1d08" stroke="#5b3413" strokeWidth={0.3} />
      <text x={10} y={7.5} fontSize={0.9} fill="rgba(255,255,255,0.45)" textAnchor="middle">15A RESET</text>
      {[18, 29, 40, 51].map(outlet)}
      <text x={65.5} y={4.6} fontSize={1.6} fontWeight={700} fill="rgba(255,255,255,0.7)" textAnchor="end">HEZI</text>
    </>
  );
}

export function PduLeds() {
  return (
    <>
      <rect x={7.2} y={2.2} width={5.6} height={3.6} rx={0.4} fill="#fb923c" />
      <Led cx={10} cy={4} r={1.4} glow={3.5} c="amber" />
    </>
  );
}
