"use client";

// What the record player plays: MF DOOM's official upload of "Doomsday"
// through YouTube's own embed (the song isn't hosted here). YouTube's terms
// want the player visible (at least 200×200) while it plays, so it lives in a
// small "now playing" card that stays put while you look around or scroll.
// The card keeps it at that minimum and turns the player's own controls off,
// so it reads as the record's cover art rather than a video player.

export const SONG = {
  /** "MF DOOM - Doomsday (feat. Pebbles The Invisible Girl) [Official Audio]", youtube.com/@MFDOOM */
  video: "LMeluRz2wv4",
  /** from the top: the hook opens the track */
  start: 0,
  title: "Doomsday",
  artist: "MF DOOM",
  album: "Operation: Doomsday",
};

export function NowPlaying({ onStop }: { onStop: () => void }) {
  const src = `https://www.youtube-nocookie.com/embed/${SONG.video}?start=${SONG.start}&autoplay=1&controls=0&fs=0&disablekb=1&iv_load_policy=3&rel=0&playsinline=1`;
  return (
    <div
      data-music-card=""
      // desktop: top-right, over bare wall (bottom-right is where the record player is);
      // phones: bottom-right, under the record in its close-up. While another close-up is
      // open it steps out of the way of that one's buttons (data-music-card in globals.css)
      className="fixed bottom-[4.5rem] right-4 z-50 w-fit rounded-xl border border-white/10 bg-[#0b0d0c]/95 p-2 shadow-[0_24px_70px_-16px_rgba(0,0,0,0.95)] motion-safe:animate-[lab-fade-in_0.35s_ease-out] sm:bottom-auto sm:right-5 sm:top-[4.5rem]"
    >
      <div className="flex items-center justify-between gap-2 pl-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
          <span className="text-putty">♪</span> now playing
        </p>
        <button type="button" onClick={onStop} className="key key-xs">
          ■ stop
        </button>
      </div>
      {/* 200×200 is the smallest the player is allowed to be */}
      <div className="mt-2 h-[200px] w-[200px] overflow-hidden rounded-md bg-black">
        <iframe
          src={src}
          title={`${SONG.artist}, ${SONG.title} (official audio)`}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      </div>
      <p className="mt-1.5 max-w-[200px] truncate px-1 text-[12px] leading-tight text-white/55">
        <span className="font-semibold text-white">{SONG.title}</span> · {SONG.artist}
      </p>
    </div>
  );
}
