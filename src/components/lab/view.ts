"use client";

// Room or Classic: the two ways to see the site, switched from the nav.
// Room is the homelab hero on its own (no page scroll); Classic is the
// scrolling portfolio under the night sky. The choice is remembered per
// visitor. The inline gate (intro-gate.ts) sets html[data-view] before the
// first paint, globals.css shows one and hides the other, and React reads it
// back through useView().

import { useSyncExternalStore } from "react";
import { VIEW_KEY } from "./intro-gate";

export type SiteView = "room" | "classic";

/** Fired on window when the view changes (read it back with currentView()). */
export const VIEW_EVENT = "yg:view";

/** Nav → room: open this object (a hotspot id), e.g. "monitor" for Projects. */
export const PICK_EVENT = "yg:pick";
/** Nav logo → room: back to the whole room. */
export const HOME_EVENT = "yg:home";

/** null on pages without the switch (the live homepage). */
export function currentView(): SiteView | null {
  const v = document.documentElement.dataset.view;
  return v === "room" || v === "classic" ? v : null;
}

export function setView(v: SiteView) {
  const el = document.documentElement;
  if (el.dataset.view === v) return;
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {
    // storage blocked: still switch for this visit
  }
  el.dataset.view = v;
  // a fresh page either way: the room doesn't scroll, classic starts at the top
  history.scrollRestoration = v === "room" ? "manual" : "auto";
  window.scrollTo({ top: 0, behavior: "instant" });
  window.dispatchEvent(new Event(VIEW_EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(VIEW_EVENT, cb);
  return () => window.removeEventListener(VIEW_EVENT, cb);
}

export function useView(): SiteView | null {
  return useSyncExternalStore(subscribe, currentView, () => null);
}
