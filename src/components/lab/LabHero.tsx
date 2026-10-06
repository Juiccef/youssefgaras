"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { CABLE_LENGTH, HOTSPOT_BY_ID, LabHotspots, LabScene, PART_BOXES, ROOM_BOUNDS, SINGLE_LIGHTS, WAN_BLOCK_AT } from "./LabScene";
import { LabTerminal, type LabTerminalHandle } from "./LabTerminal";
import { IDENTITY, boundsOf, clamp, cssMatrix, frame, lerpMat, project, quadMatrix, viewAt, type Mat, type Rect, type View } from "./camera";
import { K, iso } from "./iso";
import { RACK_SCALE } from "./mylab";
import { PartViewer, type PartViewerHandle, type Pose } from "./model";
import { isPart, type PartId } from "./parts";
import { LAB_SESSION_KEY } from "./intro-gate";
import { FocusSheet } from "./sheets";
import { NowPlaying } from "./music";
import { HINTS_KEY, LabMarkers, tipFor } from "./hints";
import { HOME_EVENT, PICK_EVENT, VIEW_EVENT, currentView, findWayOut, setView, takeEntry, wayOut, type Box } from "./view";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, MotionPathPlugin);

/** Touch screens: tiny objects get zoomed in on before they open. */
const TOUCH_MQ = "(pointer: coarse)";

// ─── Session ─────────────────────────────────────────────────────────────
// { user, at, active } in localStorage. `active`: this visitor has seen the
// room power on, so the site opens on the page instead of the start screen
// (intro-gate.ts). `exit` clears it.

const STORE = LAB_SESSION_KEY;
type Session = { user: string; at: number; active: boolean };

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      if (s && typeof s.user === "string") return s;
    } catch {
      if (/^[a-z0-9._-]{1,16}$/.test(raw)) return { user: raw, at: Date.now(), active: true };
    }
  } catch {
    // storage blocked
  }
  return null;
}

function writeSession(s: Session) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    // ignore
  }
}

const fmtLogin = (t: number) =>
  new Date(t).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

// ─── Boot script ─────────────────────────────────────────────────────────
// The real rack boots part by part (with labels in the scene), then the
// rest of the room comes up.

const REAL_BOOT = [
  { part: "pdu", host: "hezi-pdu", msg: "4 outlets · surge protected" },
  { part: "switch", host: "tl-sg108e", msg: "8/8 ports up · vlans loaded" },
  { part: "p340", host: "p340-tiny", msg: "debian 13 · 9+ containers up" },
  { part: "ssd", host: "ssd-2tb", msg: "mounted" },
];

const AMBIENT: { devices: string[]; cables?: string[] }[] = [
  { devices: ["room"], cables: ["wan"] },
  { devices: ["desk", "deskitems", "camera", "record"], cables: ["desk"] },
];

const bootLine = (host: string, msg: string) => (
  <p className="flex text-white/60">
    <span className="shrink-0 whitespace-pre">
      [<span className="text-[#5fd07a]">{"  OK  "}</span>] <span className="text-white/85">{host.padEnd(11)}</span>{" "}
    </span>
    <span>{msg}</span>
  </p>
);

/** "off": the visitor is on the page and the lab hasn't been started. */
type Phase = "init" | "off" | "intro" | "booting" | "live";

const HUD_BUTTONS = [
  { act: "out", icon: "−", label: "Zoom out" },
  { act: "in", icon: "+", label: "Zoom in" },
  { act: "reset", icon: "⟲", label: "Reset view" },
  { act: "full", icon: "⛶", label: "Full screen" },
] as const;

type LabApi = {
  /** Into the room from the page (view.ts), already on: it takes over where its picture was and the camera goes in. */
  enter: (from: Box | null) => void;
  /** The opening: put the room where it will power on (where its picture sits on the page, if that's on screen). */
  frameOpening: () => void;
  /** The opening is over: the page takes over (`now`: without a camera move, when the room was never shown). */
  toPage: (now?: boolean) => void;
  /** Everything on at once: no start screen, no boot. */
  lightUp: () => void;
  powerUp: (fast: boolean, who: string, onDone?: () => void, logged?: boolean) => void;
  skipBoot: () => void;
  powerDown: (onDone: () => void) => void;
  consoleBoot: (onDone: () => void, quick?: boolean) => void;
  hideConsole: (fast: boolean, onDone: () => void) => void;
  openTerm: () => void;
  closeTerm: (onDone: () => void) => void;
  showLogin: () => void;
  openFocus: (id: string) => void;
  closeFocus: (id: string, onDone: () => void) => void;
  zoomBy: (factor: number, clientX?: number, clientY?: number) => void;
  /** Zoom in on a point and bring it to the middle of the screen. */
  zoomAt: (clientX: number, clientY: number, factor: number) => void;
  nudge: (dx: number, dy: number) => void;
  /** The camera goes in: the room fills the screen. */
  stepIn: () => void;
  /** Back to where you stood when you came in. */
  resetView: () => void;
  /** Step outside: back out to the page. */
  home: () => void;
  /** Smallest side of an object's hit area on screen, in px. */
  hotspotPx: (id: string) => number;
  poseOf: (id: PartId) => Pose;
  /** The label over an object (null hides it); `flash` hides it again after a moment. */
  showTip: (id: string | null, flash?: boolean) => void;
  /** Leaving for the page: drop whatever was open and stop the room's loops. */
  sleep: () => void;
};

