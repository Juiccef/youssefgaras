"use client";

// The page and the room. There is one page, the scrolling one, and the room
// is a place on it: you step into it from its picture in the intro and back
// out again (the door, below), on every screen size. html[data-view] says
// which is showing: "classic" (the page; set on <html> in layout.tsx) or
// "room" (a first visit opens there, intro-gate.ts). globals.css shows one
// and hides the other, and React reads it back through useView().

import { useSyncExternalStore } from "react";

export type SiteView = "room" | "classic";

/** Fired on window when the view changes (read it back with currentView()). */
export const VIEW_EVENT = "yg:view";

/** Nav → room: open this object (a hotspot id), e.g. "monitor" for Projects. */
export const PICK_EVENT = "yg:pick";
/** Nav logo → room: back to the whole room. */
export const HOME_EVENT = "yg:home";

/** null if the page hasn't said (it always does: see layout.tsx). */
export function currentView(): SiteView | null {
  const v = document.documentElement.dataset.view;
  return v === "room" || v === "classic" ? v : null;
}

export function setView(v: SiteView) {
  const el = document.documentElement;
  if (el.dataset.view === v) return;
  el.dataset.view = v;
  // a fresh page either way: the room doesn't scroll, the page starts at the top
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

/** The room's picture on the page (HeroRoom) says where it sits at rest and how far it shifts against the mouse. */
let door: (() => { rest: Box; depth: number } | null) | null = null;
export function setDoor(find: typeof door) {
  door = find;
}

/**
 * A way out for a visit that didn't come in through the door (the opening
 * starts in the room). The page has to be laid out to be measured, so it is
 * shown for the length of this call: nothing paints in between.
 */
export function findWayOut() {
  const el = document.documentElement;
  const was = el.dataset.view;
  el.dataset.view = "classic";
  const found = door?.();
  el.dataset.view = was;
  if (found) exit = { box: found.rest, depth: found.depth, vw: window.innerWidth, vh: window.innerHeight };
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
