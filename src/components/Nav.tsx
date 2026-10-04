"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { HOME_EVENT, PICK_EVENT, setView, useView, type SiteView } from "@/components/lab/view";

// In room view (the preview's homelab hero) every link opens the matching
// object in the room instead of scrolling to its section.
const links = [
  { href: "#projects", label: "Projects", id: "projects", room: "monitor" },
  { href: "#websites", label: "Websites", id: "websites", room: "monitor" },
  { href: "#experience", label: "Experience", id: "experience", room: "badge" },
  { href: "#about", label: "About", id: "about", room: "resume" },
  { href: "#photography", label: "Photography", id: "photography", room: "camera" },
  { href: "#contact", label: "Contact", id: "contact", room: "phone" },
];

const sectionIds = links.map((l) => l.id);

/** Room ⇄ Classic: two keys, the current one held down. */
function ViewSwitch({ view }: { view: SiteView }) {
  return (
    <div role="group" aria-label="View" className="flex items-center gap-1 rounded-[10px] bg-black/45 p-1 ring-1 ring-white/10">
      {(["room", "classic"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => setView(v)}
          className={cn("key key-xs min-w-[4.25rem]", view === v && "key-light")}
        >
          {v === "room" ? "Room" : "Classic"}
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const view = useView();
  const room = view === "room";
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

  const go = (e: React.MouseEvent, target: string) => {
    setMenuOpen(false);
    if (!room) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: target }));
  };

  const goHome = (e: React.MouseEvent) => {
    if (!view) return;
    e.preventDefault();
    setMenuOpen(false);
    if (room) window.dispatchEvent(new Event(HOME_EVENT));
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (id: string) => !room && activeSection === id;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        (scrolled && !room) || menuOpen
          ? "border-b border-white/[0.06] bg-[#080808]/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <a href="#hero" onClick={goHome} aria-label="Youssef Garas — back to top" className="key key-sm key-icon text-[12px] font-bold tracking-tight">
          YG
        </a>

        <ul className={cn("hidden items-center gap-7", view ? "lg:flex" : "sm:flex")}>
          {links.map(({ href, label, id, room: target }) => (
            <li key={label}>
              <a
                href={href}
                onClick={(e) => go(e, target)}
                className={cn(
                  "text-sm transition-colors duration-200",
                  isActive(id) ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {view && <ViewSwitch view={view} />}

          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="key key-sm key-light hidden sm:inline-flex">
            Resume ↗
          </a>

          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-white/70 hover:text-white transition-colors",
              view ? "lg:hidden" : "sm:hidden"
            )}
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
        <div className={cn("border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl px-6 py-4", view ? "lg:hidden" : "sm:hidden")}>
          <ul className="space-y-1">
            {links.map(({ href, label, id, room: target }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={(e) => go(e, target)}
                  className={cn(
                    "block py-2.5 text-[15px] transition-colors",
                    isActive(id) ? "text-putty" : "text-white/70 hover:text-white"
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="key key-sm key-light"
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
