import { MagicCard } from "@/components/ui/MagicCard";
import { BlurFade } from "@/components/ui/BlurFade";
import { TechBadge } from "@/components/ui/TechBadge";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    name: "Facial Recognition Door Lock",
    description:
      "Biometric physical access control system using OpenCV and KNN. Replaces keycard-based entry with real-time face identification — 95% accuracy via eigenface normalization on a live dataset.",
    stack: ["Python", "OpenCV", "KNN", "Security", "JSON"],
    link: "https://facial-recognition-door-security-v5.vercel.app/",
    preview: "/previews/facial-recognition.png",
  },
  {
    name: "GSU Panther Chatbot",
    description:
      "Full-stack AI academic assistant for Georgia State students. GPT-4 grounded through Pinecone vector search — architected with data isolation and scoped retrieval to prevent prompt injection and hallucination.",
    stack: ["React", "Node.js", "Supabase", "Pinecone", "OpenAI API"],
    link: "https://frontend-4hefze9k9-youssefgaras-3531s-projects.vercel.app/",
    preview: "/previews/gsu-chatbot.png",
  },
  {
    name: "Intelligent Word Prediction Bot",
    description:
      "Real-time voice-interaction system combining speech recognition with TensorFlow LSTM pipelines for sequence prediction. Explores adversarial input handling and model robustness under noisy conditions.",
    stack: ["Python", "TensorFlow", "LSTM", "NLP"],
    link: "https://github.com/Juicce",
    preview: null,
  },
  {
    name: "UFC RSVP Page",
    description:
      "Dynamic RSVP and advertising website for a UFC event. Built with input validation, XSS mitigations, and responsive UX flows designed in Figma.",
    stack: ["Figma", "HTML", "CSS", "JavaScript"],
    link: "https://ufc319rsvppage.vercel.app/",
    preview: "/previews/ufc-rsvp.png",
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <BlurFade>
          <p className="text-emerald-400 text-xs font-mono tracking-[0.2em] uppercase mb-3">
            <span className="text-emerald-400/50 mr-2">01.</span>Work
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Projects</h2>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <BlurFade key={project.name} delay={i * 0.08}>
              <MagicCard className="h-full !p-0 overflow-hidden">
                {project.preview && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full h-44 overflow-hidden group"
                  >
                    <Image
                      src={project.preview}
                      alt={`${project.name} preview`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
                  </a>
                )}

                <div className="flex flex-col p-6" style={{ flex: 1 }}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white leading-snug">{project.name}</h3>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 shrink-0 text-white/20 hover:text-blue-400 transition-colors"
                      aria-label={`View ${project.name}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <p className="text-white/45 text-sm leading-relaxed flex-1 mb-5">
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
