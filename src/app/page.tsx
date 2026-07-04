import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Photography } from "@/components/sections/Photography";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="relative z-10 bg-[#080808] dot-grid overflow-hidden">
          {/* Top fade — eases the dot grid in from the hero */}
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-48 z-10"
            style={{
              background: "linear-gradient(to bottom, #080808 0%, rgba(8,8,8,0.6) 50%, transparent 100%)",
            }}
          />
          {/* Glow orbs — single emerald/teal system */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-10 left-1/4 w-[700px] h-[500px] rounded-full bg-emerald-500/15 blur-[100px]" />
            <div className="absolute top-[38%] -right-20 w-[550px] h-[550px] rounded-full bg-teal-500/10 blur-[110px]" />
            <div className="absolute bottom-[20%] -left-10 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[100px]" />
          </div>
          <Projects />
          <Experience />
          <About />
          <Photography />
          <Contact />
        </div>
      </main>
      <div className="relative z-10 bg-[#080808] dot-grid">
        <Footer />
      </div>
    </>
  );
}
