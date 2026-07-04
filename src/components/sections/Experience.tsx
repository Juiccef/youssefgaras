import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";

const experiences = [
  {
    role: "IT Intern",
    company: "McKenney's, Inc.",
    location: "Atlanta, GA",
    period: "May 2026 — Aug 2026",
    type: "Internship",
    bullets: [
      "Supporting enterprise IT operations across one of the largest mechanical contractors in the Southeast — networking, endpoint management, and infrastructure security.",
      "Hands-on exposure to hybrid cloud environments, helpdesk workflows, and internal security tooling at scale.",
    ],
  },
  {
    role: "Technical Director & Lead Graphics Operator",
    company: "Leading the Way",
    location: "Atlanta, GA",
    period: "Sep 2022 — Present",
    type: "Independent Contractor",
    bullets: [
      "Lead live international TV broadcasts reaching 260M+ viewers across the Middle East via Nilesat, Arabsat, and Hotbird satellites.",
      "Operate Xpression broadcast graphics software in zero-error, high-pressure live production environments.",
      "Transcribe and translate TV graphics from English to Arabic in real time, cutting hours of production prep.",
    ],
  },
  {
    role: "Knack Tutor",
    company: "Georgia State University",
    location: "Atlanta, GA",
    period: "Aug 2025 — Present",
    type: "Part-time",
    bullets: [
      "Tutor students in Linear Algebra, CS 1302 (Java), and Physics 1211.",
      "Students consistently achieve an average of one full letter grade improvement on assessments.",
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="02" kicker="Background" title="Experience" />

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

                  <div className="hidden md:block absolute left-[180px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 -translate-x-[4.5px] ring-4 ring-[#080808]" />

                  <div className="md:pl-8">
                    <h3 className="text-white font-semibold text-lg leading-snug">{exp.role}</h3>
                    <p className="text-emerald-400/90 text-sm font-mono mt-1 mb-5">
                      {exp.company} · {exp.location}
                    </p>
                    <ul className="space-y-2.5">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} className="text-white/65 text-sm leading-relaxed flex gap-3">
                          <span className="text-emerald-500/60 shrink-0 mt-0.5">—</span>
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
