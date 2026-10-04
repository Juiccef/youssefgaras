import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { LabHero } from "@/components/lab/LabHero";
import { Projects } from "@/components/sections/Projects";
import { Websites } from "@/components/sections/Websites";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Photography } from "@/components/sections/Photography";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { NIGHT_GROUND, NightSky } from "@/components/NightSky";
import { INTRO_GATE_SCRIPT } from "@/components/lab/intro-gate";
import { ClassicIntro } from "@/components/sections/ClassicIntro";

// Side-by-side preview of the homelab hero. The live homepage (/) is untouched.
export const metadata: Metadata = {
  title: "Preview — Homelab hero",
  robots: { index: false, follow: false },
};

export default function Preview() {
  return (
    <>
      {/* room or classic, and (room) the terminal start screen, settled before anything paints */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
      <Nav />
      <main>
        <LabHero />
        {/* classic view: the sections under the night sky outside the room's window */}
        <NightSky>
          <ClassicIntro />
          <Projects />
          <Websites />
          <Experience />
          <About />
          <Photography />
          <Contact />
        </NightSky>
      </main>
      <div data-classic="" className="relative z-10" style={{ background: NIGHT_GROUND }}>
        <Footer />
      </div>
    </>
  );
}
