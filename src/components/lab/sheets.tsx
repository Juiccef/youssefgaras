"use client";

// Close-ups for the objects in the room. Each one renders the object itself
// ([data-lift] — LabHero animates it off the object's face in the scene) and
// a row of controls under it ([data-chrome]).

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import {
  CERTS,
  EXPERIENCE,
  HOMELAB,
  INSTAGRAM_URL,
  PHOTOS,
  PROJECTS,
  RESUME_IMAGE,
  RESUME_URL,
  ROOM_POSTER,
  SITES,
  SOCIALS,
} from "@/lib/content";
import { SONG } from "./music";
import { toSection as jump } from "./view";

export const SHEET_IDS = ["monitor", "resume", "badge", "phone", "camera", "cert-ccna", "cert-secplus", "cert-gux", "cert-codepath", "print", "map", "record", "poster"];
export const isSheet = (id: string | null | undefined): id is string => !!id && SHEET_IDS.includes(id);

// ─── Shared chrome ───────────────────────────────────────────────────────

// keycaps (globals.css): dark for secondary actions, putty for the main one
const btn = "key key-sm";
const primary = "key key-sm key-light";

function Ext({ href, children, className = btn, download }: { href: string; children: ReactNode; className?: string; download?: string }) {
  const external = !href.startsWith("/") && !href.startsWith("mailto");
  return (
    <a href={href} download={download} target={external || href.endsWith(".pdf") ? "_blank" : undefined} rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function Layer({
  children,
  actions,
  onClose,
  caption,
  closeLabel = "close",
  topOnPhones = false,
}: {
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  caption?: string;
  closeLabel?: string;
  /** Phones: sit at the top, leaving the bottom for the now-playing card. */
  topOnPhones?: boolean;
}) {
  return (
    <div
      data-focus-layer=""
      className={`pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-3 pb-5 pt-14 sm:pt-16 ${
        topOnPhones ? "max-sm:justify-start max-sm:pt-20" : ""
      }`}
    >
      <div data-lift="" className="pointer-events-auto origin-top-left opacity-0">
        {children}
      </div>
      <div data-chrome="" className="pointer-events-auto invisible flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-3 opacity-0">
        {caption && <span className={`mr-1 font-mono text-[11px] text-white/45 ${topOnPhones ? "max-sm:hidden" : ""}`}>{caption}</span>}
        {actions}
        <button type="button" onClick={onClose} className={`${btn} sm:pr-7`}>
          ✕ {closeLabel} <span className="key-legend hidden sm:block">esc</span>
        </button>
      </div>
    </div>
  );
}

/** ←/→ (or ↑/↓) handlers while a close-up is open. */
function useArrows(onPrev: () => void, onNext: () => void, vertical = false) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const prev = vertical ? "ArrowUp" : "ArrowLeft";
      const next = vertical ? "ArrowDown" : "ArrowRight";
      if (e.key === prev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === next) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext, vertical]);
}

// ─── CRT: projects ───────────────────────────────────────────────────────

const DOS_NAMES: Record<string, string> = {
  "Facial Recognition Door Lock": "DOORLOCK.PY",
  "GSU Panther Chatbot": "PANTHER.JS",
  "Intelligent Word Prediction Bot": "WORDBOT.PY",
  "UFC RSVP Page": "UFCRSVP.HTM",
  "Peach Parking Solutions": "PEACHPRK.WWW",
  "AROMA Roastery & Confectionery": "AROMA.WWW",
};
const dosName = (name: string) => DOS_NAMES[name] ?? `${name.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}.EXE`;

const FILES = [
  ...PROJECTS.map((p) => ({ name: p.name, text: p.description, tags: p.stack, href: p.link, preview: p.preview, client: false })),
  ...SITES.map((s) => ({ name: s.name, text: s.description, tags: s.tags, href: s.url, preview: s.preview as string | null, client: true })),
];

