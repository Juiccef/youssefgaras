import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/SocialIcons";

const links = [
  {
    icon: GithubIcon,
    label: "GitHub",
    href: "https://github.com/Juiccef",
    handle: "@Juiccef",
  },
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/youssef-garas/",
    handle: "youssef-garas",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:youssefgaras@gmail.com",
    handle: "youssefgaras@gmail.com",
  },
  {
    icon: InstagramIcon,
    label: "Photography",
    href: "https://www.instagram.com/y.gpics/",
    handle: "@y.gpics",
  },
];

export function Contact() {
  return (
    <section id="contact" data-sec="signal" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          index="07"
          kicker="Connect"
          title="Contact"
          lede="Open to security engineering and software roles. Always happy to talk about interesting projects."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map(({ icon: Icon, label, href, handle }, i) => (
            <BlurFade key={label} delay={i * 0.07}>
              <a
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-sec/40 hover:bg-white/[0.05] transition-all duration-200 group"
              >
                <div className="p-2.5 rounded-lg bg-white/[0.04] group-hover:bg-sec/10 transition-colors shrink-0">
                  <Icon className="w-5 h-5 text-sec/80 group-hover:text-sec transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 text-xs font-mono mb-0.5">{label}</p>
                  <p className="text-white/85 font-medium text-sm truncate">{handle}</p>
                </div>
              </a>
            </BlurFade>
          ))}
        </div>

      </div>
    </section>
  );
}
