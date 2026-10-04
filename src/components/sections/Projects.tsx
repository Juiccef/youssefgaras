import { MagicCard } from "@/components/ui/MagicCard";
import { BlurFade } from "@/components/ui/BlurFade";
import { TechBadge } from "@/components/ui/TechBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ExternalLink, TerminalSquare } from "lucide-react";
import Image from "next/image";
import { PROJECTS } from "@/lib/content";

const projects = PROJECTS;

/* Styled stand-in so every card shares the same media treatment
   until a real screenshot is swapped in. */
function PreviewPlaceholder({ file }: { file: string }) {
  return (
    <div className="relative w-full h-44 md:h-48 dot-grid bg-[#0b100e] flex flex-col items-center justify-center gap-2 border-b border-white/[0.06]">
      <TerminalSquare className="w-6 h-6 text-putty/50" aria-hidden />
      <p className="font-mono text-[11px] text-white/50">./previews/{file}</p>
      <p className="font-mono text-[10px] tracking-widest uppercase text-putty/60">
        screenshot coming soon
      </p>
    </div>
  );
}

export function Projects() {
  return (
    <section id="projects" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="01" kicker="Work" title="Projects" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <BlurFade key={project.name} delay={i * 0.08} className="h-full">
              <MagicCard className="h-full !p-0 overflow-hidden flex flex-col">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full overflow-hidden group shrink-0"
                  tabIndex={-1}
                  aria-hidden
                >
                  {project.preview ? (
                    <div className="relative w-full h-44 md:h-48 border-b border-white/[0.06]">
                      <Image
                        src={project.preview}
                        alt={`${project.name} preview`}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
                    </div>
                  ) : (
                    <PreviewPlaceholder file={project.placeholderFile ?? "preview.png"} />
                  )}
                </a>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white leading-snug">{project.name}</h3>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 shrink-0 text-white/30 hover:text-putty transition-colors"
                      aria-label={`View ${project.name}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed flex-1 mb-5">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <TechBadge key={tech} tech={tech} />
                    ))}
                  </div>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
