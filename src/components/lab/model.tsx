"use client";

// 3D close-ups of the rack and its parts. Each model is a stack of CSS 3D
// cuboids whose faces carry the same SVG art as the isometric scene. A CSS
// rotation of rotateX(-35.264°) rotateY(-45°) is exactly the scene's
// isometric projection, so a part starts perfectly on top of its drawing in
// the rack, then floats out to the stage where you can spin it.

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { HOMELAB } from "@/lib/content";
import { clamp, lerp } from "./camera";
import { rng } from "./iso";
import {
  BF, BLANK, D, H, P, PART_LOCAL, PARTS, PART_ORDER, PATCH, PLUGGED, SWITCH, SW_BODY, TF, TINY, W,
  P340Front, P340Leds, PatchFront, PduFront, PduLeds, SsdFront, SsdLeds, SwitchFront, SwitchLeds,
  patchX, partSize, swX, type PartId,
} from "./parts";

/** Where a part sits on screen inside the room: centre (hero px) and px per rack-local unit. */
export type Pose = { x: number; y: number; px: number };

export type PartViewerHandle = { enter: () => void; leave: (onDone?: () => void) => void };

const ISO_RX = -35.264;
const ISO_RY = -45;
/** A unit axis under the isometric rotation projects to this length. */
const ISO_SHRINK = Math.sqrt(2 / 3);
/** A model's largest side in DOM px — faces are rasterised at about their final size, so they stay crisp. */
const TARGET_PX = 460;
const modelScale = (id: PartId) => {
  const s = partSize(id);
  return TARGET_PX / Math.max(s.w, s.h, s.d);
};

const rand = rng(97);
const R2 = Array.from({ length: 10 }, () => [rand(), rand()] as [number, number]);

// ─── Cuboids ─────────────────────────────────────────────────────────────

type FaceKey = "front" | "back" | "left" | "right" | "top" | "bottom";
type Tone = { front: string; side: string; top: string };

/**
 * A w×h×d box (rack-local units, m px per unit) centred on `at`.
 * Axes: x → right, y → down, z → toward the viewer (the rack's front).
 */
function Cuboid({
  w, h, d, m, at = [0, 0, 0], turn = 0, tone, faces = {}, style,
}: {
  w: number; h: number; d: number; m: number; at?: [number, number, number]; turn?: number;
  tone: Tone; faces?: Partial<Record<FaceKey, ReactNode>>; style?: CSSProperties;
}) {
  const pw = w * m, ph = h * m, pd = d * m;
  const face = (k: FaceKey, fw: number, fh: number, vw: number, vh: number, t: string, fill: string) => (
    <div
      key={k}
      className="absolute [backface-visibility:hidden]"
      style={{ width: fw, height: fh, left: -fw / 2, top: -fh / 2, transform: t, background: fill }}
    >
      {faces[k] && (
        <svg width={fw} height={fh} viewBox={`0 0 ${vw} ${vh}`} className="block overflow-visible">
          {faces[k]}
        </svg>
      )}
    </div>
  );
  return (
    <div
      className="absolute left-0 top-0 [transform-style:preserve-3d]"
      style={{ transform: `translate3d(${at[0] * m}px, ${at[1] * m}px, ${at[2] * m}px) rotateY(${turn}deg)`, ...style }}
    >
      {face("front", pw, ph, w, h, `translateZ(${pd / 2}px)`, tone.front)}
      {face("back", pw, ph, w, h, `rotateY(180deg) translateZ(${pd / 2}px)`, tone.front)}
      {face("right", pd, ph, d, h, `rotateY(90deg) translateZ(${pw / 2}px)`, tone.side)}
      {face("left", pd, ph, d, h, `rotateY(-90deg) translateZ(${pw / 2}px)`, tone.side)}
      {face("top", pw, pd, w, d, `rotateX(90deg) translateZ(${ph / 2}px)`, tone.top)}
      {face("bottom", pw, pd, w, d, `rotateX(-90deg) translateZ(${ph / 2}px)`, tone.side)}
    </div>
  );
}

