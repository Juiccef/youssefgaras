"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { enterRoom, setDoor, type Box } from "@/components/lab/view";

// The room in the page's intro: a picture of the live room, floating in the
// sky beside the name. It leans toward the mouse, and pressing it is the way
// in: the live room takes over on the same spot and the camera goes inside
// (the door, lab/view.ts). Styles: .mini-room-* in globals.css. Other links
// into the room go through it too ([data-room-door], see Homelab.tsx).

// A picture, not the live room: re-shoot it when the room changes, under a
// new name (next/image keeps serving an old file under the same one). `pad`
// is the empty margin around the room in it, in the picture's own px.
const ROOM_STILL = { src: "/room/room-still-2026-10-04.webp", w: 1700, h: 1460, pad: 10 };
/** px the picture shifts against the mouse (nearer than the stars). */
const DEPTH = 18;

/** The room itself within a box the picture fills. */
const roomIn = (b: Box): Box => {
  const fx = ROOM_STILL.pad / ROOM_STILL.w;
  const fy = ROOM_STILL.pad / ROOM_STILL.h;
  return { x: b.x + b.w * fx, y: b.y + b.h * fy, w: b.w * (1 - 2 * fx), h: b.h * (1 - 2 * fy) };
};

export function HeroRoom() {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  // where the room sits at rest, with the page at the top: the way back out comes here
  const restBox = (): Box | null => {
    if (!wrap.current) return null;
    const box = wrap.current.getBoundingClientRect();
    return roomIn({ x: box.left, y: box.top + window.scrollY, w: box.width, h: (box.width * ROOM_STILL.h) / ROOM_STILL.w });
  };

  // the opening starts in the room and ends here, so it has to be able to find this spot
  useEffect(() => {
    setDoor(() => {
      const rest = restBox();
      return rest && { rest, depth: DEPTH };
    });
    return () => setDoor(null);
  }, []);

  const stepInside = () => {
    const rest = restBox();
    if (!rest || !img.current) return;
    // where the picture is on screen right now: floating, leaning, shifted by the mouse
    const now = img.current.getBoundingClientRect();
    enterRoom(roomIn({ x: now.left, y: now.top, w: now.width, h: now.height }), rest, DEPTH);
  };

  return (
    <div ref={wrap} data-sky-vars="" className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
      <div className="par" style={{ "--d": DEPTH, "--s": -0.04 } as CSSProperties}>
        <button type="button" data-room-door="" onClick={stepInside} aria-label="Step inside my room" className="mini-room group relative block w-full">
          <span aria-hidden className="mini-room-shadow" />
          <span className="mini-room-tilt block">
            <Image
              ref={img}
              src={ROOM_STILL.src}
              alt="My room: the homelab rack, the desk and the CRT"
              width={ROOM_STILL.w}
              height={ROOM_STILL.h}
              loading="eager"
              sizes="(max-width: 1024px) 92vw, 40rem"
              className="mini-room-float h-auto w-full"
            />
          </span>
          <span className="relative -mt-2 flex justify-center">
            <span className="key key-light">step inside →</span>
          </span>
        </button>
      </div>
    </div>
  );
}
