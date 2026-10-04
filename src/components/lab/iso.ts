// Isometric helpers for the homelab scene.
//
// World space: x runs right-down, y runs left-down, z is up. Everything is
// projected into one fixed 1600×900 SVG viewBox, so static art and animated
// lights (two separate <svg> layers) line up exactly.

export const COS = Math.cos(Math.PI / 6);
export const SIN = 0.5;
export const VIEW = { w: 1600, h: 900 };

/** World → screen zoom. Face transforms and packets all inherit it. */
export const K = 1.32;
const OX = 800;
const OY = 40;

export type Pt = [number, number, number?];

export function iso(x: number, y: number, z = 0): [number, number] {
  return [OX + (x - y) * COS * K, OY + ((x + y) * SIN - z) * K];
}

const f = (n: number) => Math.round(n * 100) / 100;

export function pts(list: Pt[]) {
  return list.map(([x, y, z]) => iso(x, y, z ?? 0).map(f).join(",")).join(" ");
}

export function pathD(list: Pt[]) {
  return list
    .map(([x, y, z], i) => {
      const [sx, sy] = iso(x, y, z ?? 0);
      return `${i ? "L" : "M"}${f(sx)} ${f(sy)}`;
    })
    .join(" ");
}

export function screenLength(list: Pt[]) {
  let len = 0;
  for (let i = 1; i < list.length; i++) {
    const [ax, ay] = iso(list[i - 1][0], list[i - 1][1], list[i - 1][2] ?? 0);
    const [bx, by] = iso(list[i][0], list[i][1], list[i][2] ?? 0);
    len += Math.hypot(bx - ax, by - ay);
  }
  return len;
}

// Face transforms: draw ordinary 2D content (u → right, v → down) and it
// lands on the matching face of a box, correctly skewed.

/** Plane x = X (the face that points right-down). Origin = its top-left corner on screen. */
export function faceRight(X: number, yMax: number, zTop: number) {
  const [ox, oy] = iso(X, yMax, zTop);
  return `matrix(${f(COS * K)} ${f(-SIN * K)} 0 ${K} ${f(ox)} ${f(oy)})`;
}

/** Plane y = Y (the face that points left-down). Origin = its top-left corner on screen. */
export function faceLeft(xMin: number, Y: number, zTop: number) {
  const [ox, oy] = iso(xMin, Y, zTop);
  return `matrix(${f(COS * K)} ${f(SIN * K)} 0 ${K} ${f(ox)} ${f(oy)})`;
}

/** Plane z = Z. u runs along +x, v along +y. */
export function faceTop(xMin: number, yMin: number, Z: number) {
  const [ox, oy] = iso(xMin, yMin, Z);
  return `matrix(${f(COS * K)} ${f(SIN * K)} ${f(-COS * K)} ${f(SIN * K)} ${f(ox)} ${f(oy)})`;
}

/** Deterministic PRNG so server and client render identical LED timings. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Face-local (u, v) → world point, for hit areas and anchors that must line
// up with art drawn through faceLeft / faceRight.
export const onLeft = (xMin: number, Y: number, zTop: number) => (u: number, v: number): Pt => [xMin + u, Y, zTop - v];
export const onRight = (X: number, yMax: number, zTop: number) => (u: number, v: number): Pt => [X, yMax - u, zTop - v];

export function faceRect(map: (u: number, v: number) => Pt, u0: number, v0: number, u1: number, v1: number) {
  return pts([map(u0, v0), map(u1, v0), map(u1, v1), map(u0, v1)]);
}
