"use client";

// The page and the room. On a phone they are two views, switched from the
// nav and remembered: Room is the homelab on its own (no page scroll),
// Classic is the scrolling portfolio under the night sky. On anything bigger
// there is one page, the scrolling one, and the room is a place on it: you
// step into it from its picture in the intro and back out again (the door,
// below). Either way html[data-view] says which is showing. The inline gate
// (intro-gate.ts) sets it, and html[data-phone], before the first paint;
// globals.css shows one and hides the other; React reads them back through
// useView() and usePhone().

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

// ── Phone or not ─────────────────────────────────────────────────────────

/** A phone keeps the two views and the switch between them; anything bigger has the one page. */
export const isPhone = () => document.documentElement.hasAttribute("data-phone");

// set once by the gate, before React: nothing to subscribe to
const never = () => () => {};

export function usePhone(): boolean {
  return useSyncExternalStore(never, isPhone, () => false);
}

// ── The door: from the page into the room and back ───────────────────────

/** A box on screen: px from the top left of the window. */
export type Box = { x: number; y: number; w: number; h: number };

let entry: Box | null = null;
let exit: { box: Box; depth: number; vw: number; vh: number } | null = null;

/**
 * Step inside from the page. `from` is where the room is on screen in its
 * picture right now, so the live room can take over on the same spot. `rest`
 * is where it sits with the page at the top and the mouse dead centre, and
 * `depth` how many px it shifts against the mouse: both for the way back out.
 */
export function enterRoom(from: Box, rest: Box, depth: number) {
  entry = from;
  exit = { box: rest, depth, vw: window.innerWidth, vh: window.innerHeight };
  // the page's opening moves (the name rising in) are for arriving, not for coming back out
  document.documentElement.dataset.beenInside = "";
  setView("room");
  entry = null;
}

/** The room, as it becomes the view: did someone just come in through the door? */
export function takeEntry(): Box | null {
  const e = entry;
  entry = null;
  return e;
}

/**
 * Where the room's picture is on the page (scrolled to the top), for the walk
 * back out. Null when that can't be known: nobody came in through the door,
 * or the window has changed size since.
 */
export function wayOut(): Box | null {
  if (!exit || exit.vw !== window.innerWidth || exit.vh !== window.innerHeight) return null;
  // the picture shifts against the mouse like the rest of the sky (SkyMotion)
  const vars = document.querySelector<HTMLElement>("[data-sky-vars]")?.style;
  const px = parseFloat(vars?.getPropertyValue("--px") ?? "") || 0;
  const py = parseFloat(vars?.getPropertyValue("--py") ?? "") || 0;
  const { box, depth } = exit;
  return { x: box.x - px * depth, y: box.y - py * depth, w: box.w, h: box.h };
}