function CrtSheet({ onClose }: { onClose: () => void }) {
  const [sel, setSel] = useState(0);
  const f = FILES[sel];
  const prev = () => setSel((i) => (i - 1 + FILES.length) % FILES.length);
  const next = () => setSel((i) => (i + 1) % FILES.length);
  useArrows(prev, next, true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target as HTMLElement)?.closest("button, a")) window.open(FILES[sel].href, "_blank", "noopener");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  return (
    <Layer
      onClose={onClose}
      actions={
        <>
          <Ext href={f.href} className={primary}>
            Open {f.name} ↗
          </Ext>
          <button type="button" onClick={() => jump("projects")} className={btn}>
            classic view ↓
          </button>
        </>
      }
    >
      {/* putty bezel */}
      <div className="w-[min(58rem,calc(100vw-1.5rem),calc((100svh-11rem)*1.28))] rounded-[26px] bg-[linear-gradient(180deg,#ddd4bd,#b9ae95)] p-3 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95),inset_0_2px_0_rgba(255,255,255,0.5)] sm:rounded-[34px] sm:p-6">
        <div className="relative overflow-hidden rounded-[18px] bg-[#130b02] shadow-[inset_0_0_0_3px_#1d1a14,inset_0_0_90px_rgba(0,0,0,0.9)] max-sm:h-[62svh] sm:aspect-[4/3] sm:rounded-[26px]">
          <div className="absolute inset-0 flex flex-col overflow-hidden p-4 font-mono text-[12px] text-[#ffb347] [text-shadow:0_0_6px_rgba(255,179,71,0.45)] sm:p-7 sm:text-[13px]">
            <div className="flex items-center justify-between border-b border-[#ffb347]/30 pb-2">
              <span>YG-DOS 6.22 · C:\PROJECTS</span>
              <span className="text-[#ffb347]/60">{FILES.length} file(s)</span>
            </div>
            <div className="mt-3 grid min-h-0 flex-1 gap-4 sm:grid-cols-[15rem_1fr]">
              <ul className="space-y-0.5 max-sm:max-h-[8.5rem] max-sm:overflow-y-auto">
                {FILES.map((file, i) => (
                  <li key={file.name}>
                    {file.client && FILES[i - 1] && !FILES[i - 1].client && <p className="mb-1 mt-2 text-[#ffb347]/50">── client work ──</p>}
                    <button
                      type="button"
                      onClick={() => setSel(i)}
                      className={`w-full px-1.5 py-0.5 text-left ${i === sel ? "bg-[#ffb347] text-[#130b02] [text-shadow:none]" : "hover:bg-[#ffb347]/10"}`}
                    >
                      {i === sel ? "▸ " : "  "}
                      {dosName(file.name)}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="min-h-0 overflow-y-auto pr-1 [scrollbar-color:rgba(255,179,71,0.3)_transparent] [scrollbar-width:thin]">
                {f.preview && (
                  <div className="relative mb-3 aspect-[16/9] overflow-hidden border border-[#ffb347]/30">
                    <Image src={f.preview} alt={`${f.name} preview`} fill sizes="36rem" className="object-cover object-top opacity-90" />
                  </div>
                )}
                <p className="text-[14px] font-bold uppercase tracking-wide sm:text-[15px]">{f.name}</p>
                <p className="mt-2 leading-relaxed text-[#ffcf8a]/85">{f.text}</p>
                <p className="mt-3 text-[#ffb347]/65">{f.tags.map((t) => `[${t}]`).join(" ")}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between border-t border-[#ffb347]/30 pt-2 text-[#ffb347]/55">
              <span>↑↓ select · ⏎ open</span>
              <span>
                C:\&gt;<span className="motion-safe:animate-[lab-caret_1s_steps(1)_infinite]">█</span>
              </span>
            </div>
          </div>
          {/* scanlines + glass */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.28)_0px,rgba(0,0,0,0.28)_1px,transparent_1px,transparent_3px)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.07),transparent_55%)]" />
        </div>
        <div className="mt-2 flex items-center justify-between px-1 sm:mt-4">
          <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#5b5546]">YG-386</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
            <span className="h-3 w-6 rounded-sm bg-[#a39a83] shadow-[inset_0_-1px_0_rgba(0,0,0,0.25)]" />
          </span>
        </div>
      </div>
    </Layer>
  );
}

