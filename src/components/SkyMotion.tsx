"use client";

import { useEffect } from "react";

// Makes the night sky answer to the visitor. Where the mouse is and how far
// the page has scrolled go into CSS variables (--px, --py, --sy) on every
// [data-sky-vars] element, and the layers under them turn those into shifts
// at their own depth (.par in globals.css). The mouse position is eased, so
// the sky floats after it instead of snapping. Phones have no mouse: there
// the layers move as the page scrolls. Renders nothing.
export function SkyMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // mouse, -1…1 from the middle of the window: where it is and where the sky has got to
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      raf = 0;
      // ease toward the mouse at the same pace whatever the screen's refresh rate
      const k = 1 - Math.exp(-(last ? Math.min(now - last, 64) : 16) / 160);
      last = now;
      x += (tx - x) * k;
      y += (ty - y) * k;
      const settled = Math.abs(tx - x) < 0.002 && Math.abs(ty - y) < 0.002;
      if (settled) {
        x = tx;
        y = ty;
        last = 0;
      }
      const px = x.toFixed(4);
      const py = y.toFixed(4);
      const sy = window.scrollY.toFixed(1);
      // looked up each time: some of these layers come and go
      for (const el of document.querySelectorAll<HTMLElement>("[data-sky-vars]")) {
        el.style.setProperty("--px", px);
        el.style.setProperty("--py", py);
        el.style.setProperty("--sy", sy);
      }
      if (!settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    // the mouse left the window: let the sky drift back to rest
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = 0;
      ty = 0;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", kick);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