export function LabHero() {
  const root = useRef<HTMLElement>(null);
  const sceneWrap = useRef<HTMLDivElement>(null);
  const termWrap = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const term = useRef<LabTerminalHandle>(null);
  const viewer = useRef<PartViewerHandle>(null);
  const loops = useRef<gsap.core.Animation[]>([]);
  const blocked = useRef(0);
  const reduced = useRef(false);
  const busy = useRef(false);
  const lab = useRef<LabApi | null>(null);
  const phaseRef = useRef<Phase>("init");
  /** The start screen is playing itself (a first visit): nobody has to type. */
  const autoRef = useRef(false);
  /** The opening is running: a first visit starts in the room and ends on the page. */
  const openingRef = useRef(false);
  const focusRef = useRef<string | null>(null);
  const zoomedRef = useRef(false);
  const termRef = useRef(false);
  const hintsDoneRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("init");
  /** Who the start screen logs in as while it plays itself; null when the visitor is at the keyboard. */
  const [autoIntro, setAutoIntro] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  // The object being looked at up close (a hotspot id), and whether the
  // camera is inside the room (nav hidden, drag to look around)
  const [focus, setFocus] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [hudHint, setHudHint] = useState(false);
  // The record player is playing Doomsday (its YouTube player is in the now-playing card)
  const [music, setMusic] = useState(false);
  // Markers on the objects: once the room is up, until the visitor opens something
  const [ready, setReady] = useState(false);
  const [hintsDone, setHintsDone] = useState(true);

  const goPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // Everything that animates is created inside this GSAP context (cleaned
  // up on unmount) and exposed to event handlers through `lab`.
  useGSAP(
    (_ctx, contextSafe) => {
      const safe = contextSafe!;
      const hero = root.current!;
      const svgs = Array.from(hero.querySelectorAll<SVGSVGElement>("svg[data-cam]"));
      const marks = Array.from(hero.querySelectorAll<SVGGElement>("[data-mk]"));
      const tipEl = hero.querySelector<HTMLElement>("[data-tip]");
      const d = () => (reduced.current ? 0 : 1);

      // ── Camera: the viewBox every scene layer shares ────────────────
      const cam: View = { x: 0, y: 0, w: 1600, h: 900 };
      let returnView: View | null = null;
      let zoomed = false;

      const measure = () => {
        const h = hero.getBoundingClientRect();
        const s = svgs[0].getBoundingClientRect();
        // ignore the parallax offset: the camera is always framed for the resting position
        const px = Number(gsap.getProperty(sceneWrap.current, "x")) || 0;
        const py = Number(gsap.getProperty(sceneWrap.current, "y")) || 0;
        return { hl: h.left, ht: h.top, hw: h.width, hh: h.height, ew: s.width, eh: s.height, ox: s.left - h.left - px, oy: s.top - h.top - py };
      };
      let M = measure();
      /** Marker size: full on desktop, smaller where the whole room is small (phones). Set when framing. */
      let mkSize = 1;
      /** False while the hero is hidden (classic view): nothing to frame. */
      const shown = () => M.hw > 0 && M.ew > 0;

      // ── The label over the object you're pointing at ───────────────
      let tipId: string | null = null;
      const placeTip = () => {
        if (!tipEl || !tipId) return;
        const b = boundsOf(HOTSPOT_BY_ID[tipId].points);
        const s = M.ew / cam.w;
        const x = clamp((b.x + b.w / 2 - cam.x) * s, 70, M.ew - 70);
        const top = (b.y - cam.y) * s;
        // too close to the top of the screen: hang it under the object instead
        const below = top + M.oy < 84;
        tipEl.style.left = `${x.toFixed(1)}px`;
        tipEl.style.top = `${(below ? (b.y + b.h - cam.y) * s : top).toFixed(1)}px`;
        if (below) tipEl.dataset.below = "";
        else delete tipEl.dataset.below;
      };
      let tipTimer: gsap.core.Tween | null = null;
      const showTip = (id: string | null, flash = false) => {
        tipTimer?.kill();
        const text = id && HOTSPOT_BY_ID[id] && !hero.hasAttribute("data-dragging") ? tipFor(id) : null;
        tipId = text ? id : null;
        if (!tipEl) return;
        if (!tipId) {
          delete tipEl.dataset.on;
          return;
        }
        tipEl.textContent = text;
        placeTip();
        tipEl.dataset.on = "";
        if (flash) tipTimer = gsap.delayedCall(2, () => showTip(null));
      };

      const apply = () => {
        if (!shown() || ![cam.x, cam.y, cam.w, cam.h].every(Number.isFinite) || cam.w <= 0) return;
        const v = `${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.w.toFixed(2)} ${cam.h.toFixed(2)}`;
        svgs.forEach((s) => s.setAttribute("viewBox", v));
        // markers stay the same size on screen however far in you are
        const k = `scale(${((cam.w / M.ew) * mkSize).toFixed(4)})`;
        marks.forEach((g) => g.setAttribute("transform", k));
        placeTip();
      };

      /** The whole room, centred: how it's seen while it powers on, and as far out as the camera goes. */
      const restView = (m = M): View =>
        frame(ROOM_BOUNDS, { x: 16 - m.ox, y: 64 - m.oy, w: m.hw - 32, h: m.hh - 64 - 48 }, m.ew, m.eh);

      /** Close on an object: centred for close-ups, the whole rack beside the card for parts. */
      const focusView = (id: string, m = M): View => {
        const s0 = m.ew / restView(m).w;
        if (isPart(id)) {
          const b = boundsOf(HOTSPOT_BY_ID.rack.points);
          const st = hero.querySelector("[data-stage]")?.getBoundingClientRect();
          const r = st
            ? { x: st.left - m.hl - m.ox, y: st.top - m.ht - m.oy, w: st.width, h: st.height }
            : { x: -m.ox, y: -m.oy, w: m.hw, h: m.hh };
          const s = clamp(Math.min((r.w * 0.6) / b.w, (r.h * 0.82) / b.h), s0 * 1.2, s0 * 6);
          return viewAt(b.x + b.w / 2, b.y + b.h / 2, s, r.x + r.w / 2, r.y + r.h / 2, m.ew, m.eh);
        }
        const b = boundsOf(HOTSPOT_BY_ID[id].points);
        const s = clamp(Math.min((m.hw * 0.3) / b.w, (m.hh * 0.3) / b.h), s0 * 1.6, s0 * 4.5);
        return viewAt(b.x + b.w / 2, b.y + b.h / 2, s, m.hw / 2 - m.ox, m.hh / 2 - m.oy, m.ew, m.eh);
      };

      // ── Zooming into the room: wheel/pinch/keys, drag to look around ──
      // The whole room is the floor: zoom out to it and you step back outside.
      const restScale = (m = M) => m.ew / restView(m).w;
      const sizeMarkers = () => void (mkSize = clamp(restScale(M) / 0.9, 0.6, 1));
      const scales = (m = M) => {
        const b = ROOM_BOUNDS;
        const min = restScale(m);
        return { min, max: Math.max(Math.max(m.hw / b.w, m.hh / b.h) * 4.5, min * 3) };
      };
      /** Keep the room on screen: while it's smaller than the screen it stays inside it, once it's bigger it fills it. */
      const clampView = (v: View): View => {
        const b = ROOM_BOUNDS;
        const pad = (24 * v.w) / M.ew;
        const axis = (pos: number, size: number, lo: number, len: number) => {
          const a = lo - pad;
          const c = lo + len + pad - size;
          return clamp(pos, Math.min(a, c), Math.max(a, c));
        };
        return { x: axis(v.x, v.w, b.x, b.w), y: axis(v.y, v.h, b.y, b.h), w: v.w, h: v.h };
      };
      /** Scene point under a client-space point. */
      const scenePoint = (cx: number, cy: number): [number, number] => {
        const k = cam.w / M.ew;
        return [cam.x + (cx - M.hl - M.ox) * k, cam.y + (cy - M.ht - M.oy) * k];
      };
      /** The view after zooming by `f`, keeping the scene point under (cx, cy) in place. */
      const zoomedView = (f: number, cx = M.hl + M.hw / 2, cy = M.ht + M.hh / 2): View => {
        const k = scales(M);
        const s2 = clamp((M.ew / cam.w) * f, k.min, k.max);
        const [vx, vy] = scenePoint(cx, cy);
        const px = cx - M.hl - M.ox;
        const py = cy - M.ht - M.oy;
        return clampView({ x: vx - px / s2, y: vy - py / s2, w: M.ew / s2, h: M.eh / s2 });
      };

      /** Where a rack part sits on screen right now (the 3D model starts and ends here). */
      const poseOf = (id: PartId): Pose => {
        const b = PART_BOXES[id];
        const [x, y] = project([b.x + b.w / 2, b.y + b.d / 2, b.z + b.h / 2], cam, M.ew);
        return { x: x + M.ox, y: y + M.oy, px: RACK_SCALE * K * (M.ew / cam.w) };
      };

      // The lifted record turns in phase with the one on the platter (same 1.8 s turn)
      const syncSpin = (el: HTMLElement) => {
        const scene = hero.querySelector<SVGGElement>("[data-vinyl] .lab-spin");
        const spin = el.querySelector<HTMLElement>("[data-spin]");
        const t = scene ? getComputedStyle(scene).transform : "none";
        if (!spin || t === "none") return;
        const m = new DOMMatrix(t);
        const deg = ((Math.atan2(m.b, m.a) * 180) / Math.PI + 360) % 360;
        spin.style.animationDelay = `${(-(deg / 360) * 1.8).toFixed(3)}s`;
      };

      // A close-up starts as the object's face in the scene and lifts to the centre
      const liftEl = () => hero.querySelector<HTMLElement>("[data-lift]");
      const layoutBox = (el: HTMLElement): Rect => {
        const prev = el.style.transform;
        el.style.transform = "none";
        const r = el.getBoundingClientRect();
        el.style.transform = prev;
        return { x: r.left - M.hl, y: r.top - M.ht, w: r.width, h: r.height };
      };
      const faceMatrix = (id: string, box: Rect): Mat => {
        const [a, b, c] = HOTSPOT_BY_ID[id].face!.map((pt) => {
          const [x, y] = project(pt, cam, M.ew);
          return [x + M.ox - box.x, y + M.oy - box.y] as [number, number];
        });
        return quadMatrix(a, b, c, box.w, box.h);
      };

      // ── Parallax (desktop), paused while the camera is busy ─────────
      let parallax = false;
      let xTo: ((v: number) => void) | null = null;
      let yTo: ((v: number) => void) | null = null;
      const holdStill = () => {
        parallax = false;
        xTo?.(0);
        yTo?.(0);
      };

      // ── Inside the room: the nav steps aside and you can drag to look around ──
      let hinted = false;
      const markZoomed = (z: boolean) => {
        if (z === zoomed) return;
        zoomed = z;
        zoomedRef.current = z;
        setZoomed(z);
        if (!z) return;
        holdStill();
        // the first time in, say how to get around (once per visit)
        if (!hinted) {
          hinted = true;
          setHudHint(true);
          gsap.delayedCall(5, () => setHudHint(false));
        }
      };

      const glide = (v: View, duration = 0.35) =>
        gsap.to(cam, { ...v, duration: duration * d(), ease: "power3.out", overwrite: true, onUpdate: apply });

      // Stepping outside (the room is a place on the page, view.ts): the camera
      // pulls back to where the room's picture sits on the page, and the page
      // takes over on the same spot.
      /** Where the room's picture sits on the page, as a camera view (null when that isn't known). */
      const doorView = (): View | null => {
        const out = wayOut();
        return out ? frame(ROOM_BOUNDS, { x: out.x - M.hl - M.ox, y: out.y - M.ht - M.oy, w: out.w, h: out.h }, M.ew, M.eh) : null;
      };

      const leave = (duration = 0.9) => {
        if (busy.current) return;
        busy.current = true;
        showTip(null);
        holdStill();
        gsap.to("[data-dock]", { autoAlpha: 0, duration: 0.2 * d(), overwrite: true });
        gsap.to(cam, {
          ...(doorView() ?? restView(M)),
          duration: duration * d(),
          ease: "power3.inOut",
          overwrite: true,
          onUpdate: apply,
          onComplete: () => {
            busy.current = false;
            setView("classic");
            // a wheel still spinning from zooming out mustn't send the page flying
            const hold = (e: WheelEvent) => e.preventDefault();
            window.addEventListener("wheel", hold, { passive: false });
            window.setTimeout(() => window.removeEventListener("wheel", hold), 700);
          },
        });
      };

      /** Move the camera to `v` (gliding when `glideFor` > 0). Zoomed all the way out, you're back outside. */
      const zoomTo = (v: View, glideFor = 0) => {
        if (M.ew / v.w <= restScale(M) * 1.04) {
          if (zoomed) leave();
          return;
        }
        markZoomed(true);
        if (glideFor) {
          glide(v, glideFor);
          return;
        }
        gsap.killTweensOf(cam);
        Object.assign(cam, v);
        apply();
      };

      // ── Room power ──────────────────────────────────────────────────
      const powerOn = (tl: gsap.core.Timeline, id: string, at: number, fast: boolean) => {
        tl.to(`[data-base="${id}"]`, { opacity: 1, duration: fast ? 0.25 : 0.4, ease: "power1.out" }, at);
        if (hero.querySelector(`[data-pool="${id}"]`))
          tl.to(`[data-pool="${id}"]`, { opacity: 1, duration: 1.2, ease: "power1.out" }, at + 0.1);
        const flicker = { keyframes: { opacity: [0, 1, 0.2, 1, 0.55, 1] }, ease: "none" };
        tl.to(`[data-lights="${id}"]`, { ...flicker, duration: fast ? 0.35 : 0.6 }, at + 0.05);
      };

      const drawCable = (tl: gsap.core.Timeline, k: string, at: number, fast: boolean) => {
        tl.set(`[data-cable="${k}"]`, { opacity: 1 }, at);
        tl.fromTo(`[data-cable="${k}"] path`, { drawSVG: "0%" }, { drawSVG: "100%", duration: fast ? 0.5 : 0.9, ease: "power2.inOut" }, at);
      };

      const bumpBlocked = () => {
        blocked.current += 1;
        const n = blocked.current.toLocaleString();
        hero.querySelectorAll("[data-blocked-count]").forEach((el) => (el.textContent = n));
      };

      const startTraffic = safe(() => {
        if (reduced.current) return;

        gsap.utils.toArray<SVGGElement>("[data-pkt]").forEach((el) => {
          const cable = el.dataset.cable as keyof typeof CABLE_LENGTH;
          const dir = Number(el.dataset.dir);
          const path = `#lab-cable-${cable}`;
          const dur = CABLE_LENGTH[cable] / gsap.utils.random(110, 150);
          const tl = gsap.timeline({ repeat: -1, delay: gsap.utils.random(0, dur), repeatDelay: gsap.utils.random(0.4, 2.4) });
          tl.set(el, { opacity: 0 })
            .to(el, {
              duration: dur,
              ease: "none",
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: dir > 0 ? 0 : 1, end: dir > 0 ? 1 : 0 },
            }, 0)
            .to(el, { opacity: 1, duration: 0.25 }, 0)
            .to(el, { opacity: 0, duration: 0.25 }, dur - 0.25);
          loops.current.push(tl);
        });

        // Something hostile comes in from the wall jack and dies at the rack
        const wanDur = (CABLE_LENGTH.wan * WAN_BLOCK_AT) / 140;
        const red = "[data-blocked-pkt]";
        const btl = gsap.timeline({ repeat: -1, delay: 1.2, repeatDelay: 4 });
        btl.set(red, { opacity: 0 })
          .to(red, {
            duration: wanDur,
            ease: "none",
            motionPath: { path: "#lab-cable-wan", align: "#lab-cable-wan", alignOrigin: [0.5, 0.5], start: 0, end: WAN_BLOCK_AT },
          }, 0)
          .to(red, { opacity: 1, duration: 0.3 }, 0)
          .set(red, { opacity: 0 }, wanDur)
          .call(bumpBlocked, [], wanDur + 0.15)
          .fromTo("[data-fw-alert]", { opacity: 0 }, { keyframes: { opacity: [1, 0.35, 1, 1, 1, 0] }, duration: 1.8, ease: "none" }, wanDur + 0.1)
          .fromTo("[data-fw-burst]", { attr: { r: 1.5 }, opacity: 1 }, { attr: { r: 13 }, opacity: 0, duration: 0.9, ease: "power2.out" }, wanDur + 0.1);
        loops.current.push(btl);

        // Traffic bars on the CRT
        gsap.utils.toArray<SVGRectElement>("[data-bar]").forEach((bar) => {
          loops.current.push(
            gsap.to(bar, {
              scaleY: () => gsap.utils.random(0.25, 1),
              transformOrigin: "50% 100%",
              duration: gsap.utils.random(0.6, 1.3),
              ease: "sine.inOut",
              repeat: -1,
              repeatRefresh: true,
            }),
          );
        });
      });

      const stopTraffic = safe(() => {
        loops.current.forEach((t) => t.kill());
        loops.current = [];
        gsap.set("[data-pkt], [data-blocked-pkt], [data-fw-alert]", { opacity: 0 });
      });

      let consoleTl: gsap.core.Animation | null = null;
      let bootTl: gsap.core.Timeline | null = null;

      /** `logged`: the console already printed the boot log, so don't print it again. */
      const powerUp = safe((fast: boolean, who: string, onDone?: () => void, logged = false) => {
        const tl = gsap.timeline({
          onComplete: () => {
            parallax = true;
            onDone?.();
          },
        });
        bootTl = tl;
        const step = fast ? 0.1 : 0.45;
        // Cinematic: the room flickers up out of black while the camera slowly pulls back
        const o = fast ? 0 : 1;
        if (fast) {
          tl.to(sceneWrap.current, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power1.out" }, 0);
        } else {
          const s = M.ew / cam.w;
          const origin = `${(ROOM_BOUNDS.x + ROOM_BOUNDS.w / 2 - cam.x) * s}px ${(ROOM_BOUNDS.y + ROOM_BOUNDS.h * 0.55 - cam.y) * s}px`;
          tl.set(sceneWrap.current, { visibility: "visible", transformOrigin: origin }, 0)
            .fromTo(sceneWrap.current, { opacity: 0 }, { keyframes: { opacity: [0, 0.5, 0.06, 0.75, 0.25, 1] }, duration: 1.2, ease: "none" }, 0)
            .fromTo(sceneWrap.current, { scale: 1.2 }, { scale: 1, duration: 5.2, ease: "power2.out" }, 0);
        }

        tl.to('[data-base="myrack"]', { opacity: 1, duration: fast ? 0.25 : 0.5, ease: "power1.out" }, o + 0.1);
        tl.to('[data-pool="myrack"]', { opacity: 1, duration: 1.2, ease: "power1.out" }, o + 0.2);
        tl.to('[data-part="spot"]', { keyframes: { opacity: [0, 1, 0.3, 1, 0.7, 1] }, duration: fast ? 0.25 : 0.5, ease: "none" }, o);
        REAL_BOOT.forEach((b, i) => {
          const at = o + 0.35 + i * step;
          tl.to(`[data-part="${b.part}"]`, { keyframes: { opacity: [0, 1, 0.2, 1, 0.55, 1] }, duration: fast ? 0.3 : 0.5, ease: "none" }, at);
          if (!logged) tl.call(() => term.current?.print(bootLine(b.host, b.msg)), [], at);
          if (!fast) tl.fromTo(`[data-tag="${b.part}"]`, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, at);
        });

        let t = o + 0.35 + REAL_BOOT.length * step;
        if (!fast) tl.to("[data-tag]", { opacity: 0, duration: 0.45, stagger: 0.06 }, t + 0.7);

        const gap = fast ? 0.1 : 0.35;
        AMBIENT.forEach((a, i) => {
          const at = t + i * gap;
          a.devices.forEach((dv) => powerOn(tl, dv, at, fast));
          a.cables?.forEach((c) => drawCable(tl, c, at, fast));
        });
        t += AMBIENT.length * gap;

        tl.call(startTraffic, [], t);
        tl.call(() => term.current?.print(<p className="mt-1 text-white">lab online. welcome, {who}.</p>), [], t);
        tl.to({}, { duration: fast ? 0.1 : 0.5 });
      });

      // "skip intro" mid-boot: finish the console + boot instantly
      const skipBoot = safe(() => {
        consoleTl?.progress(1);
        bootTl?.progress(1);
      });

      const powerDown = safe((onDone: () => void) => {
        stopTraffic();
        holdStill();
        showTip(null);
        gsap
          .timeline({
            onComplete: () => {
              markZoomed(false);
              M = measure();
              Object.assign(cam, restView(M));
              apply();
              onDone();
            },
          })
          .to(termWrap.current, { autoAlpha: 0, duration: 0.25 }, 0)
          .set("[data-tag]", { opacity: 0 }, 0)
          .to("[data-cable] path", { drawSVG: "100% 100%", duration: 0.7, ease: "power2.in" }, 0)
          .to("[data-unit]", { opacity: 0, duration: 0.2, stagger: { each: 0.01, from: "end" } }, 0.1)
          .to(SINGLE_LIGHTS.map((id) => `[data-lights="${id}"]`).join(","), { opacity: 0, duration: 0.25, stagger: 0.08 }, 0.1)
          .to("[data-pool]", { opacity: 0, duration: 0.6 }, 0.1)
          .to("[data-base]", { opacity: 0.42, duration: 0.6 }, 0.3)
          .set("[data-cable]", { opacity: 0 })
          .to(sceneWrap.current, { autoAlpha: 0, duration: 0.7, ease: "power2.in" }, 0.5);
      });

      // Start screen → room: the console prints the systemd boot log for the
      // real rack, then fades out and the room flickers on. `quick` (the start
      // screen playing itself): the log goes by briskly; the room takes its time.
      const consoleBoot = safe((onDone: () => void, quick = false) => {
        const el = termWrap.current;
        gsap.killTweensOf(el);
        const tl = gsap.timeline({ onComplete: onDone });
        consoleTl = tl;
        const [first, each] = quick ? [0.15, 0.12] : [0.35, 0.32];
        REAL_BOOT.forEach((b, i) => tl.call(() => term.current?.print(bootLine(b.host, b.msg)), [], first + i * each));
        const end = first + REAL_BOOT.length * each;
        tl.call(
          () =>
            term.current?.print(
              <p className="whitespace-pre-wrap text-white/60">
                [<span className="text-[#5fd07a]">{"  OK  "}</span>] Reached target <span className="text-white/85">graphical.target</span> - the room.
              </p>,
            ),
          [],
          end + 0.1,
        );
        tl.to(el, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, end + (quick ? 0.5 : 0.6));
      });

      // Skip intro: the console just goes away
      const hideConsole = safe((fast: boolean, onDone: () => void) => {
        const el = termWrap.current;
        if (!el) return onDone();
        // skipping while the start screen is still fading in: that fade must not win
        gsap.killTweensOf(el);
        consoleTl = gsap.to(el, { autoAlpha: 0, duration: fast ? 0.3 : 0.6, ease: "power2.in", onComplete: onDone });
      });

      // After boot the console drops down from the top, like a game console
      const openTerm = safe(() => {
        showTip(null);
        gsap.fromTo(
          termWrap.current,
          { autoAlpha: 1, yPercent: -100 },
          { yPercent: 0, duration: 0.35, ease: "power3.out", onComplete: () => term.current?.focus() },
        );
      });

      const closeTerm = safe((onDone: () => void) => {
        gsap.to(termWrap.current, {
          yPercent: -100,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(termWrap.current, { autoAlpha: 0 });
            onDone();
          },
        });
      });

      // A hidden input can't take focus, so the prompt is focused once it has faded in (desktop only:
      // on phones that would throw the keyboard up)
      const focusPrompt = () => {
        if (window.matchMedia("(pointer: fine)").matches) term.current?.focus();
      };

      const showLogin = safe(() => {
        gsap.set(termWrap.current, { yPercent: 0 });
        gsap.fromTo(termWrap.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out", onComplete: focusPrompt });
      });

      // ── Close-ups ───────────────────────────────────────────────────
      const openFocus = safe((id: string) => {
        busy.current = true;
        holdStill();
        showTip(null);
        M = measure();
        returnView = zoomed ? { ...cam } : restView(M);
        const target = focusView(id, M);
        const tl = gsap.timeline({ onComplete: () => void (busy.current = false) });
        tl.to("[data-dock]", { autoAlpha: 0, duration: 0.3 * d() }, 0);
        tl.to(cam, { ...target, duration: 0.95 * d(), ease: "power3.inOut", onUpdate: apply }, 0);
        tl.to(dim.current, { autoAlpha: isPart(id) ? 1 : 0.85, duration: 0.5 * d() }, 0.35 * d());
        if (isPart(id)) {
          // stay busy until the model has finished floating out
          tl.call(() => viewer.current?.enter(), [], 0.4 * d()).to({}, { duration: 1.05 * d() }, 0.4 * d());
          return;
        }
        const el = liftEl();
        if (!el) return;
        const box = layoutBox(el);
        const p = { t: 0 };
        const step = () => {
          el.style.transform = cssMatrix(lerpMat(faceMatrix(id, box), IDENTITY, p.t));
        };
        step();
        if (id === "record") {
          syncSpin(el);
          tl.set("[data-vinyl]", { opacity: 0 }, 0.45 * d());
        }
        tl.to(p, { t: 1, duration: 0.8 * d(), ease: "power3.inOut", onUpdate: step, onComplete: step }, 0.45 * d());
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 * d() }, 0.45 * d());
        tl.fromTo("[data-chrome]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35 * d() }, 1.05 * d());
      });

      const closeFocus = safe((id: string, onDone: () => void) => {
        busy.current = true;
        M = measure();
        const back = returnView ?? restView(M);
        const tl = gsap.timeline({
          onComplete: () => {
            busy.current = false;
            if (!zoomed) parallax = true;
            onDone();
          },
        });
        if (hero.querySelector("[data-chrome]")) tl.to("[data-chrome]", { autoAlpha: 0, duration: 0.2 * d() }, 0);
        if (isPart(id)) {
          tl.call(() => viewer.current?.leave(), [], 0);
        } else {
          const el = liftEl();
          if (el) {
            const box = layoutBox(el);
            const p = { t: 1 };
            const step = () => {
              el.style.transform = cssMatrix(lerpMat(faceMatrix(id, box), IDENTITY, p.t));
            };
            tl.to(p, { t: 0, duration: 0.65 * d(), ease: "power3.inOut", onUpdate: step }, 0);
            tl.to(el, { opacity: 0, duration: 0.25 * d() }, 0.4 * d());
            if (id === "record") tl.set("[data-vinyl]", { opacity: 1 }, 0.4 * d());
          }
        }
        tl.to(dim.current, { autoAlpha: 0, duration: 0.5 * d() }, 0.25 * d());
        tl.to(cam, { ...back, duration: 0.9 * d(), ease: "power3.inOut", onUpdate: apply }, 0.25 * d());
        tl.to("[data-dock]", { autoAlpha: 1, duration: 0.4 * d() }, 0.85 * d());
      });

      const zoomBy = safe((f: number, cx?: number, cy?: number) => {
        M = measure();
        zoomTo(zoomedView(f, cx, cy), 0.35);
      });

      const zoomAt = safe((cx: number, cy: number, f: number) => {
        M = measure();
        const k = scales(M);
        const s2 = clamp((M.ew / cam.w) * f, k.min, k.max);
        const [x, y] = scenePoint(cx, cy);
        zoomTo(clampView(viewAt(x, y, s2, M.hw / 2 - M.ox, M.hh / 2 - M.oy, M.ew, M.eh)), 0.9);
      });

      /** Where the eye lands when you step in: between the rack and the desk, the room filling the screen. */
      const FOCAL = iso(560, 575, 70);
      const insideView = (): View => {
        const b = ROOM_BOUNDS;
        const cover = Math.max(M.hw / b.w, M.hh / b.h);
        const contain = Math.min(M.hw / b.w, M.hh / b.h);
        const k = scales(M);
        const s = clamp(Math.min(cover * 0.92, contain * 2.2), k.min * 1.15, k.max);
        return clampView(viewAt(FOCAL[0], FOCAL[1], s, M.hw / 2 - M.ox, M.hh / 2 - M.oy, M.ew, M.eh));
      };

      const stepIn = safe(() => {
        if (zoomed) return;
        M = measure();
        markZoomed(true);
        gsap.to(cam, { ...insideView(), duration: 1.05 * d(), ease: "power3.inOut", overwrite: true, onUpdate: apply });
      });

      // In through the door from the page (view.ts) with the room already on,
      // as it is in its picture: it appears exactly where the picture was and
      // the camera goes in. (With no picture to come from, it's simply there.)
      const lightUp = safe(() => {
        consoleTl?.kill();
        bootTl?.kill();
        gsap.killTweensOf(termWrap.current);
        gsap.set("[data-base], [data-lights], [data-unit], [data-pool], [data-cable]:not([data-pkt])", { opacity: 1 });
        gsap.set("[data-cable] path", { drawSVG: "0% 100%" });
        gsap.set(sceneWrap.current, { autoAlpha: 1, scale: 1 });
        gsap.set(termWrap.current, { autoAlpha: 0 });
        startTraffic();
      });

      const enter = safe((from: Box | null) => {
        M = measure();
        if (!shown()) return;
        sizeMarkers();
        if (phaseRef.current === "live") {
          loops.current.forEach((t) => t.resume());
        } else {
          // not powered on in this visit yet: no start screen, no boot, it's just on
          lightUp();
          const session = readSession();
          const who = session?.user ?? "guest";
          term.current?.login(who);
          if (session)
            term.current?.print(
              <p>Last login: {fmtLogin(session.at)} on tty1</p>,
              <p>
                session restored. welcome back, <span className="font-bold text-white">{who}</span>. type{" "}
                <span className="font-bold text-white">help</span> to look around.
              </p>,
              <p>&nbsp;</p>,
            );
          writeSession({ user: who, at: Date.now(), active: true });
          autoRef.current = false;
          setAutoIntro(null);
          goPhase("live");
          setReady(true);
        }
        gsap.killTweensOf(cam);
        markZoomed(true);
        if (!from) {
          Object.assign(cam, insideView());
          apply();
          return;
        }
        Object.assign(cam, frame(ROOM_BOUNDS, { x: from.x - M.hl - M.ox, y: from.y - M.ht - M.oy, w: from.w, h: from.h }, M.ew, M.eh));
        apply();
        busy.current = true;
        gsap.to(cam, {
          ...insideView(),
          duration: 1.15 * d(),
          ease: "power3.inOut",
          overwrite: true,
          onUpdate: apply,
          onComplete: () => void (busy.current = false),
        });
      });

      const resetView = safe(() => {
        if (!zoomed) return;
        M = measure();
        glide(insideView(), 0.8);
      });

      const nudge = safe((dx: number, dy: number) => {
        if (!zoomed) return;
        const s = M.ew / cam.w;
        glide(clampView({ ...cam, x: cam.x + dx / s, y: cam.y + dy / s }), 0.4);
      });

      const home = safe(() => {
        if (!zoomed) return;
        M = measure();
        leave();
      });

      // ── The opening ─────────────────────────────────────────────────
      // A first visit starts here in the room, on the console start screen
      // (intro-gate.ts). It plays itself (logs in as guest and runs `boot`,
      // see LabTerminal), the room powers on, and the page takes over around
      // it. Nobody has to type.
      const intro = () => {
        M = measure();
        if (shown()) {
          sizeMarkers();
          Object.assign(cam, restView(M));
          apply();
        }
        gsap.set(sceneWrap.current, { autoAlpha: 0 });
        openingRef.current = true;
        setOpening(true);
        autoRef.current = true;
        setAutoIntro(readSession()?.user ?? "guest");
        goPhase("intro");
        // the start screen is already up: the gate has been showing the server's copy of it
        gsap.set(termWrap.current, { autoAlpha: 1 });
        delete document.documentElement.dataset.opening;
      };

      /** The room powered on right where its picture sits on the page (so the page only has to appear around it). */
      let inPlace = false;
      const frameOpening = safe(() => {
        findWayOut();
        M = measure();
        const out = wayOut();
        // on a small screen the picture is further down the page than the screen is tall: power on centred instead
        inPlace = !!out && out.x >= 0 && out.y >= 0 && out.x + out.w <= M.hw && out.y + out.h <= M.hh;
        Object.assign(cam, (inPlace && doorView()) || restView(M));
        apply();
      });

      const toPage = safe((now = false) => {
        if (now) return void setView("classic");
        M = measure();
        // the mouse may have moved the picture since, and on a small screen the room still has to get there
        leave(inPlace ? 0.45 : 0.9);
      });

      const hotspotPx = (id: string) => {
        const h = HOTSPOT_BY_ID[id];
        if (!h) return Infinity;
        M = measure();
        const b = boundsOf(h.points);
        return Math.min(b.w, b.h) * (M.ew / cam.w);
      };

      // Drag to look around (once zoomed in), pinch/wheel to zoom
      const canMove = () => phaseRef.current === "live" && !focusRef.current && !busy.current;
      const touches = new Map<number, { x: number; y: number }>();
      let moved = 0;
      const spread = () => {
        const [a, b] = [...touches.values()];
        return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      };
      const onDown = (e: PointerEvent) => {
        if (!canMove()) return;
        if ((e.target as Element).closest("button, a, input, [data-term], [data-hud]")) return;
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (touches.size === 1) moved = 0;
        M = measure();
      };
      const onDrag = (e: PointerEvent) => {
        const p = touches.get(e.pointerId);
        if (!p) return;
        if (touches.size === 1) {
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          moved += Math.abs(dx) + Math.abs(dy);
          if (zoomed && moved > 6) {
            gsap.killTweensOf(cam);
            const s = M.ew / cam.w;
            Object.assign(cam, clampView({ ...cam, x: cam.x - dx / s, y: cam.y - dy / s }));
            if (!hero.hasAttribute("data-dragging")) {
              hero.dataset.dragging = "";
              showTip(null);
            }
            apply();
          }
          p.x = e.clientX;
          p.y = e.clientY;
          return;
        }
        const before = spread();
        p.x = e.clientX;
        p.y = e.clientY;
        const after = spread();
        moved += 10;
        if (before.d <= 0) return;
        // pan with the fingers (once zoomed), then zoom around them
        if (zoomed) {
          gsap.killTweensOf(cam);
          const s = M.ew / cam.w;
          Object.assign(cam, clampView({ ...cam, x: cam.x - (after.x - before.x) / s, y: cam.y - (after.y - before.y) / s }));
          apply();
        }
        zoomTo(zoomedView(after.d / before.d, after.x, after.y));
      };
      const onUp = (e: PointerEvent) => {
        touches.delete(e.pointerId);
        if (!touches.size) delete hero.dataset.dragging;
      };
      // a drag that ends on an object must not open it
      const onClickCapture = (e: MouseEvent) => {
        if (moved > 6) {
          e.stopPropagation();
          e.preventDefault();
        }
        moved = 0;
      };
      // The room is the whole page, so the wheel zooms it (the console scrolls as usual)
      const onWheel = (e: WheelEvent) => {
        if (!canMove()) return;
        if ((e.target as Element).closest("[data-term]")) return;
        e.preventDefault();
        M = measure();
        const f = Math.exp(-(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * (e.ctrlKey ? 0.01 : 0.0015));
        zoomTo(zoomedView(f, e.clientX, e.clientY));
      };
      hero.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onDrag);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      hero.addEventListener("click", onClickCapture, true);
      hero.addEventListener("wheel", onWheel, { passive: false });

      // ── Back on the page: the room sleeps ───────────────────────────
      const sleep = safe(() => {
        gsap.killTweensOf(cam);
        showTip(null);
        holdStill();
        markZoomed(false);
        returnView = null;
        busy.current = false;
        gsap.set(dim.current, { autoAlpha: 0 });
        gsap.set("[data-vinyl]", { opacity: 1 });
        if (phaseRef.current === "live") gsap.set("[data-dock]", { autoAlpha: 1 });
        if (termRef.current) gsap.set(termWrap.current, { autoAlpha: 0, yPercent: -100 });
        loops.current.forEach((t) => t.pause());
      });
      lab.current = {
        enter, frameOpening, toPage, lightUp, powerUp, skipBoot, powerDown, consoleBoot, hideConsole, openTerm, closeTerm, showLogin,
        openFocus, closeFocus, zoomBy, zoomAt, stepIn, resetView, nudge, home, hotspotPx, poseOf, showTip, sleep,
      };

      // ── Keep the room framed ────────────────────────────────────────
      let raf = 0;
      const reframe = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (busy.current) return;
          const s = M.ew / cam.w;
          const was = shown();
          M = measure();
          if (!shown()) return;
          sizeMarkers();
          const id = focusRef.current;
          if (id) Object.assign(cam, focusView(id, M));
          else if (zoomed && was) {
            // keep what you were looking at: same centre, same zoom
            const [cx, cy] = [cam.x + cam.w / 2, cam.y + cam.h / 2];
            Object.assign(cam, clampView({ x: cx - M.ew / s / 2, y: cy - M.eh / s / 2, w: M.ew / s, h: M.eh / s }));
          } else {
            markZoomed(false);
            Object.assign(cam, restView(M));
          }
          apply();
        });
      };
      const ro = new ResizeObserver(reframe);
      ro.observe(hero);
      document.fonts?.ready.then(reframe);

      reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      try {
        hintsDoneRef.current = localStorage.getItem(HINTS_KEY) === "1";
      } catch {
        hintsDoneRef.current = false;
      }
      setHintsDone(hintsDoneRef.current);
      // A first visit opens here (the gate put the room up); otherwise the page
      // comes first and the room waits until someone steps inside
      if (currentView() === "room") intro();
      else goPhase("off");

      // Gentle parallax on desktop, while the whole room is in view (as it powers on)
      let onMove: ((e: PointerEvent) => void) | null = null;
      if (!reduced.current && window.matchMedia("(pointer: fine)").matches && sceneWrap.current) {
        const qx = gsap.quickTo(sceneWrap.current, "x", { duration: 1.4, ease: "power3" });
        const qy = gsap.quickTo(sceneWrap.current, "y", { duration: 1.4, ease: "power3" });
        xTo = qx;
        yTo = qy;
        onMove = (e: PointerEvent) => {
          if (!parallax) return;
          qx((e.clientX / window.innerWidth - 0.5) * -16);
          qy((e.clientY / window.innerHeight - 0.5) * -9);
        };
        window.addEventListener("pointermove", onMove);
      }

      return () => {
        hero.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onDrag);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        hero.removeEventListener("click", onClickCapture, true);
        hero.removeEventListener("wheel", onWheel);
        ro.disconnect();
        cancelAnimationFrame(raf);
        if (onMove) window.removeEventListener("pointermove", onMove);
      };
    },
    { scope: root },
  );

  // ── Terminal ─────────────────────────────────────────────────────────

  const handleBoot = useCallback((fast = false, who?: string) => {
    if (busy.current) return;
    busy.current = true;
    const name = who || "guest";
    // the start screen was playing itself: its boot log goes by briskly too
    const auto = autoRef.current;
    const first = openingRef.current;
    autoRef.current = false;
    setAutoIntro(null);
    term.current?.login(name);
    writeSession({ user: name, at: Date.now(), active: true });
    phaseRef.current = "booting";
    setPhase("booting");

    // The room is up. In the opening the page takes over next; any other time
    // (rebooted from its console) the camera goes inside (the effect below).
    const goLive = () => {
      phaseRef.current = "live";
      setPhase("live");
      busy.current = false;
      window.setTimeout(() => setReady(true), 700);
    };

    if (fast) {
      lab.current?.hideConsole(true, () => {
        if (first) {
          // the opening, skipped: the room is simply on, and it's straight to the page
          lab.current?.lightUp();
          goLive();
          lab.current?.toPage(true);
        } else {
          goLive();
          lab.current?.powerUp(true, name);
        }
      });
    } else {
      term.current?.print(<p className="text-[#8a8a8a]">powering on the homelab…</p>);
      lab.current?.consoleBoot(() => {
        if (!first) return lab.current?.powerUp(false, name, goLive, true);
        lab.current?.frameOpening();
        lab.current?.powerUp(
          false,
          name,
          () => {
            goLive();
            lab.current?.toPage();
          },
          true,
        );
      }, auto);
    }
  }, []);

  const skipIntro = () => {
    if (phase === "intro") handleBoot(true);
    else if (phase === "booting") lab.current?.skipBoot();
  };

  const handleLogout = useCallback((reason: "exit" | "reboot") => {
    if (busy.current) return;
    busy.current = true;
    setMusic(false);
    setReady(false);
    const s = readSession();
    if (s) writeSession({ ...s, active: false });
    lab.current?.powerDown(() => {
      term.current?.reset();
      if (reason === "reboot") term.current?.print(<p className="text-white/40">System restarted.</p>);
      termRef.current = false;
      setTermOpen(false);
      phaseRef.current = "intro";
      setPhase("intro");
      lab.current?.showLogin();
      busy.current = false;
    });
  }, []);

  const toggleTerm = useCallback(() => {
    if (busy.current || focusRef.current) return;
    const open = !termRef.current;
    termRef.current = open;
    setTermOpen(open);
    if (open) lab.current?.openTerm();
    else lab.current?.closeTerm(() => {});
  }, []);

  // ── Back outside ─────────────────────────────────────────────────────

  const stepOutside = () => {
    if (busy.current || focusRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    lab.current?.home();
  };

  const hudAction = (act: (typeof HUD_BUTTONS)[number]["act"]) => {
    if (act === "in") lab.current?.zoomBy(1.4);
    else if (act === "out") lab.current?.zoomBy(1 / 1.4);
    else if (act === "reset") lab.current?.resetView();
    else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else root.current?.requestFullscreen?.().catch(() => {});
  };

  // ── Close-ups ────────────────────────────────────────────────────────

  const pick = useCallback((id: string, at?: { x: number; y: number }) => {
    if (busy.current || focusRef.current || !HOTSPOT_BY_ID[id]) return;
    if (at && window.matchMedia(TOUCH_MQ).matches && (lab.current?.hotspotPx(id) ?? Infinity) < 28) {
      // too small to tap reliably: zoom in on it first, and say what it is
      lab.current?.zoomAt(at.x, at.y, 2.2);
      lab.current?.showTip(id, true);
      return;
    }
    if (id === "record") setMusic(true);
    if (termRef.current) {
      termRef.current = false;
      setTermOpen(false);
      lab.current?.closeTerm(() => {});
    }
    // they've found out things open: the markers can go
    if (!hintsDoneRef.current) {
      hintsDoneRef.current = true;
      setHintsDone(true);
      try {
        localStorage.setItem(HINTS_KEY, "1");
      } catch {
        // ignore
      }
    }
    focusRef.current = id;
    setFocus(id);
  }, []);

  // The close-up is in the DOM now: fly the camera in and lift it off its object
  useLayoutEffect(() => {
    if (focus) lab.current?.openFocus(focus);
  }, [focus]);

  const closeFocus = useCallback((then?: string) => {
    const id = focusRef.current;
    if (!id || busy.current) return;
    lab.current?.closeFocus(id, () => {
      focusRef.current = then ?? null;
      setFocus(then ?? null);
    });
  }, []);

  // The page ⇄ the room (view.ts). Back to the page: anything open closes and
  // the room sleeps (the music keeps playing), and the opening is over.
  useEffect(() => {
    const onView = () => {
      const v = currentView();
      const l = lab.current;
      if (!l) return;
      if (v === "classic") {
        if (phaseRef.current === "booting") l.skipBoot();
        l.sleep();
        focusRef.current = null;
        setFocus(null);
        termRef.current = false;
        setTermOpen(false);
        if (phaseRef.current === "intro" || phaseRef.current === "init") {
          phaseRef.current = "off";
          setPhase("off");
        }
        openingRef.current = false;
        setOpening(false);
      } else if (v === "room") {
        l.enter(takeEntry());
      }
    };
    window.addEventListener(VIEW_EVENT, onView);
    return () => window.removeEventListener(VIEW_EVENT, onView);
  }, []);

  // The room is only ever used from inside: when it comes back up after being
  // rebooted from its console, the camera goes in. (The opening ends on the
  // page instead.)
  useEffect(() => {
    if (phase === "live" && currentView() === "room" && !zoomedRef.current && !openingRef.current) lab.current?.stepIn();
  }, [phase]);

  // The nav in the room: its links open the matching object, the logo steps back outside
  useEffect(() => {
    const onPick = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (phaseRef.current !== "live" || busy.current) return;
      if (focusRef.current) {
        if (focusRef.current !== id) closeFocus(id);
        return;
      }
      pick(id);
    };
    const onHome = () => {
      if (focusRef.current) closeFocus();
      else if (termRef.current) toggleTerm();
      else lab.current?.home();
    };
    window.addEventListener(PICK_EVENT, onPick);
    window.addEventListener(HOME_EVENT, onHome);
    return () => {
      window.removeEventListener(PICK_EVENT, onPick);
      window.removeEventListener(HOME_EVENT, onHome);
    };
  }, [pick, closeFocus, toggleTerm]);

  // The start screen is just the terminal on black: no nav until the lab is on.
  // (For the opening the gate already set this before React loaded.)
  useEffect(() => {
    const el = document.documentElement;
    if (phase === "intro" || phase === "booting") {
      el.dataset.labIntro = "";
      window.scrollTo({ top: 0, behavior: "instant" });
    } else if (phase === "live" || phase === "off") {
      delete el.dataset.labIntro;
    }
  }, [phase]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.labIntro;
    },
    [],
  );

  // Close-ups get the whole screen: the site nav steps aside
  useEffect(() => {
    const el = document.documentElement;
    if (focus) el.dataset.labFocus = "";
    else delete el.dataset.labFocus;
    return () => {
      delete el.dataset.labFocus;
    };
  }, [focus]);

  // Notes drift off the record while it's playing (CSS keys off this)
  useEffect(() => {
    const el = document.documentElement;
    if (music) el.dataset.labMusic = "";
    else delete el.dataset.labMusic;
    return () => {
      delete el.dataset.labMusic;
    };
  }, [music]);

  // Inside the room: the nav steps aside and the cursor says you can drag
  useEffect(() => {
    const el = document.documentElement;
    if (zoomed) el.dataset.labZoomed = "";
    else delete el.dataset.labZoomed;
    return () => {
      delete el.dataset.labZoomed;
    };
  }, [zoomed]);

  // ` toggles the terminal, Esc backs out of whatever is open (and then out of
  // the room); +/−/0 zoom and the arrows look around
  useEffect(() => {
    if (phase !== "live") return;
    const onKey = (e: KeyboardEvent) => {
      if (currentView() === "classic") return;
      if (e.key === "Escape") {
        if (focusRef.current) closeFocus();
        else if (termRef.current) toggleTerm();
        else {
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          lab.current?.home();
        }
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "`") {
        e.preventDefault();
        toggleTerm();
        return;
      }
      if (focusRef.current || termRef.current || e.metaKey || e.ctrlKey || e.altKey) return;
      const l = lab.current;
      const keys: Record<string, () => void> = {
        "+": () => l?.zoomBy(1.3),
        "=": () => l?.zoomBy(1.3),
        "-": () => l?.zoomBy(1 / 1.3),
        _: () => l?.zoomBy(1 / 1.3),
        "0": () => l?.resetView(),
        ArrowLeft: () => l?.nudge(-90, 0),
        ArrowRight: () => l?.nudge(90, 0),
        ArrowUp: () => l?.nudge(0, -90),
        ArrowDown: () => l?.nudge(0, 90),
      };
      if (keys[e.key]) {
        e.preventDefault();
        keys[e.key]();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, closeFocus, toggleTerm]);

  const live = phase === "live";
  const mode = phase === "intro" ? "intro" : phase === "live" ? "shell" : "busy";
  const markers = live && ready && !hintsDone && !focus && !termOpen;

  // overflow-clip, not hidden: a hidden box can still be scrolled programmatically
  return (
    <section id="hero" ref={root} data-phase={phase} className="relative min-h-[100svh] overflow-clip bg-[#050706]">
      {/* Scene + click targets, slightly oversized so parallax never shows an edge */}
      <div ref={sceneWrap} className="pointer-events-none absolute -inset-4 opacity-0 md:-inset-6">
        <LabScene />
        <LabMarkers show={markers} />
        <LabHotspots enabled={live && !focus} onPick={pick} onHover={(id) => lab.current?.showTip(id)} />
        <div
          data-tip=""
          aria-hidden
          className="lab-tip pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-md border border-putty/25 bg-[#0b0d0c]/95 px-2 py-1 font-mono text-[11px] leading-none text-putty shadow-[0_8px_24px_-8px_rgba(0,0,0,0.9)]"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050706] to-transparent" />

      {/* Dim behind a close-up; clicking it backs out */}
      <div ref={dim} className="invisible absolute inset-0 z-30 bg-[#030504]/80 opacity-0" onClick={() => closeFocus()} />

      {focus && isPart(focus) && (
        <PartViewer
          ref={viewer}
          initial={focus}
          poseOf={(id) => lab.current!.poseOf(id)}
          onClose={() => closeFocus()}
          onGo={(id) => closeFocus(id)}
        />
      )}
      {focus && !isPart(focus) && HOTSPOT_BY_ID[focus] && (
        <FocusSheet
          key={focus}
          id={focus}
          onClose={() => closeFocus()}
          onStopMusic={() => {
            setMusic(false);
            closeFocus();
          }}
        />
      )}

      {/* Inside: the way back out, zoom controls, and how to get around the first time */}
      {live && zoomed && (
        <>
          <button
            type="button"
            data-dock=""
            data-hud=""
            onClick={stepOutside}
            className="key key-sm absolute left-4 top-4 z-20 pr-7 motion-safe:animate-[lab-fade-in_0.5s_ease-out_0.3s_backwards] sm:left-5 sm:top-5"
          >
            <span aria-hidden>↙</span> step outside
            <span className="key-legend hidden sm:block">esc</span>
          </button>
          <div
            data-dock=""
            data-hud=""
            className="absolute bottom-5 right-4 z-20 flex items-center gap-2 motion-safe:animate-[lab-fade-in_0.5s_ease-out_0.4s_backwards] sm:bottom-6 sm:right-5"
          >
            {HUD_BUTTONS.filter((b) => b.act !== "full" || document.fullscreenEnabled).map((b) => (
              <button
                key={b.act}
                type="button"
                onClick={() => hudAction(b.act)}
                aria-label={b.label}
                title={b.label}
                className="key key-sm key-icon text-sm"
              >
                {b.icon}
                {b.act === "reset" && <span className="key-legend hidden sm:block">0</span>}
              </button>
            ))}
          </div>
          <p
            data-hud=""
            className={`pointer-events-none absolute inset-x-0 bottom-[4.25rem] z-20 text-center font-mono text-[11px] text-white/55 transition-opacity duration-700 sm:bottom-7 ${
              hudHint && !focus ? "opacity-100" : "opacity-0"
            }`}
          >
            {window.matchMedia(TOUCH_MQ).matches
              ? "drag to look around · pinch to zoom · tap anything"
              : "drag to look around · scroll to zoom · click anything"}
          </p>
        </>
      )}

      {/* The homelab's console: the whole screen as the start screen (and the
          login after logging out), then a drop-down from the top of the window
          (` or the dock) */}
      <div
        ref={termWrap}
        data-term=""
        className={`fixed inset-x-0 top-0 opacity-0 ${
          live
            ? "z-[55] h-[min(58svh,34rem)] border-b border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
            : "z-30 h-[100svh]"
        }`}
      >
        <LabTerminal
          ref={term}
          mode={mode}
          autoplay={phase === "intro" ? autoIntro : null}
          onBoot={handleBoot}
          onLogout={handleLogout}
          onClose={toggleTerm}
        />
      </div>

      {/* Lives outside the room so the music keeps playing back on the page */}
      {music && createPortal(<NowPlaying onStop={() => setMusic(false)} />, document.body)}

      {/* The way out of the start screen: skip the cinematic, or (when it isn't
          the opening, which ends on the page anyway) straight back to the page */}
      {(phase === "intro" || phase === "booting") && (
        <div className="absolute right-5 top-5 z-[60] flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.25em] sm:right-8 sm:top-7">
          {!opening && (
            <button type="button" onClick={() => setView("classic")} className="text-white/40 transition-colors hover:text-white/85">
              back to the page
            </button>
          )}
          <button type="button" onClick={skipIntro} className="text-white/40 transition-colors hover:text-white/85">
            skip intro →
          </button>
        </div>
      )}

      {/* Dock: the terminal lives here once you're in */}
      {live && (
        <div data-dock="" className="absolute bottom-5 left-4 z-20 motion-safe:animate-[lab-fade-in_0.6s_ease-out_0.4s_backwards] sm:bottom-6 sm:left-5">
          <button type="button" onClick={toggleTerm} aria-expanded={termOpen} className="key key-sm pr-6">
            <span className="text-white/50">›_</span> terminal
            <span className="key-legend hidden sm:block">`</span>
          </button>
        </div>
      )}
    </section>
  );
}