/** A flat panel (visible from both sides) standing in the x/y plane, turned by `turn`. */
function Plane({ w, h, m, at, turn = 0, fill, border, children, vb }: {
  w: number; h: number; m: number; at: [number, number, number]; turn?: number; fill?: string; border?: string; children?: ReactNode; vb?: string;
}) {
  const pw = w * m, ph = h * m;
  return (
    <div
      className="absolute"
      style={{
        width: pw,
        height: ph,
        left: -pw / 2,
        top: -ph / 2,
        background: fill,
        border,
        transform: `translate3d(${at[0] * m}px, ${at[1] * m}px, ${at[2] * m}px) rotateY(${turn}deg)`,
      }}
    >
      {children && (
        <svg width={pw} height={ph} viewBox={vb ?? `0 0 ${w} ${h}`} className="block overflow-visible">
          {children}
        </svg>
      )}
    </div>
  );
}

// ─── Extra faces the scene never shows ───────────────────────────────────

const Slots = ({ w, h, n, y0 = 0.25, y1 = 0.75, fill = "#07080a" }: { w: number; h: number; n: number; y0?: number; y1?: number; fill?: string }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={((i + 0.5) * w) / n - 0.35} y={h * y0} width={0.7} height={h * (y1 - y0)} rx={0.3} fill={fill} />
    ))}
  </>
);

function SwitchBack() {
  return (
    <>
      <rect width={50} height={7.6} fill="#262a2e" />
      <text x={2} y={4.5} fontSize={1.6} fill="rgba(255,255,255,0.65)">tp-link</text>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <circle cx={14 + i * 2.6} cy={3.2} r={0.45} fill={i === 0 ? "#4ade80" : "#1f3b2a"} />
          <text x={14 + i * 2.6} y={5.6} fontSize={0.9} fill="rgba(255,255,255,0.45)" textAnchor="middle">{i === 0 ? "PWR" : i}</text>
        </g>
      ))}
      <text x={48} y={4.5} fontSize={1.2} fill="rgba(255,255,255,0.4)" textAnchor="end">TL-SG108E</text>
    </>
  );
}

function P340Back() {
  const port = (x: number, y: number, w: number, h: number, k: string) => <rect key={k} x={x} y={y} width={w} height={h} rx={0.2} fill="#050607" stroke="#2c3035" strokeWidth={0.15} />;
  return (
    <>
      <rect width={50} height={10.8} fill="#141619" />
      <Slots w={12} h={10.8} n={6} y0={0.15} y1={0.85} />
      {port(14, 2, 3.4, 2, "dp1")}
      {port(14, 6, 3.4, 2, "dp2")}
      {port(19.5, 2, 3, 1.4, "u1")}
      {port(19.5, 4.2, 3, 1.4, "u2")}
      {port(23.5, 2, 3, 1.4, "u3")}
      {port(23.5, 4.2, 3, 1.4, "u4")}
      {port(28, 2, 3.4, 3, "eth")}
      <circle cx={36} cy={5.4} r={1.6} fill="#050607" stroke="#2c3035" strokeWidth={0.2} />
      <circle cx={41} cy={3} r={0.8} fill="#2a2d31" />
      <circle cx={44} cy={3} r={0.8} fill="#2a2d31" />
      <text x={47.5} y={9.4} fontSize={0.9} fill="rgba(255,255,255,0.35)" textAnchor="end">19V ⎓</text>
    </>
  );
}

function P340Top() {
  return (
    <>
      <rect width={50} height={49} fill="#1b1d20" />
      <text x={6} y={44} fontSize={3.2} fontStyle="italic" fill="rgba(255,255,255,0.28)">ThinkStation</text>
      <circle cx={17.6} cy={40.8} r={0.45} fill="#b91c1c" />
      <text x={44} y={6} fontSize={1.8} fill="rgba(255,255,255,0.18)" textAnchor="end">Lenovo</text>
    </>
  );
}

function PatchBack() {
  return (
    <>
      <rect width={72} height={5.4} fill="#0b0c0e" />
      {Array.from({ length: 12 }, (_, i) => {
        // back side: port i sits mirrored
        const x = 72 - patchX(i) - 2.9;
        return (
          <g key={i}>
            <rect x={x - 0.3} y={0.9} width={3.5} height={3.6} fill="#1d1f22" />
            {PLUGGED.includes(i) && <rect x={x + 0.6} y={4.4} width={1.7} height={1.4} fill="#60a5fa" />}
          </g>
        );
      })}
    </>
  );
}

function SsdTop() {
  return (
    <>
      <rect width={28} height={26} rx={1.2} fill="#72777c" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={2} y={2 + i * 2} width={24} height={0.6} rx={0.3} fill="#62676c" />
      ))}
      <text x={25.5} y={24.6} fontSize={1.6} fill="rgba(255,255,255,0.5)" textAnchor="end">2TB</text>
    </>
  );
}

