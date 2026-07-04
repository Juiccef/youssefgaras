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
  { icon: GithubIcon, href: "https://github.com/Juicce", label: "Juiccef" },
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
            <p className="font-mono text-emerald-400 font-bold text-sm mb-3">YG</p>
            <p className="text-white/60 text-sm leading-relaxed max-w-[220px]">
              Cybersecurity engineer & CS student at Georgia State. CCNA certified, pursuing Security+. Open to security and SWE roles starting Summer 2026.
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
                    <Icon className="w-4 h-4 group-hover:text-emerald-400 transition-colors shrink-0" />
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
