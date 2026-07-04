"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#about", label: "About", id: "about" },
  { href: "#photography", label: "Photography", id: "photography" },
  { href: "#contact", label: "Contact", id: "contact" },
];

const sectionIds = links.map((l) => l.id);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "border-b border-white/[0.06] bg-[#080808]/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 font-mono font-bold tracking-tight text-sm">
          <span className="text-emerald-400">YG</span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400/80 font-mono tracking-widest">
            CCNA
          </span>
        </a>

        <ul className="hidden sm:flex items-center gap-7">
          {links.map(({ href, label, id }) => (
            <li key={label}>
              <a
                href={href}
                className={cn(
                  "text-sm transition-colors duration-200",
                  activeSection === id ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center h-9 px-4 rounded-full border border-white/15 bg-white/[0.03] text-sm font-mono text-white/85 hover:text-white hover:border-emerald-500/40 transition-colors duration-200"
          >
            Resume ↗
          </a>

          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-white/70 hover:text-white transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl px-6 py-4">
          <ul className="space-y-1">
            {links.map(({ href, label, id }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block py-2.5 text-[15px] transition-colors",
                    activeSection === id ? "text-emerald-400" : "text-white/70 hover:text-white"
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center h-9 px-4 rounded-full border border-white/15 text-sm font-mono text-white/85"
              >
                Resume ↗
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
