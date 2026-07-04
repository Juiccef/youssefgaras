import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ExternalLink, BadgeCheck } from "lucide-react";
import Image from "next/image";

const skills = {
  Languages: ["Python", "C", "JavaScript", "Java", "SQL", "R"],
  Stack: ["React", "Node.js", "OpenCV", "TensorFlow", "Pinecone", "Wireshark"],
  Certifications: ["CCNA", "Security+ (in progress)", "Google UX Design"],
};

// Printed on the certificate — recruiters can verify authenticity at Cisco.
const CCNA_VERIFY_URL = "https://www.cisco.com/go/verifycertificate";
const CCNA_VERIFICATION_NO = "3d725c9f4c5c455ab40b655434254ed0";

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
                  I&apos;m a Computer Science student at Georgia State University concentrating in
                  Cybersecurity, graduating May 2026. Security isn&apos;t a track I fell into — it&apos;s
                  what I&apos;ve been building toward: I hold a CCNA certification and am actively
                  pursuing Security+ to deepen my foundation in network defense and threat analysis.
                </p>
                <p>
                  I&apos;m drawn to the intersection of AI and security — building systems that are both
                  intelligent and hard to break. Outside of code, I serve as Technical Director for a
                  live international TV broadcast reaching millions of viewers across the Middle East,
                  a role that sharpened my ability to operate under zero-error pressure. I speak
                  Arabic, German, and English.
                </p>
                <p>
                  I&apos;m actively looking for security engineering or SWE roles starting Summer/Fall 2026.
                  If you&apos;re building something that needs to be both smart and secure, I&apos;d love to talk.
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
                              ? "text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
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

              {/* Featured credential — CCNA */}
              <div className="flex flex-col sm:flex-row gap-5 sm:items-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
                <a
                  href="/certs/ccna.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block w-40 shrink-0 rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/40 transition-colors"
                  aria-label="Open CCNA certificate (PDF)"
                >
                  <Image
                    src="/certs/ccna-thumb.png"
                    alt="CCNA certificate thumbnail"
                    width={320}
                    height={247}
                    className="w-full h-auto"
                  />
                </a>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono tracking-[0.2em] uppercase mb-1.5">
                    <BadgeCheck className="w-3.5 h-3.5" aria-hidden />
                    Featured credential
                  </p>
                  <p className="text-white font-semibold leading-snug">
                    Cisco Certified Network Associate (CCNA)
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Issued Jun 2026 · Valid through Jun 2029
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
                    <a
                      href="/certs/ccna.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      View certificate <ExternalLink size={13} aria-hidden />
                    </a>
                    <a
                      href={CCNA_VERIFY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      Verify with Cisco <ExternalLink size={13} aria-hidden />
                    </a>
                  </div>
                  <p className="text-white/55 text-[11px] font-mono mt-2 truncate">
                    verification no. {CCNA_VERIFICATION_NO}
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