// ─── Resume ──────────────────────────────────────────────────────────────

function ResumeSheet({ onClose }: { onClose: () => void }) {
  return (
    <Layer
      onClose={onClose}
      actions={
        <>
          <Ext href={RESUME_URL} className={primary}>
            Open PDF ↗
          </Ext>
          <Ext href={RESUME_URL} download="Youssef-Garas-Resume.pdf">
            Download
          </Ext>
        </>
      }
    >
      <div className="relative aspect-[17/22] w-[min(46rem,calc(100vw-1.5rem),calc((100svh-9.5rem)*0.7727))] bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)]">
        <Image src={RESUME_IMAGE} alt="Youssef Garas, resume" fill sizes="(max-width: 768px) 100vw, 46rem" className="object-contain" />
      </div>
    </Layer>
  );
}

// ─── Work badge: experience ─────────────────────────────────────────────

const BADGES = [
  { band: "#1e3a8a", org: "McKENNEY'S", tab: "McKenney's" },
  { band: "#9f1239", org: "LEADING THE WAY · ON AIR", tab: "Leading the Way" },
  { band: "#0039a6", org: "GEORGIA STATE UNIVERSITY", tab: "Georgia State" },
];

function BadgeSheet({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const e = EXPERIENCE[i];
  const b = BADGES[i] ?? BADGES[0];
  useArrows(
    () => setI((n) => (n - 1 + EXPERIENCE.length) % EXPERIENCE.length),
    () => setI((n) => (n + 1) % EXPERIENCE.length),
  );
  return (
    <Layer
      onClose={onClose}
      actions={EXPERIENCE.map((x, n) => (
        <button
          key={x.company}
          type="button"
          onClick={() => setI(n)}
          aria-pressed={n === i}
          className={n === i ? primary : btn}
        >
          {BADGES[n]?.tab ?? x.company}
        </button>
      ))}
    >
      {/* The card is as tall as its text, which is more than a phone has room for: past that it
          scrolls, so the buttons under it (close among them) stay on screen */}
      <div className="max-h-[calc(100svh-11.5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-[#f1f5f9] text-slate-900 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] [scrollbar-color:rgba(100,116,139,0.45)_transparent] [scrollbar-width:thin] sm:max-h-[calc(100svh-8.75rem)]">
        <div className="flex justify-center bg-[#e2e8f0] py-2">
          <span className="h-2 w-14 rounded-full bg-[#94a3b8]/70" />
        </div>
        <div className="px-5 py-3 text-white transition-colors" style={{ background: b.band }}>
          <p className="font-mono text-[10px] tracking-[0.28em]">{b.org}</p>
          <p className="mt-0.5 text-[11px] opacity-75">{e.type}</p>
        </div>
        <div className="flex gap-4 px-5 pt-4">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-slate-300">
            <Image src="/me.jpg" alt="Youssef Garas" fill sizes="5rem" className="object-cover object-[50%_32%]" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-wide">YOUSSEF GARAS</p>
            <p className="mt-1 text-sm font-medium leading-snug">{e.role}</p>
            <p className="mt-1 text-xs text-slate-500">
              {e.company} · {e.location}
            </p>
            <p className="mt-1 font-mono text-[11px] text-slate-600">{e.period}</p>
          </div>
        </div>
        <ul className="space-y-2 px-5 py-4 text-[13px] leading-relaxed text-slate-700">
          {e.bullets.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="text-slate-400">›</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
        <div className="mx-5 mb-5 h-8 bg-[repeating-linear-gradient(90deg,#0f172a_0_2px,transparent_2px_4px,#0f172a_4px_5px,transparent_5px_8px,#0f172a_8px_11px,transparent_11px_13px)] opacity-80" />
      </div>
    </Layer>
  );
}

// ─── Phone: contact ─────────────────────────────────────────────────────

const ICON: Record<string, string> = { email: "✉", linkedin: "in", github: "gh", instagram: "◎" };

function PhoneSheet({ onClose }: { onClose: () => void }) {
  const email = SOCIALS.find((s) => s.key === "email");
  return (
    <Layer onClose={onClose}>
      <div className="relative aspect-[9/19] h-[min(38rem,calc(100svh-9rem))] overflow-hidden rounded-[2.6rem] border-[9px] border-[#0b0c0d] bg-[radial-gradient(ellipse_at_top,#1b2a44,#0b1020_60%)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
        <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-white/85">
          <span>9:41</span>
          <span className="tracking-widest">▮▮▮</span>
        </div>
        <div className="flex h-full flex-col px-5 pb-10 pt-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/15">
              <Image src="/me.jpg" alt="" fill sizes="4rem" className="object-cover object-[50%_30%]" />
            </div>
            <p className="mt-3 text-[17px] font-semibold text-white">Youssef Garas</p>
            <p className="mt-1 text-[12px] leading-snug text-white/55">Open to security and software roles. Email is the fastest way to reach me.</p>
          </div>
          <div className="mt-5 divide-y divide-white/[0.07] overflow-hidden rounded-2xl bg-white/[0.06]">
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-white/[0.05]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-[11px] text-white/80">{ICON[s.key] ?? "•"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-white">{s.label}</span>
                  <span className="block truncate text-[11px] text-white/45">{s.handle}</span>
                </span>
                <span className="text-white/30">›</span>
              </a>
            ))}
          </div>
          {email && (
            <a href={email.href} className="key key-light mt-auto w-full rounded-full text-[14px]">
              Email me
            </a>
          )}
        </div>
      </div>
    </Layer>
  );
}

