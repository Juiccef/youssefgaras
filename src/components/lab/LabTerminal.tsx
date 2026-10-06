"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CERTS, EXPERIENCE, HOMELAB, PROJECTS, RESUME_URL, SOCIALS } from "@/lib/content";

// The homelab server's own Linux console (Debian, tty1). Modes:
//   intro — the start screen: "penguin login:", then a shell; return / `boot` powers the lab on.
//           On a first visit it plays itself (`autoplay`): it logs in and runs `boot`.
//   busy  — the lab is booting, no prompt
//   shell — the drop-down console after boot; `exit` logs out and powers the lab down

export type LabTerminalHandle = {
  print: (...nodes: ReactNode[]) => void;
  clear: () => void;
  focus: () => void;
  /** Log in without the banner (restored session, skip intro). Clears anything half-typed. */
  login: (user: string) => void;
  /** Back to the login screen. */
  reset: () => void;
};

type Mode = "intro" | "busy" | "shell";

type Props = {
  mode: Mode;
  /** Start screen: play itself, logging in as this name and running `boot` (the prompt takes no typing meanwhile). */
  autoplay?: string | null;
  /** fast = skip the cinematic and jump straight to the site */
  onBoot: (fast?: boolean, user?: string) => void;
  onLogout: (reason: "exit" | "reboot") => void;
  /** Shell mode: put the console away again (the lab keeps running). */
  onClose?: () => void;
};

/** The server's hostname: the console banner, login prompt and shell prompt all use it. */
export const HOST = "penguin";

const COMMANDS: [string, string][] = [
  ["about", "who I am"],
  ["boot", "power on the homelab"],
  ["certs", "certifications"],
  ["clear", "clear the screen"],
  ["contact", "email and socials"],
  ["echo", "print text"],
  ["education", "where I studied"],
  ["experience", "where I've worked"],
  ["help", "this list"],
  ["history", "commands you've run"],
  ["neofetch", "the homelab server at a glance"],
  ["nmap", "scan this site for open services"],
  ["open", "jump to a section (open projects)"],
  ["projects", "things I've built"],
  ["pwd", "print working directory"],
  ["resume", "open my resume (pdf)"],
  ["services", "what runs on my homelab"],
  ["whoami", "who are you?"],
  ["exit", "log out"],
];

// What the login banner says is running: the short version of each service
const RUNNING = HOMELAB.services.map((s) => [s.unit, s.short] as const);

const NMAP: { port: string; state: "open" | "filtered"; svc: string; target?: string }[] = [
  { port: "22/tcp", state: "open", svc: "about", target: "about" },
  { port: "23/tcp", state: "filtered", svc: "telnet" },
  { port: "25/tcp", state: "open", svc: "contact", target: "contact" },
  { port: "443/tcp", state: "open", svc: "projects", target: "projects" },
  { port: "3306/tcp", state: "open", svc: "experience", target: "experience" },
  { port: "8080/tcp", state: "open", svc: "photography", target: "photography" },
  { port: "8443/tcp", state: "open", svc: "websites", target: "websites" },
];

const SECTIONS = ["projects", "homelab", "websites", "experience", "about", "photography", "contact"];

