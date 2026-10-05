import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ExternalLink, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { CERTS } from "@/lib/content";

// Certificates with a scan and a verification code get featured under the bio
const FEATURED = CERTS.filter((c) => "verify" in c);

const skills = {
  Languages: ["Python", "C", "JavaScript", "Java", "SQL", "R"],
  Stack: ["React", "Node.js", "OpenCV", "TensorFlow", "Pinecone", "Wireshark"],
  Certifications: ["CCNA", "Security+", "Google UX Design", "CodePath Web Dev"],
};


export function About() {
  return (
    <section id="about" data-sec="dusk" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="05" kicker="Story" title="About" />

        <div className="grid md:grid-cols-[280px_1fr] gap-12 items-start">
          <BlurFade delay={0.1}>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group">
              <Image
                src="/me.jpg"
                alt="Youssef Garas"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white/90 text-sm font-medium">Youssef Garas</p>
                <p className="text-white/60 text-xs font-mono mt-0.5">Atlanta, GA</p>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="space-y-8">
              <div className="space-y-5 text-white/70 leading-relaxed text-[1.05rem] max-w-2xl">
                <p>
                  I am a Computer Science graduate from Georgia State University, a CCNA and Security+
                  holder, and an endpoint intern at McKenney&apos;s, interested in cloud infrastructure and
                  cybersecurity.
                </p>
                <p>
                  What makes my background unique is my ability to connect the dots across the entire
                  technology stack. I don&apos;t just configure secure networks and deploy self-hosted
                  infrastructure; I also have a strong foundation in software engineering, AI automation,
                  and frontend design. Whether it&apos;s building a facial-recognition security system,
                  hardening a self-hosted server with encrypted cloud backups, or designing a sleek,
                  intuitive UI, I enjoy turning complex backend ideas into functional, visually polished,
                  real-world solutions.
                </p>
                <p>
                  I also spent nearly four years as technical director for a live international TV
                  broadcast that reached millions of viewers across the Middle East, which taught me to
                  work when there&apos;s no room for error. I speak Arabic, German and English, and
                  I&apos;m looking for security engineering and software roles.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-4">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-3 font-mono">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <span
                          key={item}
                          className={
                            category === "Certifications"
                              ? "text-xs px-2.5 py-1 rounded-lg bg-sec/10 border border-sec/25 text-sec"
                              : "text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-white/75"
                          }
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Featured credentials (the certificates with a verification code),
                  framed the way they hang on the room's wall: black frame, cream
                  mat, a picture light over each */}
              <div className="grid gap-x-8 gap-y-12 pt-8 lg:grid-cols-2">
                {FEATURED.map((c) => (
                  <figure key={c.id}>
                    <div className="relative">
                      {/* the light's pool on the wall, then the lamp itself */}
                      <span aria-hidden className="absolute -inset-x-6 -top-8 bottom-1/3 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(255,240,214,0.14),transparent_70%)]" />
                      <span aria-hidden className="absolute left-[35%] -top-3 h-1.5 w-[30%] rounded-full bg-[#2b2f33] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" />
                      <a
                        href={c.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block bg-[#0c0d0e] p-2.5 shadow-[4px_6px_0_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1"
                        aria-label={`Open ${c.name} certificate (PDF)`}
                      >
                        <span className="block bg-[#e9e6de] p-2">
                          <Image
                            src={c.thumb}
                            alt={`${c.name} certificate`}
                            width={640}
                            height={494}
                            sizes="(max-width: 1024px) 90vw, 22rem"
                            className="h-auto w-full"
                          />
                        </span>
                      </a>
                    </div>
                    <figcaption className="mt-5 min-w-0">
                      <p className="mb-1.5 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-sec">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                        Verified
                      </p>
                      <p className="font-semibold leading-snug text-white">{c.full}</p>
                      <p className="mt-1 text-sm text-white/60">
                        Issued {c.issued} · Valid through {c.validThrough}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                        <a
                          href={c.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-sec transition-colors hover:text-white"
                        >
                          Certificate <ExternalLink size={13} aria-hidden />
                        </a>
                        <a
                          href={c.verify.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-sec transition-colors hover:text-white"
                        >
                          Verify with {c.issuer} <ExternalLink size={13} aria-hidden />
                        </a>
                      </div>
                      <p className="mt-2 truncate font-mono text-[11px] text-white/55" title={c.verify.code}>
                        code {c.verify.code}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
