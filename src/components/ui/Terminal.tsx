"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Line = { id: number; content: ReactNode };

const PROMPT = (
  <>
    <span className="text-emerald-400">youssef@portfolio</span>
    <span className="text-white/40">:</span>
    <span className="text-teal-300">~</span>
    <span className="text-white/60">$ </span>
  </>
);

const HELP: [string, string][] = [
  ["help", "list available commands"],
  ["whoami", "who is this guy?"],
  ["ls projects", "list featured projects"],
  ["certs", "show certifications"],
  ["contact", "how to reach me"],
  ["resume", "open my resume"],
  ["reboot", "replay the boot intro"],
  ["clear", "clear the terminal"],
];

const PROJECTS = [
  ["facial-recognition/", "biometric door lock — OpenCV + KNN"],
  ["gsu-chatbot/", "AI academic assistant — GPT-4 + Pinecone"],
  ["word-prediction/", "LSTM voice interaction — TensorFlow"],
  ["ufc-rsvp/", "event RSVP site — hardened forms"],
];

export function respond(raw: string): ReactNode[] {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");

  if (cmd === "help")
    return HELP.map(([c, d]) => (
      <p key={c}>
        <span className="text-emerald-300">{c.padEnd(14, " ")}</span>
        <span className="text-white/60">{d}</span>
      </p>
    ));

  if (cmd === "whoami")
    return [
      <p key="w" className="text-white/75">
        youssef garas — cybersecurity engineer & CS senior @ Georgia State.
        CCNA certified. I build systems that are smart and hard to break.
      </p>,
    ];

  if (cmd === "ls" || cmd === "ls -la" || cmd === "ls ~")
    return [
      <p key="l" className="text-white/75">
        <span className="text-teal-300">projects/</span>{"  "}
        <span className="text-teal-300">experience/</span>{"  "}
        <span className="text-teal-300">about/</span>{"  "}
        <span className="text-teal-300">photography/</span>{"  "}
        resume.pdf
      </p>,
    ];

  if (cmd === "ls projects" || cmd === "projects" || cmd === "cd projects")
    return PROJECTS.map(([n, d]) => (
      <p key={n}>
        <span className="text-teal-300">{n.padEnd(22, " ")}</span>
        <span className="text-white/60">{d}</span>
      </p>
    )).concat(
      <p key="hint" className="text-white/45">
        ↓ scroll down to see them, or run `open projects`
      </p>
    );

  if (cmd === "certs" || cmd === "certifications")
    return [
      <p key="1" className="text-white/75">
        <span className="text-emerald-300">[✓]</span> CCNA — Cisco Certified Network Associate (valid → 2029)
      </p>,
      <p key="2" className="text-white/75">
        <span className="text-emerald-300">[✓]</span> CompTIA Security+
      </p>,
      <p key="3" className="text-white/75">
        <span className="text-emerald-300">[✓]</span> Google UX Design
      </p>,
    ];

  if (cmd === "contact")
    return [
      <p key="e">
        <span className="text-white/60">email{"    "}</span>
        <a href="mailto:youssefgaras@gmail.com" className="text-emerald-300 underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-300">
          youssefgaras@gmail.com
        </a>
      </p>,
      <p key="l">
        <span className="text-white/60">linkedin{"  "}</span>
        <a href="https://www.linkedin.com/in/youssef-garas/" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-300">
          /in/youssef-garas
        </a>
      </p>,
      <p key="g">
        <span className="text-white/60">github{"    "}</span>
        <a href="https://github.com/Juiccef" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-300">
          @Juiccef
        </a>
      </p>,
    ];

  if (cmd === "resume" || cmd === "open resume" || cmd === "cat resume.pdf") {
    window.open("/resume.pdf", "_blank");
    return [<p key="r" className="text-white/60">opening resume.pdf…</p>];
  }

  if (cmd.startsWith("open ")) {
    const target = cmd.slice(5).replace(/\/$/, "");
    const ids = ["projects", "experience", "about", "photography", "contact"];
    if (ids.includes(target)) {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      return [<p key="o" className="text-white/60">navigating to {target}…</p>];
    }
    return [<p key="o" className="text-white/60">open: no such section: {target}</p>];
  }

  if (cmd === "reboot") {
    try {
      localStorage.removeItem("yg-boot");
    } catch {
      // ignore
    }
    setTimeout(() => window.location.reload(), 600);
    return [<p key="rb" className="text-white/60">rebooting…</p>];
  }

  if (cmd.startsWith("sudo"))
    return [
      <p key="s" className="text-white/75">
        youssef is not in the sudoers file. This incident will be reported.
      </p>,
    ];

  if (cmd === "")
    return [];

  return [
    <p key="nf" className="text-white/60">
      command not found: {cmd.split(" ")[0]} — try <span className="text-emerald-300">help</span>
    </p>,
  ];
}

export function Terminal({ className = "" }: { className?: string }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const idRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (content: ReactNode) =>
    setLines((prev) => [...prev.slice(-160), { id: idRef.current++, content }]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    push(
      <p>
        {PROMPT}
        <span className="text-white/90">{cmd}</span>
      </p>
    );
    if (cmd.toLowerCase() === "clear") {
      setLines([]);
      return;
    }
    respond(cmd).forEach((node) => push(node));
    if (cmd) {
      setHistory((prev) => [cmd, ...prev.slice(0, 39)]);
    }
    setHistoryIdx(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      if (history[next] !== undefined) {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIdx - 1;
      setHistoryIdx(next < 0 ? -1 : next);
      setInput(next < 0 ? "" : history[next]);
    }
  };

  return (
    <div
      className={`w-full rounded-xl border border-white/10 bg-[#0a0d0c]/90 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden text-left ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 h-9 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
        <p className="flex-1 text-center text-[11px] font-mono text-white/50 select-none pr-12">
          youssef@portfolio — zsh
        </p>
      </div>

      {/* Scrollback */}
      <div
        ref={bodyRef}
        className="h-44 md:h-52 overflow-y-auto px-4 py-3 font-mono text-[12.5px] md:text-[13px] leading-relaxed cursor-text [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]"
        aria-live="polite"
      >
        <p className="text-white/60">
          Welcome. Type <span className="text-emerald-300">help</span> to look around.
        </p>
        {lines.map((l) => (
          <div key={l.id}>{l.content}</div>
        ))}

        {/* Input line */}
        <p className="flex items-center">
          {PROMPT}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-0 bg-transparent outline-none border-none text-white/90 caret-emerald-400 placeholder:text-white/25"
            placeholder="try `whoami`"
            aria-label="Terminal input"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </p>
      </div>
    </div>
  );
}
