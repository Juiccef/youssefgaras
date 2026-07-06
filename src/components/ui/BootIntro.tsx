"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "yg-boot";
const CMD = "ssh guest@youssefgaras.dev";

const BOOT_LINES = [
  { tag: "[ ok ]", tagCls: "text-emerald-400", text: "establishing encrypted session — TLS 1.3" },
  { tag: "[ ok ]", tagCls: "text-emerald-400", text: "credential check: CCNA ✓  (valid → 2029)" },
  { tag: "[ ok ]", tagCls: "text-emerald-400", text: "loading /projects (4)  /websites (1)  /experience (3)" },
  { tag: "[ ok ]", tagCls: "text-emerald-400", text: "mounting /about  /photography  /contact" },
  { tag: "[ ok ]", tagCls: "text-emerald-400", text: "spinning up WebGL renderer" },
  { tag: "[ sec ]", tagCls: "text-teal-300", text: "intrusion countermeasures: active" },
] as const;

/**
 * First-visit cinematic boot screen. Auto-plays a ~5.5s terminal boot
 * sequence, then collapses CRT-style into the site. Any key / tap / the
 * skip button fast-forwards. Remembered in localStorage; users with
 * prefers-reduced-motion never see it. A pre-hydration script in
 * layout.tsx sets html[data-boot="seen"] so repeat visitors get zero
 * flash before React loads.
 */
export function BootIntro() {
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);
  const [granted, setGranted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    const seen = (() => {
      try {
        return !!localStorage.getItem(STORAGE_KEY);
      } catch {
        return true; // storage blocked — never risk trapping the visitor
      }
    })();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reducedMotion) {
      // The overlay is already display:none via html[data-boot="seen"]
      // (set pre-hydration in layout.tsx); re-assert it here in case
      // that inline script was stripped.
      document.documentElement.dataset.boot = "seen";
      return;
    }

    document.body.style.overflow = "hidden";

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, at: number) => {
      timers.push(setTimeout(fn, at));
    };

    const startExit = () => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      setExiting(true);
      setTimeout(() => {
        document.body.style.overflow = "";
        setHidden(true);
      }, 540);
    };

    // ── Timeline ──────────────────────────────────────────────
    let t = 450;
    for (let i = 1; i <= CMD.length; i++) {
      schedule(() => setTyped(i), t);
      t += 28;
    }
    t += 420;
    BOOT_LINES.forEach((_, j) => {
      schedule(() => setShown(j + 1), t);
      t += 340;
    });
    t += 220;
    schedule(() => setGranted(true), t);
    t += 1200;
    schedule(startExit, t);

    // ── Skip: any key, tap, or click ──────────────────────────
    const onKey = () => startExit();
    const onPointer = () => startExit();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      document.body.style.overflow = "";
    };
  }, []);

  if (hidden) return null;

  const totalSteps = BOOT_LINES.length + 1;
  const progress = Math.round(((shown + (granted ? 1 : 0)) / totalSteps) * 100);

  return (
    <div
      id="boot-intro"
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#050605] px-4 ${
        exiting ? "motion-safe:animate-[crt-off_0.52s_ease-in_forwards]" : ""
      }`}
    >
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />

      {/* Terminal window */}
      <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-[#0a0d0c]/95 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 h-9 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          <p className="flex-1 text-center text-[11px] font-mono text-white/50 select-none pr-12">
            youssef@portfolio — boot
          </p>
        </div>

        <div className="px-5 py-5 font-mono text-[12px] sm:text-[13px] leading-[1.9] min-h-[260px]">
          <p>
            <span className="text-emerald-400">guest@init</span>
            <span className="text-white/40">:</span>
            <span className="text-teal-300">~</span>
            <span className="text-white/60">$ </span>
            <span className="text-white/90">{CMD.slice(0, typed)}</span>
            {typed < CMD.length && (
              <span className="inline-block w-[7px] h-[15px] align-middle bg-emerald-400 motion-safe:animate-[boot-caret_1s_steps(1)_infinite]" />
            )}
          </p>

          {BOOT_LINES.slice(0, shown).map((line) => (
            <p key={line.text} className="text-white/70">
              <span className={line.tagCls}>{line.tag}</span> {line.text}
            </p>
          ))}

          {granted && (
            <p className="mt-2 text-emerald-300">
              &gt; access granted — welcome, guest.
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.05]">
          <div
            className="h-full bg-emerald-400/80 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Skip hint */}
      <button
        type="button"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/35 hover:text-white/70 transition-colors"
      >
        press any key · tap to skip ▸
      </button>
    </div>
  );
}