// ─── Canon M50, from the back: the photos on its screen → Instagram ─────

function CameraSheet({ onClose }: { onClose: () => void }) {
  return (
    <Layer
      onClose={onClose}
      actions={
        <>
          <Ext href={INSTAGRAM_URL} className={primary}>
            Open @y.gpics on Instagram ↗
          </Ext>
          <button type="button" onClick={() => jump("photography")} className={btn}>
            full gallery ↓
          </button>
        </>
      }
    >
      <div className="relative mt-6 w-[min(40rem,calc(100vw-1.5rem))] rounded-[22px] bg-[linear-gradient(180deg,#2a2d31,#141619)] p-[4%] pr-[26%] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* EVF hump */}
        <div className="absolute -top-6 left-[30%] h-8 w-[22%] rounded-t-2xl bg-[#1f2226]">
          <div className="mx-auto mt-1.5 h-4 w-[70%] rounded-lg bg-[#0b0c0e]" />
        </div>
        {/* LCD */}
        <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-black ring-2 ring-black">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex flex-col p-2 sm:p-3" aria-label="Open @y.gpics on Instagram">
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-pink-500/70 sm:h-9 sm:w-9">
                <Image src="/me.jpg" alt="" fill sizes="2.25rem" className="object-cover object-[50%_30%]" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[12px] font-semibold text-white sm:text-[13px]">y.gpics</p>
                <p className="truncate text-[10px] text-white/55 sm:text-[11px]">photography · shot on this M50</p>
              </div>
              <span className="rounded-md bg-[#0095f6] px-2.5 py-1 text-[10px] font-semibold text-white sm:text-[11px]">Follow</span>
            </div>
            <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 gap-0.5">
              {PHOTOS.slice(0, 6).map((src) => (
                <div key={src} className="relative overflow-hidden">
                  <Image src={src} alt="" fill sizes="8rem" className="object-cover" />
                </div>
              ))}
            </div>
          </a>
        </div>
        {/* controls */}
        <div className="absolute right-[5%] top-[14%] flex w-[16%] flex-col items-center gap-3">
          <span className="aspect-square w-[70%] rounded-full bg-[#0f1113] shadow-[inset_0_0_0_3px_#2b2f33]" />
          <span className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2b2f33]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2b2f33]" />
          </span>
          <span className="font-mono text-[9px] tracking-widest text-white/40">▶ MENU</span>
          <span className="h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
        </div>
        <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-white/35">Canon EOS M50</p>
      </div>
    </Layer>
  );
}

