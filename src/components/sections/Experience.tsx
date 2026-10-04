import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EXPERIENCE } from "@/lib/content";

const experiences = EXPERIENCE;

export function Experience() {
  return (
    <section id="experience" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="03" kicker="Background" title="Experience" />

        <div className="relative">
          <div className="absolute left-[180px] top-0 bottom-0 w-px bg-white/[0.06] hidden md:block" />

          <div className="space-y-14 md:space-y-16">
            {experiences.map((exp, i) => (
              <BlurFade key={i} delay={i * 0.1}>
                <div className="md:grid md:grid-cols-[180px_1fr] gap-8 relative">
                  <div className="md:text-right mb-4 md:mb-0 md:pr-8">
                    <p className="text-white/55 text-xs font-mono leading-relaxed">{exp.period}</p>
                    <p className="text-white/45 text-xs font-mono mt-1">{exp.type}</p>
                  </div>

                  <div className="hidden md:block absolute left-[180px] top-1.5 w-2 h-2 rounded-full bg-putty -translate-x-[4.5px] ring-4 ring-[#080808]" />

                  <div className="md:pl-8">
                    <h3 className="text-white font-semibold text-lg leading-snug">{exp.role}</h3>
                    <p className="text-putty/90 text-sm font-mono mt-1 mb-5">
                      {exp.company} · {exp.location}
                    </p>
                    <ul className="space-y-2.5">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="text-white/65 text-sm leading-relaxed flex gap-3">
                          <span className="text-putty/60 shrink-0 mt-0.5">—</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
