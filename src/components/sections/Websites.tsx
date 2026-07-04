import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowUpRight, Globe } from "lucide-react";
import Image from "next/image";

type Site = {
  name: string;
  category: string;
  url: string;
  displayUrl: string;
  description: string;
  tags: string[];
  preview: string;
};

const sites: Site[] = [
  {
    name: "Peach Parking Solutions",
    category: "Valet & Parking · Atlanta, GA",
    url: "https://www.peachparkingsolutions.com/",
    displayUrl: "peachparkingsolutions.com",
    description:
      "Design-and-build marketing site for an Atlanta valet company — a bold photo-led hero, service breakdown, and a quote-request flow built to turn event planners and venues into booked clients.",
    tags: ["Web Design", "Responsive", "SEO", "Lead Capture"],
    preview: "/previews/peach-parking.jpg",
  },
];

export function Websites() {
  return (
    <section id="websites" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          index="02"
          kicker="Client Work"
          title="Websites for Business"
          lede="Design-and-build sites for real businesses — shipped, hosted, and bringing in customers."
        />

        <div className="space-y-6">
          {sites.map((site, i) => (
            <BlurFade key={site.name} delay={i * 0.08}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-white/10 bg-[#0f0f0f] overflow-hidden transition-colors duration-300 hover:border-emerald-500/30"
              >
                <div className="grid md:grid-cols-2">
                  {/* Browser-framed preview */}
                  <div className="p-5 md:p-6">
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                      <div className="flex items-center gap-2 px-3 h-8 bg-white/[0.04] border-b border-white/[0.06]">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="ml-2 flex-1 truncate rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-mono text-white/50">
                          {site.displayUrl}
                        </span>
                      </div>
                      <div className="relative aspect-[1400/875] overflow-hidden">
                        <Image
                          src={site.preview}
                          alt={`${site.name} website preview`}
                          fill
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-center p-6 md:p-8 md:pl-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono tracking-[0.18em] uppercase mb-3">
                      <Globe className="w-3.5 h-3.5" aria-hidden />
                      Live site
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-bold text-white leading-tight">{site.name}</h3>
                    <p className="text-white/60 text-sm font-mono mt-1.5">{site.category}</p>

                    <p className="text-white/70 text-[0.95rem] leading-relaxed mt-4">
                      {site.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {site.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300 mt-6 group-hover:gap-2.5 transition-all">
                      Visit site
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </a>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