// ─── Framed certificates ─────────────────────────────────────────────────

const BRAND: Record<string, ReactNode> = {
  codepath: <span className="font-bold tracking-tight text-[#1f2d3d]">CodePath</span>,
  secplus: <span className="font-bold text-[#c8102e]">CompTIA</span>,
  gux: (
    <span className="font-semibold">
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#ea4335]">o</span>
      <span className="text-[#fbbc05]">o</span>
      <span className="text-[#4285f4]">g</span>
      <span className="text-[#34a853]">l</span>
      <span className="text-[#ea4335]">e</span>
    </span>
  ),
};

function CertSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const c = CERTS.find((x) => `cert-${x.id}` === id)!;
  const hasImage = "thumb" in c;
  return (
    <Layer
      onClose={onClose}
      caption={`${c.issuer} · ${c.note}`}
      actions={
        "verify" in c ? (
          <>
            <Ext href={c.verify.url} className={primary}>
              Verify at {c.issuer} ↗
            </Ext>
            <span className="max-w-[16rem] break-all font-mono text-[10px] text-white/45">code {c.verify.code}</span>
            <Ext href={c.file}>Open PDF ↗</Ext>
          </>
        ) : undefined
      }
    >
      <div className="bg-[#0c0d0e] p-2.5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] sm:p-3.5">
        <div className="bg-[#e9e6de] p-3 sm:p-5">
          {hasImage ? (
            <Image
              src={c.thumb}
              alt={`${c.full} certificate`}
              width={1200}
              height={927}
              className="block h-auto w-[min(46rem,calc(100vw-4.5rem),calc((100svh-13rem)*1.294))]"
            />
          ) : (
            <div className="flex aspect-[1.294] w-[min(40rem,calc(100vw-4.5rem),calc((100svh-13rem)*1.294))] flex-col items-center justify-center border border-[#cfcabd] px-6 text-center text-slate-800">
              <p className="text-2xl sm:text-3xl">{BRAND[c.id]}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">certified</p>
              <p className="mt-2 text-xl font-semibold sm:text-3xl">{c.full}</p>
              <p className="mt-4 text-sm text-slate-600">Youssef Garas</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">{c.note}</p>
            </div>
          )}
        </div>
      </div>
    </Layer>
  );
}

// ─── The record, filling the screen while the song plays ────────────────

/**
 * The record lifted off the turntable. [data-spin] turns at 33⅓ rpm like the
 * one in the room (LabHero syncs its phase so the handoff is seamless); the
 * light reflections are a separate layer that stays still over it.
 */
