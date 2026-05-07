"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

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
        scrolled ? "border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 font-mono font-bold tracking-tight text-sm">
          <span className="text-emerald-400">YG</span>
          <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400/60 font-mono tracking-widest">
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
                  activeSection === id ? "text-white" : "text-white/45 hover:text-white"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <LiquidButton
          size="sm"
          className="hidden sm:inline-flex text-white font-mono"
          onClick={() => window.open("/resume.pdf", "_blank")}
        >
          Resume ↗
        </LiquidButton>
      </nav>
    </header>
  );
}
