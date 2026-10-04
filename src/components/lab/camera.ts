// The room's "camera" is the viewBox shared by every scene layer. These
// helpers frame boxes, project world points to pixels, and build the matrix
// that makes a close-up look like it lifts off the object's face.

import { iso, type Pt } from "./iso";

export type View = { x: number; y: number; w: number; h: number };
export type Rect = { x: number; y: number; w: number; h: number };

/** A view where scene point (cx, cy) lands on pixel (px, py) of a ew×eh element, at s px per unit. */
export function viewAt(cx: number, cy: number, s: number, px: number, py: number, ew: number, eh: number): View {
  return { x: cx - px / s, y: cy - py / s, w: ew / s, h: eh / s };
}

/** The view that fits `box` (scene units) inside `region` (px of the element). */
export function frame(box: Rect, region: Rect, ew: number, eh: number): View {
  const s = Math.min(region.w / box.w, region.h / box.h);
  return viewAt(box.x + box.w / 2, box.y + box.h / 2, s, region.x + region.w / 2, region.y + region.h / 2, ew, eh);
}

/** Bounding box of an SVG `points` string. */
export function boundsOf(points: string): Rect {
  const n = points.trim().split(/[\s,]+/).map(Number);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < n.length; i += 2) {
    x0 = Math.min(x0, n[i]);
    x1 = Math.max(x1, n[i]);
    y0 = Math.min(y0, n[i + 1]);
    y1 = Math.max(y1, n[i + 1]);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** World point → px from the element's top-left (the view has the element's aspect ratio). */
export function project(p: Pt, v: View, ew: number): [number, number] {
  const [x, y] = iso(p[0], p[1], p[2] ?? 0);
  const s = ew / v.w;
  return [(x - v.x) * s, (y - v.y) * s];
}

export type Mat = [number, number, number, number, number, number];
export const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];

/**
 * Affine (transform-origin 0 0) that maps a w×h box onto the parallelogram
 * with corners p0 (top-left), p1 (top-right) and p2 (bottom-left).
 */
export function quadMatrix(p0: [number, number], p1: [number, number], p2: [number, number], w: number, h: number): Mat {
  return [(p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p2[0] - p0[0]) / h, (p2[1] - p0[1]) / h, p0[0], p0[1]];
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpMat = (a: Mat, b: Mat, t: number) => a.map((v, i) => lerp(v, b[i], t)) as Mat;
export const cssMatrix = (m: Mat) => `matrix(${m.map((n) => n.toFixed(5)).join(",")})`;
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