function RecordSheet({ onClose, onStop }: { onClose: () => void; onStop?: () => void }) {
  return (
    <Layer
      onClose={onClose}
      closeLabel="back to the room"
      topOnPhones
      caption={`${SONG.artist} · ${SONG.title}`}
      actions={
        onStop && (
          <button type="button" onClick={onStop} className={btn}>
            ■ stop the music
          </button>
        )
      }
    >
      <div className="relative aspect-square w-[min(72vw,calc(100svh-30rem))] rounded-full shadow-[0_50px_140px_-30px_rgba(0,0,0,1),0_0_120px_-20px_rgba(201,206,211,0.14)] sm:w-[min(86vw,calc(100svh-9.5rem))]">
        <div
          data-spin=""
          className="lab-disc-spin absolute inset-0 rounded-full"
          style={{ background: "repeating-radial-gradient(circle at 50% 50%, #0c0c0d 0px, #0c0c0d 1.3px, #161618 1.3px, #161618 2.6px)" }}
        >
          {/* track gaps */}
          {["4%", "13%", "21%"].map((inset) => (
            <div key={inset} className="absolute rounded-full border border-black/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]" style={{ inset }} />
          ))}
          {/* the label */}
          <div className="absolute inset-[33%] overflow-hidden rounded-full bg-[#c2c6cb] text-center">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#8f959c]" />
            {/* placed by percentage so the three lines keep clear of the rim and the spindle at any size */}
            <p className="absolute inset-x-0 top-[27%] -translate-y-1/2 whitespace-nowrap font-bold leading-none tracking-[0.14em] text-[#15171a] [font-size:clamp(7px,1.7vmin,17px)]">{SONG.artist}</p>
            <p className="absolute inset-x-0 top-[64%] -translate-y-1/2 whitespace-nowrap font-semibold leading-none text-[#101214] [font-size:clamp(9px,1.6vmin,16px)]">{SONG.title}</p>
            <p className="absolute inset-x-0 top-[80%] -translate-y-1/2 whitespace-nowrap font-mono leading-none text-[#101214]/70 [font-size:clamp(6px,1vmin,11px)]">33⅓ rpm</p>
          </div>
          <div className="absolute left-1/2 top-1/2 h-[2.2%] w-[2.2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cfd3d8] shadow-[inset_0_0_2px_rgba(0,0,0,0.6)]" />
        </div>
        {/* reflections stay put while the record turns under them */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 25deg, transparent 0deg, rgba(255,255,255,0.09) 16deg, transparent 38deg, transparent 180deg, rgba(255,255,255,0.06) 198deg, transparent 222deg, transparent 360deg)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.06)]" />
      </div>
    </Layer>
  );
}

// ─── Photo print ─────────────────────────────────────────────────────────