function PduBack() {
  return (
    <>
      <rect width={72} height={8} fill="#121315" />
      <circle cx={60} cy={4} r={1.8} fill="#050607" />
      <path d="M60 4 L68 4" stroke="#050607" strokeWidth={1.6} />
      <text x={6} y={4.8} fontSize={1.2} fill="rgba(255,255,255,0.35)">125V~ 15A · 1875W · ETL</text>
    </>
  );
}

// ─── Models ──────────────────────────────────────────────────────────────

const BLACK: Tone = { front: "#121315", side: "#16171a", top: "#1b1c1f" };

function PartModel({ id, m }: { id: Exclude<PartId, "rack">; m: number }) {
  switch (id) {
    case "switch":
      return (
        <Cuboid
          w={50} h={7.6} d={32} m={m}
          tone={{ front: "#262a2e", side: "#1f2226", top: "#2e3237" }}
          faces={{
            front: <><SwitchFront /><SwitchLeds r2={R2} /></>,
            back: <SwitchBack />,
            top: <text x={25} y={17} fontSize={3} fill="rgba(255,255,255,0.22)" textAnchor="middle">tp-link</text>,
            left: <Slots w={32} h={7.6} n={10} />,
            right: <Slots w={32} h={7.6} n={10} />,
          }}
        />
      );
    case "patch":
      return <Cuboid w={72} h={5.4} d={9} m={m} tone={BLACK} faces={{ front: <PatchFront />, back: <PatchBack /> }} />;
    case "p340":
      return (
        <Cuboid
          w={50} h={10.8} d={49} m={m}
          tone={{ front: "#121417", side: "#16181b", top: "#1b1d20" }}
          faces={{
            front: <><P340Front /><P340Leds r2={R2[8]} /></>,
            back: <P340Back />,
            top: <P340Top />,
            left: <Slots w={49} h={10.8} n={22} y0={0.3} y1={0.7} />,
            right: <Slots w={49} h={10.8} n={22} y0={0.3} y1={0.7} />,
          }}
        />
      );
    case "ssd":
      return (
        <Cuboid
          w={28} h={4.4} d={26} m={m}
          tone={{ front: "#6a6f74", side: "#5d6166", top: "#72777c" }}
          faces={{ front: <><SsdFront /><SsdLeds r2={R2[9]} /></>, top: <SsdTop />, back: <rect x={12} y={1.6} width={4} height={1.2} rx={0.6} fill="#1f2225" /> }}
        />
      );
    case "pdu":
      return <Cuboid w={72} h={8} d={12} m={m} tone={BLACK} faces={{ front: <><PduFront /><PduLeds /></>, back: <PduBack /> }} />;
  }
}

const POST: Tone = { front: "#d6dadd", side: "#b9bfc3", top: "#e4e7e9" };

/** Centre + size of a box given in rack-local ranges. */
const place = (u: [number, number], v: [number, number], d: [number, number]) => ({
  at: [(u[0] + u[1]) / 2 - W / 2, (v[0] + v[1]) / 2 - H / 2, D / 2 - (d[0] + d[1]) / 2] as [number, number, number],
  w: u[1] - u[0],
  h: v[1] - v[0],
  d: d[1] - d[0],
});