const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function stamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** `Thu Oct  1 20:41:07 2026`, like `last` prints it. */
function loginTime(d = new Date()) {
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${mon} ${String(d.getDate()).padStart(2, " ")} ${d.toTimeString().slice(0, 8)} ${d.getFullYear()}`;
}

/** Login names: lowercase, unix-safe, 16 chars; empty means guest. */
export const cleanUser = (raw: string) => raw.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 16) || "guest";

const B = ({ children }: { children: ReactNode }) => <span className="font-bold text-white">{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span className="text-[#8a8a8a]">{children}</span>;
const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target={href.startsWith("mailto") || href.startsWith("/") ? undefined : "_blank"}
    rel="noopener noreferrer"
    className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white/80"
  >
    {children}
  </a>
);

const Banner = () => (
  <div>
    <p>Debian GNU/Linux 13 {HOST} tty1</p>
    <p>&nbsp;</p>
  </div>
);

function Motd({ user }: { user: string }) {
  return (
    <div className="mb-1">
      <Dim>Linux {HOST} 6.12.43+deb13-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.12.43-1 x86_64</Dim>
      <p>&nbsp;</p>
      <p>
        {"  "}
        <B>Youssef Garas</B>, portfolio. Everything below is real and running:
      </p>
      {/* hanging indent: on narrow screens the description wraps under itself */}
      {RUNNING.map(([s, d]) => (
        <p key={s} className="flex">
          <span className="shrink-0 whitespace-pre">
            {"  "}
            <span className="text-[#7bd88f]">●</span> {s.padEnd(11, " ")}
          </span>
          <Dim>{d}</Dim>
        </p>
      ))}
      <p>&nbsp;</p>
      <p className="whitespace-pre-wrap">Last login: {loginTime()} on tty1</p>
      <p className="whitespace-pre-wrap">
        {"  "}welcome, <B>{user}</B>. type <B>help</B>, or press <B>enter</B> to power on the lab.
      </p>
      <p>&nbsp;</p>
    </div>
  );
}

export const LabTerminal = forwardRef<LabTerminalHandle, Props>(function LabTerminal({ mode, autoplay, onBoot, onLogout, onClose }, ref) {
  const [lines, setLines] = useState<{ id: number; node: ReactNode }[]>(() => [{ id: -1, node: <Banner /> }]);
  const [user, setUser] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [focused, setFocused] = useState(false);
  const idRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback(
    (...nodes: ReactNode[]) => setLines((prev) => [...prev.slice(-200), ...nodes.map((node) => ({ id: idRef.current++, node }))]),
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      print: push,
      clear: () => setLines([]),
      focus: () => inputRef.current?.focus({ preventScroll: true }),
      login: (name: string) => {
        setUser((u) => u ?? name);
        setInput("");
      },
      reset: () => {
        setUser(null);
        setInput("");
        setLines([{ id: idRef.current++, node: <Banner /> }]);
      },
    }),
    [push],
  );

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, mode]);

  // Desktop: focus the prompt whenever it's interactive (touch skips this so
  // the on-screen keyboard doesn't jump up).
  useEffect(() => {
    if (mode === "busy") return;
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, [mode]);

  // Start screen playing itself: the name is typed at the login prompt, then
  // `boot` at the shell, quickly enough that it reads as one motion.
  useEffect(() => {
    if (!autoplay) return;
    const who = autoplay;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => void timers.push(window.setTimeout(fn, ms));
    const type = (text: string, from: number, per: number) => {
      for (let i = 1; i <= text.length; i++) at(from + i * per, () => setInput(text.slice(0, i)));
      return from + text.length * per;
    };
    const echo = (promptText: string, typed: string) => (
      <p className="whitespace-pre-wrap break-words">
        <span className="font-bold text-white">{promptText}</span>
        {typed}
      </p>
    );
    let t = type(who, 300, 55);
    at((t += 140), () => {
      setInput("");
      setUser(who);
      push(echo(`${HOST} login: `, who), <Motd user={who} />);
    });
    t = type("boot", t + 380, 65);
    at(t + 140, () => {
      setInput("");
      push(echo(`${who}@${HOST}:~$ `, "boot"));
      onBoot(false, who);
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [autoplay, onBoot, push]);

  // Start screen: typing anywhere lands in the prompt
  useEffect(() => {
    if (mode !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el === inputRef.current || (el && el !== document.body)) return;
      const prompt = inputRef.current;
      if (!prompt) return;
      if (e.key === "Enter") {
        // focusing mid-keystroke would swallow it: hand the keystroke to the prompt instead
        e.preventDefault();
        prompt.focus({ preventScroll: true });
        prompt.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      } else if (e.key.length === 1) prompt.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const promptText = user ? `${user}@${HOST}:~$ ` : `${HOST} login: `;
  // an element, not a component: echoed lines keep the prompt they were typed at
  const prompt = <span className="font-bold text-white">{promptText}</span>;

  const login = (raw: string) => {
    const name = cleanUser(raw);
    setUser(name);
    push(
      <p className="whitespace-pre-wrap break-words">
        {prompt}
        {raw}
      </p>,
      <Motd user={name} />,
    );
    return name;
  };

  /** Touch screens: one tap logs in as guest and powers the lab on. */
  const enterAsGuest = () => {
    const name = user ?? login("");
    window.setTimeout(() => onBoot(false, name), 650);
  };

  const run = (raw: string) => {
    if (!user) return void login(raw);
    const cmd = raw.trim();
    const lc = cmd.toLowerCase().replace(/\s+/g, " ");
    const [head, arg = ""] = [lc.split(" ")[0], lc.split(" ").slice(1).join(" ")];
    push(
      <p className="whitespace-pre-wrap break-words">
        {prompt}
        {cmd}
      </p>,
    );

    // Start screen: return on an empty prompt boots the lab
    if (!cmd) {
      if (mode === "intro") onBoot(false, user);
      return;
    }

    setHistory((prev) => [cmd, ...prev.slice(0, 49)]);
    setHistoryIdx(-1);

    // `cat about.txt` / `cat services.md` read the same content as the commands
    let name = head;
    if (head === "cat") {
      if (arg === "about.txt") name = "about";
      else if (arg === "services.md") name = "services";
      else return push(<p>cat: {arg || "(nothing)"}: No such file or directory</p>);
    }

    switch (name) {
      case "boot":
      case "start":
      case "startx":
        if (mode === "intro") return onBoot(false, user);
        return push(<Dim>the lab is already running.</Dim>);
      case "gui":
      case "skip":
        if (mode === "intro") return onBoot(true, user);
        return push(<Dim>you&apos;re already in the gui.</Dim>);
      case "clear":
        return setLines([]);
      case "help":
        return push(
          ...COMMANDS.filter(([c]) => mode === "intro" || c !== "boot").map(([c, d]) => (
            <p key={c} className="whitespace-pre">
              {"  "}
              <span className="text-white">{c.padEnd(13, " ")}</span>
              <Dim>{d}</Dim>
            </p>
          )),
          <p className="mt-1">
            <Dim>tab completes · ↑↓ history · ctrl+l clears</Dim>
          </p>,
        );
      case "about":
        return push(
          <p className="text-white">
            I&apos;m Youssef Garas, a cybersecurity engineer and 2026 Computer Science graduate of Georgia State University.
          </p>,
          <p>
            CCNA and CompTIA Security+ certified. I build systems at the intersection of AI and security, run my own homelab,
            and I&apos;m currently an endpoint intern at McKenney&apos;s, Inc. in Atlanta.
          </p>,
        );
      case "whoami":
        return push(<p>{user}</p>);
      case "education":
        return push(<p>Georgia State University · B.S. Computer Science, cybersecurity concentration · class of 2026 · 3.90 GPA</p>);
      case "experience":
        return push(
          ...EXPERIENCE.map((e) => (
            <p key={e.role}>
              {e.role} <Dim>@ {e.company} · {e.period.toLowerCase()}</Dim>
            </p>
          )),
        );
      case "projects":
        return push(
          ...PROJECTS.map((p) => (
            <p key={p.name}>
              <Link href={p.link}>{p.name}</Link> <Dim>· {p.stack.slice(0, 3).join(", ")}</Dim>
            </p>
          )),
        );
      case "certs":
      case "certifications":
        return push(
          ...CERTS.map((c) => (
            <p key={c.id}>
              {c.full} <Dim>· {c.issuer}</Dim>
            </p>
          )),
        );
      case "contact":
      case "email":
      case "socials":
        return push(
          ...SOCIALS.map((s) => (
            <p key={s.key} className="whitespace-pre">
              <Dim>{s.key.padEnd(11, " ")}</Dim>
              <Link href={s.href}>{s.handle}</Link>
            </p>
          )),
        );
      case "resume":
        window.open(RESUME_URL, "_blank");
        return push(<Dim>opening resume.pdf…</Dim>);
      case "services":
      case "homelab":
        return push(
          <p>
            <B>p340-tiny</B> <Dim>· {HOMELAB.os}</Dim>
          </p>,
          ...HOMELAB.services.map((s) => (
            <p key={s.name} className="whitespace-pre-wrap">
              {"  "}
              {s.name.padEnd(22, " ")}
              <Dim>{s.role}</Dim>
            </p>
          )),
          <p>
            {"  "}hardening: <Dim>{HOMELAB.hardening.join(" · ")}</Dim>
          </p>,
        );
      case "neofetch":
        return push(
          <p>
            <B>
              {user}@{HOST}
            </B>
          </p>,
          <Dim>-----------------</Dim>,
          ...[
            ["OS", "Debian GNU/Linux 13 (trixie) x86_64"],
            ["Host", "Lenovo ThinkStation P340 Tiny"],
            ["Memory", "32 GB"],
            ["Storage", "2 TB external SSD"],
            ["Network", "TP-Link TL-SG108E · Tailscale mesh"],
            ["Services", `${HOMELAB.services.length} core · 9+ containers`],
          ].map(([k, v]) => (
            <p key={k}>
              <B>{k}</B>: {v}
            </p>
          )),
        );
      case "open":
        if (SECTIONS.includes(arg)) {
          jump(arg);
          return push(<Dim>opening {arg}…</Dim>);
        }
        return push(<p>open: no such section: {arg || "(none)"}. try {SECTIONS.join(", ")}</p>);
      case "ls":
        return push(<p className="whitespace-pre-wrap">about.txt   certs/   experience/   projects/   resume.pdf   services.md</p>);
      case "pwd":
        return push(<p>/home/{user}</p>);
      case "echo":
        return push(<p className="whitespace-pre-wrap break-words">{cmd.slice(5)}</p>);
      case "date":
        return push(<p>{stamp()}</p>);
      case "history":
        return push(
          ...[...history].reverse().concat(cmd).map((h, i) => (
            <p key={i} className="whitespace-pre">
              {String(i + 1).padStart(5)}  {h}
            </p>
          )),
        );
      case "nmap":
        return push(
          <Dim>Starting Nmap 7.95 ( https://nmap.org ) at {stamp()}</Dim>,
          <Dim>Nmap scan report for youssefgaras.dev (10.0.7.1)</Dim>,
          <p className="whitespace-pre text-[#8a8a8a]">
            {"PORT".padEnd(10)}
            {"STATE".padEnd(10)}SERVICE
          </p>,
          ...NMAP.map((r) => (
            <p key={r.port} className="whitespace-pre">
              {r.port.padEnd(10)}
              <span className={r.state === "open" ? "text-white" : "text-[#8a8a8a]"}>{r.state.padEnd(10)}</span>
              {r.target ? (
                <button
                  type="button"
                  onClick={() => jump(r.target!)}
                  className="underline decoration-white/30 underline-offset-2 hover:decoration-white/80"
                >
                  {r.svc}
                </button>
              ) : (
                <Dim>{r.svc} (nice try)</Dim>
              )}
            </p>
          )),
          <Dim>Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds</Dim>,
        );
      case "exit":
      case "logout":
        if (mode === "intro") {
          // like a real tty: back to the login prompt
          setUser(null);
          return setLines([{ id: idRef.current++, node: <Banner /> }]);
        }
        push(<p>logout</p>);
        return onLogout("exit");
      case "reboot":
        if (mode === "intro") return onBoot(false, user);
        push(<p>Broadcast message from root@{HOST}: the system is going down for reboot NOW!</p>);
        return onLogout("reboot");
      case "su":
      case "login":
        return push(<p className="text-[#ff8a8a]">nice try.</p>);
    }

    if (lc.startsWith("sudo")) return push(<p>{user} is not in the sudoers file. This incident will be reported.</p>);
    push(<p>-bash: {head}: command not found</p>);
  };

  const complete = () => {
    const word = input.trim().toLowerCase();
    if (!user || !word || word.includes(" ")) return;
    const hits = COMMANDS.map(([c]) => c).filter((c) => c.startsWith(word));
    if (hits.length === 1) setInput(hits[0]);
    else if (hits.length > 1)
      push(
        <p>
          {prompt}
          {input}
        </p>,
        <p>{hits.join("   ")}</p>,
      );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (autoplay) return e.preventDefault();
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "ArrowUp" && user) {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      if (history[next] !== undefined) {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown" && user) {
      e.preventDefault();
      const next = historyIdx - 1;
      setHistoryIdx(next < 0 ? -1 : next);
      setInput(next < 0 ? "" : history[next]);
    }
  };

  const dropdown = mode === "shell";

  return (
    <div className="relative flex h-full w-full flex-col bg-black text-left" onClick={() => mode !== "busy" && inputRef.current?.focus({ preventScroll: true })}>
      <div
        ref={bodyRef}
        className={`flex-1 cursor-text overflow-y-auto font-mono text-[13px] leading-[1.6] text-[#cfcfcf] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin] md:text-[14px] ${
          dropdown ? "px-5 py-4 md:px-8" : "px-5 pb-5 pt-16 md:px-10 md:py-8"
        }`}
        aria-live="polite"
      >
        {lines.map((l) => (
          <div key={l.id}>{l.node}</div>
        ))}

        {mode === "busy" ? (
          <span className="inline-block w-[0.6em] border-b-2 border-[#e8e8e8] motion-safe:animate-[lab-caret_1.05s_steps(1)_infinite]">&nbsp;</span>
        ) : (
          <p className="relative whitespace-pre-wrap break-words">
            {prompt}
            {input}
            <span
              aria-hidden
              className={`inline-block w-[0.6em] translate-y-[0.1em] border-b-2 border-[#e8e8e8] ${
                focused ? "motion-safe:animate-[lab-caret_1.05s_steps(1)_infinite]" : "opacity-40"
              }`}
            >
              &nbsp;
            </span>
            {/* The real input is invisible; 16px keeps iOS from zooming on focus */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              readOnly={!!autoplay}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none"
              aria-label={user ? "Terminal input" : "Login name"}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
            />
          </p>
        )}
      </div>

      {/* Start screen hints: type a name (desktop), or one tap in (touch) */}
      {mode === "intro" && !autoplay && (
        <div className="pointer-events-none flex items-center justify-between gap-3 px-5 pb-5 font-mono text-[11px] text-white/35 md:px-10 md:pb-8">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              enterAsGuest();
            }}
            className="key key-light pointer-events-auto hidden w-full [@media(pointer:coarse)]:inline-flex"
          >
            Enter as guest
          </button>
          <span className="ml-auto [@media(pointer:coarse)]:hidden">
            {user ? "type help, or press enter to power on the lab" : "type any name and press enter (or just enter)"}
          </span>
        </div>
      )}

      {/* Drop-down console: how to put it away */}
      {dropdown && onClose && (
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-1.5 font-mono text-[11px] text-white/35 md:px-8">
          <span>tty1 · {HOST}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="hover:text-white/80"
          >
            close <span className="text-white/25">(` or esc)</span>
          </button>
        </div>
      )}
    </div>
  );
});
