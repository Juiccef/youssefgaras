import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { Mail } from "lucide-react";

const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#websites", label: "Websites" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
  { href: "#photography", label: "Photography" },
  { href: "#contact", label: "Contact" },
];

const socialLinks = [
  { icon: GithubIcon, href: "https://github.com/Juiccef", label: "Juiccef" },
  { icon: LinkedinIcon, href: "https://www.linkedin.com/in/youssef-garas/", label: "LinkedIn" },
  { icon: InstagramIcon, href: "https://www.instagram.com/y.gpics/", label: "Instagram" },
  { icon: Mail, href: "mailto:youssefgaras@gmail.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <a href="#hero" aria-label="Back to top" className="key key-sm key-icon mb-4 text-[12px] font-bold tracking-tight">
              YG
            </a>
            <p className="text-white/60 text-sm leading-relaxed max-w-[220px]">
              Cybersecurity engineer and Georgia State CS grad. CCNA and Security+ certified. Open to security and software roles.
            </p>
          </div>

          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-mono mb-5">Navigation</p>
            <ul className="space-y-2.5">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-mono mb-5">Connect</p>
            <ul className="space-y-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white/60 hover:text-white text-sm transition-colors group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-putty transition-colors shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs font-mono">© {new Date().getFullYear()} Youssef Garas</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/50 text-xs font-mono">Open to opportunities</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