function RackModel({ m }: { m: number }) {
  const inside = (id: Exclude<PartId, "rack">, turn = 0) => {
    const l = PART_LOCAL[id];
    const { at } = place(l.u, l.v, l.d);
    return (
      <div key={id} className="absolute left-0 top-0 [transform-style:preserve-3d]" style={{ transform: `translate3d(${at[0] * m}px, ${at[1] * m}px, ${at[2] * m}px) rotateY(${turn}deg)` }}>
        <PartModel id={id} m={m} />
      </div>
    );
  };
  const post = (u: [number, number], d: [number, number], front: boolean, key: string) => (
    <Cuboid
      key={key}
      {...place(u, [0, H], d)}
      m={m}
      tone={POST}
      faces={
        front
          ? {
              front: (
                <>
                  {Array.from({ length: 6 }, (_, i) => (
                    <g key={i}>
                      <circle cx={P / 2} cy={TF + i * 11 + 5.5} r={0.8} fill="#7d8489" />
                      <text x={P / 2} y={TF + i * 11 + 2.6} fontSize={1.4} fill="#8a9196" textAnchor="middle">{`0${6 - i}`}</text>
                    </g>
                  ))}
                </>
              ),
            }
          : undefined
      }
    />
  );
  const shelf = (v: number, key: string) => <Cuboid key={key} {...place([7, W - 7], [v - 1, v], [1, 44])} m={m} tone={{ front: "#1d2023", side: "#15181b", top: "#202327" }} />;
  const handle = (u0: number, u1: number, key: string) => (
    <Plane key={key} w={u1 - u0} h={13} m={m} at={[(u0 + u1) / 2 - W / 2, -H / 2 - 6.5, 0]}>
      <path d={`M1.5 13 V1.8 H${u1 - u0 - 1.5} V13`} fill="none" stroke="#0b0c0d" strokeWidth={2.6} strokeLinejoin="round" />
    </Plane>
  );
  const sideH = H - TF - BF;
  return (
    <>
      {post([0, P], [0.4, 3.4], true, "fl")}
      {post([W - P, W], [0.4, 3.4], true, "fr")}
      {post([0, P], [D - 3, D], false, "bl")}
      {post([W - P, W], [D - 3, D], false, "br")}
      <Cuboid
        {...place([0, W], [0, TF], [0, D])}
        m={m}
        tone={{ front: "#e2e5e7", side: "#c9ced1", top: "#1c1f22" }}
        faces={{
          front: (
            <>
              <text x={W / 2 - 3.5} y={3} fontSize={1.8} fill="#111">Tec</text>
              <text x={W / 2} y={6.6} fontSize={3.8} fontWeight={700} fill="#111" textAnchor="middle" letterSpacing={0.2}>MOJO</text>
            </>
          ),
          top: (
            <>
              <defs>
                <pattern id="lab-perf-3d" width={3} height={3} patternUnits="userSpaceOnUse">
                  <rect width={1.3} height={1.3} fill="#0a0b0c" />
                </pattern>
              </defs>
              <rect x={4} y={4} width={W - 8} height={D - 8} fill="url(#lab-perf-3d)" />
            </>
          ),
        }}
      />
      <Cuboid {...place([0, W], [H - BF, H], [0, D])} m={m} tone={POST} />
      <Cuboid {...place([2, W - 2], [BLANK[0] + 0.3, BLANK[1] - 0.3], [0, 1.5])} m={m} tone={{ front: "#0e1012", side: "#0c0d0f", top: "#121416" }} />
      {shelf(SWITCH[1], "s1")}
      {shelf(TINY[1], "s2")}
      {shelf(H - BF, "s3")}
      {inside("patch")}
      {inside("switch")}
      {inside("p340")}
      {inside("ssd")}
      {inside("pdu", 180)}
      {/* white Cat6a jumpers, patch 3–10 → switch 1–8 */}
      <Plane w={W} h={SW_BODY[1] - PATCH[0]} m={m} at={[0, (PATCH[0] + SW_BODY[1]) / 2 - H / 2, D / 2 + 0.15]} vb={`0 ${PATCH[0]} ${W} ${SW_BODY[1] - PATCH[0]}`}>
        <g fill="none" stroke="#eef1f3" strokeWidth={0.9} strokeLinecap="round" opacity={0.9}>
          {PLUGGED.map((p, i) => {
            const x1 = 2 + patchX(p) + 1.45;
            const y1 = PATCH[0] + 4;
            const x2 = 13 + swX(i) + 1.7;
            const y2 = SW_BODY[0] + 3.4;
            return <path key={p} d={`M${x1} ${y1} C${x1 - 1.5} ${y1 + 6}, ${x2 + 2.5} ${y2 - 5}, ${x2} ${y2}`} />;
          })}
        </g>
      </Plane>
      {/* smoked translucent side panels */}
      {[-1, 1].map((sgn) => (
        <Plane
          key={sgn}
          w={D - 6}
          h={sideH}
          m={m}
          at={[(sgn * W) / 2, TF + sideH / 2 - H / 2, 0]}
          turn={90}
          fill="rgba(175,205,220,0.12)"
          border="1px solid rgba(214,218,221,0.3)"
        />
      ))}
      {handle(7, 26, "h1")}
      {handle(W - 26, W - 7, "h2")}
    </>
  );
}

function Model({ id, m }: { id: PartId; m: number }) {
  return id === "rack" ? <RackModel m={m} /> : <PartModel id={id} m={m} />;
}

// ─── Viewer ──────────────────────────────────────────────────────────────

