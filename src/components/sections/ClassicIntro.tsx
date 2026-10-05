import type { CSSProperties } from "react";
import { HeroRoom } from "./HeroRoom";

// The name as a block: two lines set to the same width, each letter its own
// box so they can be spread to that width and rise in one after another
// (.name-block in globals.css). `stretch` is the font's width axis.
const NAME = (() => {
  let i = 0;
  return [
    { word: "Youssef", stretch: "62%" },
    { word: "Garas", stretch: "83%" },
  ].map(({ word, stretch }) => ({ word, stretch, letters: Array.from(word).map((ch) => ({ ch, i: i++ })) }));
})();

// The top of the page: who I am and the two things most people came for,
// under the night sky, with my room floating beside them (under them on small
// screens). Scrolling goes on down the page; the room is the way inside.
export function ClassicIntro() {
  return (
    <section className="relative flex min-h-[86svh] items-center justify-center px-6 pb-20 pt-28">
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-x-8 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="mb-5 select-none font-mono text-xs text-white/45 md:text-[13px]">
            <span className="text-putty">guest@penguin</span>:~$ whoami
          </p>
          <h1 className="display name-block">
            <span className="sr-only">Youssef Garas</span>
            {NAME.map(({ word, stretch, letters }) => (
              <span key={word} aria-hidden className="name-line" style={{ fontStretch: stretch }}>
                {letters.map(({ ch, i }) => (
                  <span key={i} style={{ "--i": i } as CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="mt-6 font-mono text-[13px] text-white/70 md:text-base">Cybersecurity Engineer · AI Systems · Frontend Design</p>
          <p className="mt-5 max-w-xl leading-relaxed text-white/55">
            Georgia State Computer Science graduate (Cybersecurity), CCNA and Security+, and an endpoint intern at McKenney&apos;s.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
            <a href="#projects" className="key key-light">
              View projects ↓
            </a>
            <a href="#contact" className="key">
              Get in touch
            </a>
          </div>
        </div>
        <HeroRoom />
      </div>
    </section>
  );
}
