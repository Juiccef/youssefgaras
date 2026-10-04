"use client";

import { setView } from "@/components/lab/view";

// The top of classic view: who I am and the two things most people came
// for, under the night sky, with a way into the room.
export function ClassicIntro() {
  return (
    <section className="relative flex min-h-[86svh] flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
      <p className="mb-4 select-none font-mono text-xs text-white/45 md:text-[13px]">
        <span className="text-putty">guest@penguin</span>:~$ whoami
      </p>
      <h1 className="text-[44px] font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
        Youssef Garas
      </h1>
      <p className="mt-5 font-mono text-[13px] text-white/70 md:text-base">Cybersecurity Engineer · AI Systems · Network Defense</p>
      <p className="mt-5 max-w-xl leading-relaxed text-white/55">
        Georgia State Computer Science graduate (Cybersecurity), CCNA and Security+, and an endpoint intern at McKenney&apos;s.
        I build systems that are smart and hard to break.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <a href="#projects" className="key key-light">
          View projects ↓
        </a>
        <a href="#contact" className="key">
          Get in touch
        </a>
      </div>
      <button
        type="button"
        onClick={() => setView("room")}
        className="mt-12 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/80"
      >
        or step into my room →
      </button>
    </section>
  );
}
