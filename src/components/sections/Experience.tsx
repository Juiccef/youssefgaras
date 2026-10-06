import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EXPERIENCE } from "@/lib/content";

const experiences = EXPERIENCE;
const two = (n: number) => String(n).padStart(2, "0");

export function Experience() {
  return (
    <section id="experience" data-sec="beacon" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="04" kicker="Background" title="Experience" />

        <div className="space-y-6 md:space-y-8">
          {experiences.map((exp, i) => {
            const [from, to] = exp.period.split(" to ");
            return (
              <BlurFade key={exp.role} delay={i * 0.1}>
                {/* a ticket (.ticket in globals.css): the dates on the stub, the job on the rest */}
                <article className="ticket">
                  <div className="ticket-stub flex items-center justify-between gap-4 px-5 md:flex-col md:items-start md:px-6 md:py-7">
                    <p className="order-last shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:order-none">
                      <span className="hidden md:inline">No. </span>
                      {two(i + 1)} / {two(experiences.length)}
                    </p>
                    <div className="min-w-0">
                      <p className="display whitespace-nowrap text-[clamp(1.15rem,6vw,1.6rem)] text-white md:text-[2rem]">
                        <span className="md:block">
                          {from} <span className="text-sec">to</span>
                        </span>{" "}
                        <span className="md:block">{to}</span>
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sec md:mt-3">{exp.type}</p>
                    </div>
                    <span aria-hidden className="ticket-bars hidden w-full md:block" />
                  </div>

                  <div className="p-5 pt-6 md:p-8">
                    <h3 className="display text-[1.75rem] leading-[0.95] text-white md:text-[2.1rem]">{exp.role}</h3>
                    <p className="mt-2.5 mb-5 font-mono text-sm text-sec">
                      {exp.company} · {exp.location}
                    </p>
                    <ul className="space-y-2.5">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="text-white/65 text-sm leading-relaxed flex gap-3">
                          <span className="text-sec/70 shrink-0">›</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
