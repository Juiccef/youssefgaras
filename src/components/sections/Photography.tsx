import { BlurFade } from "@/components/ui/BlurFade";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { ExpandableGallery } from "@/components/ui/gallery-animation";

const INSTAGRAM_URL = "https://www.instagram.com/y.gpics/";

const photos = [
  "/photos/650972603_18096526577512337_4567314352383703773_n.jpg",
  "/photos/653956318_18136268458510993_7133637385493163659_n.jpg",
  "/photos/651049058_18068570144652320_1011213500335140106_n.jpg",
  "/photos/652756299_18093485917843567_7740185498722407616_n.jpg",
  "/photos/654385360_18097287850807888_5734711489156017660_n.jpg",
  "/photos/650795741_18086794154466583_619092503578956881_n.jpg",
  "/photos/654526879_18144998599469871_401866364830960298_n.jpg",
  "/photos/650920182_18071149634219189_2753188449096934207_n.jpg",
  "/photos/653793425_18070054652266774_7222627803725084486_n.jpg",
];

export function Photography() {
  return (
    <section id="photography" className="py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <BlurFade>
          <p className="text-emerald-400 text-xs font-mono tracking-[0.2em] uppercase mb-3">
            <span className="text-emerald-400/50 mr-2">04.</span>Creative
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Photography</h2>
          <p className="text-white/50 text-lg mb-14 max-w-lg">
            Outside of code, I shoot. Hover to explore, click to expand.
          </p>
        </BlurFade>

        <BlurFade delay={0.1}>
          <ExpandableGallery images={photos} className="mb-10" />
        </BlurFade>

        <BlurFade delay={0.2}>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg border border-white/15 hover:border-emerald-500/40 text-white/60 hover:text-white text-sm transition-all duration-200 group mt-4"
          >
            <InstagramIcon className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
            @y.gpics on Instagram
          </a>
        </BlurFade>
      </div>
    </section>
  );
}
