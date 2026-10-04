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
    <section id="about" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader index="04" kicker="Story" title="About" />

        <div className="grid md:grid-cols-[280px_1fr] gap-12 items-start">
          <BlurFade delay={0.1}>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group">
              <Image
                src="/me.jpg"
                alt="Youssef Garas"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="280px"
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
                  I graduated from Georgia State University in 2026 with a B.S. in Computer Science,
                  concentrating in Cybersecurity. Security isn&apos;t a track I fell into — it&apos;s what
                  I&apos;ve been building toward: I hold CCNA and CompTIA Security+, giving me a solid
                  foundation in network defense and threat analysis, and I&apos;m now an endpoint intern
                  at McKenney&apos;s.
                </p>
                <p>
                  I&apos;m drawn to the intersection of AI and security — building systems that are both
                  intelligent and hard to break — and I use AI every day: I run an independent e-commerce
                  store with Claude and MCP connectors handling its social content, product content and
                  inbox. I also spent nearly four years as Technical Director for a live international TV
                  broadcast reaching millions of viewers across the Middle East, which taught me to work
                  under zero-error pressure. I speak Arabic, German, and English.
                </p>
                <p>
                  I&apos;m looking for security engineering and software roles. If you&apos;re building
                  something that needs to be both smart and secure, I&apos;d love to talk.
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
                              ? "text-xs px-2.5 py-1 rounded-lg bg-putty/10 border border-putty/20 text-putty"
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

              {/* Featured credentials: the certificates with a verification code */}
              <div className="grid gap-4 lg:grid-cols-2">
                {FEATURED.map((c) => (
                  <div key={c.id} className="flex flex-col gap-4 rounded-xl border border-putty/20 bg-putty/[0.04] p-5 sm:flex-row sm:items-center">
                    <a
                      href={c.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block w-36 shrink-0 overflow-hidden rounded-lg border border-white/10 transition-colors hover:border-putty/40"
                      aria-label={`Open ${c.name} certificate (PDF)`}
                    >
                      <Image src={c.thumb} alt={`${c.name} certificate thumbnail`} width={320} height={247} className="h-auto w-full" />
                    </a>
                    <div className="min-w-0">
                      <p className="mb-1.5 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-putty">
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
                          className="inline-flex items-center gap-1.5 text-sm text-putty transition-colors hover:text-white"
                        >
                          Certificate <ExternalLink size={13} aria-hidden />
                        </a>
                        <a
                          href={c.verify.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-putty transition-colors hover:text-white"
                        >
                          Verify with {c.issuer} <ExternalLink size={13} aria-hidden />
                        </a>
                      </div>
                      <p className="mt-2 truncate font-mono text-[11px] text-white/55" title={c.verify.code}>
                        code {c.verify.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
