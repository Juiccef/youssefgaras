import { Nav } from "@/components/Nav";
import { LabHero } from "@/components/lab/LabHero";
import { Projects } from "@/components/sections/Projects";
import { Homelab } from "@/components/sections/Homelab";
import { Websites } from "@/components/sections/Websites";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Photography } from "@/components/sections/Photography";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { NIGHT_GROUND, NightSky, RoomSky } from "@/components/NightSky";
import { OPENING_SCRIPT } from "@/components/lab/intro-gate";
import { ClassicIntro } from "@/components/sections/ClassicIntro";

// The homepage: the scrolling portfolio under the night sky, and the homelab
// room. The room is a place on the page: its picture is in the intro, and
// stepping inside swaps the page for the live room (lab/view.ts). A first
// visit opens in the room instead, on its start screen, and lands on the page
// once the room has powered on (lab/intro-gate.ts).
export default function Home() {
  return (
    <>
      {/* a first visit opens on the room's start screen: settled before anything paints */}
      <script dangerouslySetInnerHTML={{ __html: OPENING_SCRIPT }} />
      <Nav />
      <main>
        {/* the sky the room floats in; it has to come before the room (the room view hides everything after it) */}
        <RoomSky />
        <LabHero />
        {/* classic view: the sections under the night sky outside the room's window */}
        <NightSky>
          <ClassicIntro />
          <Projects />
          <Homelab />
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