function PrintSheet({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const prev = () => setI((n) => (n - 1 + PHOTOS.length) % PHOTOS.length);
  const next = () => setI((n) => (n + 1) % PHOTOS.length);
  useArrows(prev, next);
  return (
    <Layer
      onClose={onClose}
      actions={
        <>
          <button type="button" onClick={prev} className={`${btn} key-icon`} aria-label="Previous photo">
            ←
          </button>
          <span className="font-mono text-[11px] text-white/50">
            {i + 1} / {PHOTOS.length}
          </span>
          <button type="button" onClick={next} className={`${btn} key-icon`} aria-label="Next photo">
            →
          </button>
          <Ext href={INSTAGRAM_URL} className={primary}>
            @y.gpics ↗
          </Ext>
          <button type="button" onClick={() => jump("photography")} className={btn}>
            full gallery ↓
          </button>
        </>
      }
    >
      <div className="bg-[#0c0d0e] p-2.5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] sm:p-3.5">
        {/* fixed mat: % padding would resolve against the shrink-wrapped parent and push the photo out */}
        <div className="bg-[#ecebe7] p-4 sm:p-8">
          <div className="relative aspect-[1.375] w-[min(48rem,calc(100vw-5.5rem),calc((100svh-14rem)*1.375))]">
            <Image key={PHOTOS[i]} src={PHOTOS[i]} alt={`Photo ${i + 1} of ${PHOTOS.length}`} fill sizes="50rem" className="object-contain" />
          </div>
        </div>
      </div>
    </Layer>
  );
}

// ─── The poster on the left wall ────────────────────────────────────────

function PosterSheet({ onClose }: { onClose: () => void }) {
  return (
    <Layer onClose={onClose} caption="Hasbulla">
      <div className="bg-[#0c0d0e] p-2 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] sm:p-3">
        <div className="relative aspect-square w-[min(40rem,calc(100vw-5.5rem),calc(100svh-10rem))]">
          <Image src={ROOM_POSTER.src} alt={ROOM_POSTER.alt} fill sizes="40rem" className="object-cover" />
        </div>
      </div>
    </Layer>
  );
}

// ─── Network map poster: the homelab ────────────────────────────────────

function Diagram() {
  const node = (x: number, y: number, w: number, title: string, sub: string, accent = "#e2e8f0") => (
    <g key={title}>
      <rect x={x} y={y} width={w} height={40} rx={6} fill="#132231" stroke="#2c4257" />
      <text x={x + 10} y={y + 17} fontSize={12} fill={accent} className="lab-mono">{title}</text>
      <text x={x + 10} y={y + 31} fontSize={9.5} fill="#8aa0b6" className="lab-mono">{sub}</text>
    </g>
  );
  const line = (d: string, dash = false) => <path key={d} d={d} fill="none" stroke="#5b7690" strokeWidth={1.2} strokeDasharray={dash ? "4 4" : undefined} />;
  return (
    <svg viewBox="0 0 760 250" className="h-auto w-full" role="img" aria-label="Homelab network diagram">
      {line("M110 125 H160")}
      {line("M300 125 H340")}
      {line("M480 125 H505 V35 H540 M505 125 H540 M505 125 V215 H540")}
      {line("M480 80 H505", true)}
      {node(10, 105, 100, "internet", "ISP · CGNAT")}
      {node(160, 105, 140, "tl-sg108e", "8× gigabit · vlans")}
      {node(340, 105, 140, "p340 tiny", "debian 13 · 24/7", "#fca5a5")}
      {node(540, 15, 210, "caddy → 9+ apps", "TLS from my own internal CA")}
      {node(540, 70, 210, "adguard home", "DNS · DoH · split-horizon")}
      {node(540, 125, 210, "tailscale", "mesh VPN · subnet routes")}
      {node(540, 195, 210, "restic → backblaze b2", "encrypted offsite backups")}
    </svg>
  );
}

function MapSheet({ onClose }: { onClose: () => void }) {
  return (
    <Layer onClose={onClose}>
      <div className="w-[min(58rem,calc(100vw-1.5rem))] bg-[#0c0d0e] p-2.5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] sm:p-3.5">
        <div className="max-h-[calc(100svh-10rem)] overflow-y-auto bg-[#0f1a24] p-5 text-slate-200 [scrollbar-color:rgba(148,163,184,0.3)_transparent] [scrollbar-width:thin] sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-lg">homelab.map</p>
            <p className="font-mono text-[11px] text-slate-400">
              {HOMELAB.host} · {HOMELAB.os}
            </p>
          </div>
          <div className="mt-5">
            <Diagram />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Services</h4>
              <ul className="mt-3 space-y-3">
                {HOMELAB.services.map((s) => (
                  <li key={s.name}>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-[13px] leading-relaxed text-slate-400">{s.role}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Hardening</h4>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {HOMELAB.hardening.map((h) => (
                  <span key={h} className="rounded border border-slate-600/60 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                    {h}
                  </span>
                ))}
              </div>
              <h4 className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">Things I&apos;ve debugged</h4>
              <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-slate-300">
                {HOMELAB.stories.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-slate-500">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layer>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────

export function FocusSheet({ id, onClose, onStopMusic }: { id: string; onClose: () => void; onStopMusic?: () => void }) {
  switch (id) {
    case "record":
      return <RecordSheet onClose={onClose} onStop={onStopMusic} />;
    case "monitor":
      return <CrtSheet onClose={onClose} />;
    case "resume":
      return <ResumeSheet onClose={onClose} />;
    case "badge":
      return <BadgeSheet onClose={onClose} />;
    case "phone":
      return <PhoneSheet onClose={onClose} />;
    case "camera":
      return <CameraSheet onClose={onClose} />;
    case "print":
      return <PrintSheet onClose={onClose} />;
    case "map":
      return <MapSheet onClose={onClose} />;
    case "poster":
      return <PosterSheet onClose={onClose} />;
    default:
      return <CertSheet id={id} onClose={onClose} />;
  }
}