const SHORT: Record<PartId, string> = { rack: "Rack", patch: "Patch panel", switch: "Switch", p340: "P340 Tiny", ssd: "SSD", pdu: "PDU" };

export const PartViewer = forwardRef<
  PartViewerHandle,
  { initial: PartId; poseOf: (id: PartId) => Pose; onClose: () => void; onGo: (id: string) => void }
>(function PartViewer({ initial, poseOf, onClose, onGo }, ref) {
  const [part, setPart] = useState<PartId>(initial);
  const layer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const model = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const partRef = useRef(part);
  const st = useRef({ x: 0, y: 0, s: 0.01, rx: ISO_RX, ry: ISO_RY });
  const rest = useRef({ rx: -16, ry: -32 });
  const mode = useRef<"lift" | "idle" | "drag">("lift");
  const clock = useRef(0);
  const first = useRef(true);

  const draw = () => {
    const { x, y, s, rx, ry } = st.current;
    if (model.current)
      model.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale3d(${s}, ${s}, ${s}) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  /** Centre of the stage and the scale that fits the model in it. */
  const stagePose = (id: PartId) => {
    const r = stage.current!.getBoundingClientRect();
    const host = layer.current!.getBoundingClientRect();
    const size = partSize(id);
    const diag = Math.hypot(size.w, size.h, size.d) * modelScale(id);
    return {
      x: r.left - host.left + r.width / 2,
      y: r.top - host.top + r.height / 2,
      s: Math.min(1.1, (Math.min(r.width, r.height) * 0.92) / diag, (r.width * 0.86) / (Math.max(size.w, size.d) * modelScale(id) * 1.2)),
    };
  };

  /** Where the part sits in the room right now (follows the camera). */
  const roomPose = (id: PartId) => {
    const p = poseOf(id);
    return { x: p.x, y: p.y, s: p.px / (modelScale(id) * ISO_SHRINK) };
  };

  useImperativeHandle(ref, () => ({
    enter() {
      const id = partRef.current;
      mode.current = "lift";
      const p = { t: 0 };
      gsap.set(fade.current, { opacity: 0 });
      gsap.set(card.current, { autoAlpha: 0 });
      gsap
        .timeline()
        .to(p, {
          t: 1,
          duration: 1,
          ease: "power3.inOut",
          onUpdate: () => {
            const a = roomPose(id);
            const b = stagePose(id);
            st.current = {
              x: lerp(a.x, b.x, p.t),
              y: lerp(a.y, b.y, p.t),
              s: lerp(a.s, b.s, p.t),
              rx: lerp(ISO_RX, rest.current.rx, p.t),
              ry: lerp(ISO_RY, rest.current.ry, p.t),
            };
            draw();
          },
          onComplete: () => {
            mode.current = "idle";
            clock.current = 0;
          },
        })
        .to(fade.current, { opacity: 1, duration: 0.2 }, 0)
        .fromTo(card.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.6);
    },
    leave(onDone) {
      const id = partRef.current;
      mode.current = "lift";
      const from = { ...st.current };
      // shortest way back to the isometric angle
      const ry = ISO_RY + 360 * Math.round((from.ry - ISO_RY) / 360);
      const p = { t: 0 };
      gsap.to(card.current, { autoAlpha: 0, y: 12, duration: 0.2 });
      gsap
        .timeline({ onComplete: onDone })
        .to(p, {
          t: 1,
          duration: 0.75,
          ease: "power3.inOut",
          onUpdate: () => {
            const a = roomPose(id);
            st.current = {
              x: lerp(from.x, a.x, p.t),
              y: lerp(from.y, a.y, p.t),
              s: lerp(from.s, a.s, p.t),
              rx: lerp(from.rx, ISO_RX, p.t),
              ry: lerp(from.ry, ry, p.t),
            };
            draw();
          },
        })
        .to(fade.current, { opacity: 0, duration: 0.25 }, 0.5);
    },
  }));

  // Idle sway, and keep the model centred if the window resizes
  useEffect(() => {
    const tick = (_t: number, dt: number) => {
      if (mode.current !== "idle") return;
      clock.current += dt / 1000;
      const c = clock.current;
      const b = stagePose(partRef.current);
      st.current = { ...b, rx: rest.current.rx + 2.5 * Math.sin(c * 0.6), ry: rest.current.ry + 16 * Math.sin(c * 0.32) };
      draw();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Switching parts: fade the new model in at the stage
  useLayoutEffect(() => {
    partRef.current = part;
    if (first.current) {
      first.current = false;
      return;
    }
    const b = stagePose(part);
    st.current = { ...b, s: b.s * 0.9, rx: rest.current.rx, ry: rest.current.ry };
    draw();
    mode.current = "lift";
    gsap.fromTo(fade.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.to(st.current, {
      s: b.s,
      duration: 0.45,
      ease: "power3.out",
      onUpdate: draw,
      onComplete: () => {
        mode.current = "idle";
        clock.current = 0;
      },
    });
  }, [part]);

  const go = (next: PartId) => {
    if (next === partRef.current || mode.current === "lift") return;
    mode.current = "lift";
    gsap.to(fade.current, { opacity: 0, duration: 0.16, onComplete: () => setPart(next) });
  };

  // Drag to spin
  const drag = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (mode.current === "lift") return;
    drag.current = { x: e.clientX, y: e.clientY };
    mode.current = "drag";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    rest.current = { rx: clamp(rest.current.rx - dy * 0.35, -80, 30), ry: rest.current.ry + dx * 0.5 };
    st.current = { ...st.current, rx: rest.current.rx, ry: rest.current.ry };
    draw();
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    mode.current = "idle";
    clock.current = 0;
  };

  const info = PARTS[part];
  const idx = PART_ORDER.indexOf(part);
  const m = modelScale(part);

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 z-40">
      <div
        ref={stage}
        data-stage=""
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="pointer-events-auto absolute inset-x-0 top-12 h-[46%] cursor-grab touch-none active:cursor-grabbing md:inset-y-0 md:left-0 md:right-[25rem] md:top-0 md:h-auto"
      />
      <div ref={fade} className="absolute inset-0 opacity-0">
        <div
          aria-hidden
          className="absolute inset-x-0 top-12 h-[46%] bg-[radial-gradient(ellipse_45%_40%_at_50%_55%,rgba(148,163,184,0.10),transparent_70%)] md:inset-y-0 md:left-0 md:right-[25rem] md:top-0 md:h-auto"
        />
        <div ref={model} className="absolute left-0 top-0 [transform-style:preserve-3d]">
          <Model key={part} id={part} m={m} />
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-3 flex md:inset-x-auto md:inset-y-0 md:right-6 md:items-center">
        <div
          ref={card}
          role="dialog"
          aria-label={info.title}
          className="pointer-events-auto invisible max-h-[46svh] w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0b0e0d]/95 p-5 font-mono shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] md:max-h-[calc(100svh-6rem)] md:w-[22rem]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-putty/80">
              {info.kicker} <span className="text-white/30">· {idx + 1}/{PART_ORDER.length}</span>
            </p>
            <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 text-white/40 hover:text-white/80">
              ✕
            </button>
          </div>
          <h3 className="mt-2 font-sans text-lg font-semibold leading-snug text-white">{info.title}</h3>
          <ul className="mt-2.5 space-y-1 text-[12px] text-white/65">
            {info.specs.map((s) => (
              <li key={s}>
                <span className="text-putty/70">›</span> {s}
              </li>
            ))}
          </ul>

          {part === "p340" && (
            <div className="mt-4 border-t border-white/[0.07] pt-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">running on it</p>
              <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-white/60">
                {HOMELAB.services.map((s) => (
                  <li key={s.name}>
                    <span className="text-white/85">{s.name}</span>: {s.role}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onGo("map")}
                className="mt-3 text-[12px] text-putty underline decoration-putty/40 underline-offset-4 hover:text-white"
              >
                open the homelab map →
              </button>
            </div>
          )}

          {(info.amazon || info.extra) && (
            <div className="mt-4 flex flex-col gap-2">
              {info.amazon && (
                <a href={info.amazon} target="_blank" rel="noopener noreferrer" className="key key-sm key-light w-full">
                  View on Amazon ↗
                </a>
              )}
              {info.extra && (
                <a href={info.extra.href} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/50 underline decoration-white/20 underline-offset-4 hover:text-white/80">
                  {info.extra.label} ↗
                </a>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-2 gap-y-2.5 border-t border-white/[0.07] pt-4">
            {PART_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-pressed={id === part}
                className={`key key-xs ${id === part ? "key-light" : ""}`}
              >
                {SHORT[id]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-white/30">drag to rotate · esc to go back</p>
        </div>
      </div>
    </div>
  );
});
