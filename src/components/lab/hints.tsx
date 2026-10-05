// Telling visitors the room is clickable without getting in the way:
//
// - markers: small putty dots on the main objects that slowly breathe, until
//   the visitor opens their first object (then never again, see HINTS_KEY)
// - tips: a label over whatever the mouse (or keyboard focus) is on, saying
//   what it opens. On touch, it shows when a tap zooms in on something small.
//   The record player has none.
//
// Both live in the scene's camera; LabHero keeps them a constant size on
// screen while it zooms.

import { HOTSPOT_BY_ID, INITIAL_VIEWBOX } from "./LabScene";
import { boundsOf } from "./camera";
import { iso } from "./iso";

/** localStorage: set once the visitor has opened something, so the markers stop. */
export const HINTS_KEY = "yg-lab-hints";

/** What each object opens. */
export const TIPS: Record<string, string> = {
  monitor: "Projects",
  resume: "Resume",
  badge: "Experience",
  phone: "Contact",
  camera: "Photography",
  print: "Photo print",
  map: "Network map",
  poster: "Hasbulla",
  "cert-ccna": "CCNA",
  "cert-secplus": "Security+",
  "cert-gux": "Google UX Design",
  "cert-codepath": "CodePath",
  rack: "The rack",
  patch: "Patch panel",
  switch: "TL-SG108E switch",
  p340: "ThinkStation P340 Tiny",
  ssd: "2 TB SSD",
  pdu: "PDU",
};

/** The hover label for an object, or null when it has none (a `quiet` hotspot, like the record player). */
export const tipFor = (id: string) => (HOTSPOT_BY_ID[id]?.quiet ? null : TIPS[id] ?? HOTSPOT_BY_ID[id]?.label ?? id);

/** The objects that get a marker: one per kind of thing, not every hotspot. */
const MARKED = ["monitor", "resume", "camera", "record", "rack", "map", "cert-secplus", "print"];

/** A marker sits in the middle of the object's face (or of its outline when it has none). */
const centreOf = (id: string): [number, number] => {
  const h = HOTSPOT_BY_ID[id];
  if (h.face) {
    // the face's top-right and bottom-left corners are opposite, so their midpoint is its centre
    const [, b, c] = h.face;
    const mid = (i: number) => ((b[i] ?? 0) + (c[i] ?? 0)) / 2;
    return iso(mid(0), mid(1), mid(2)) as [number, number];
  }
  const r = boundsOf(h.points);
  return [r.x + r.w / 2, r.y + r.h / 2];
};

const MARKERS = MARKED.filter((id) => HOTSPOT_BY_ID[id]).map((id) => ({ id, at: centreOf(id) }));

export function LabMarkers({ show }: { show: boolean }) {
  return (
    <svg
      data-cam=""
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}
      viewBox={INITIAL_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {MARKERS.map((m, i) => (
        <g key={m.id} transform={`translate(${m.at[0].toFixed(1)} ${m.at[1].toFixed(1)})`}>
          {/* data-mk: scaled by LabHero so the marker stays the same size on screen */}
          <g data-mk="" style={{ animationDelay: `${(i * 0.43).toFixed(2)}s` }} className="lab-mk">
            {/* a dark backing so it reads on the paper and the CRT as well as on the dark wood */}
            <circle r={6.5} className="lab-mk-ring" />
            <circle r={6.5} className="lab-mk-back" />
            <circle r={2.6} className="lab-mk-dot" />
          </g>
        </g>
      ))}
    </svg>
  );
}
