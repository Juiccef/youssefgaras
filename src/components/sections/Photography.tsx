import { BlurFade } from "@/components/ui/BlurFade";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { ExpandableGallery } from "@/components/ui/gallery-animation";
import { INSTAGRAM_URL, PHOTOS } from "@/lib/content";

const photos = PHOTOS;

export function Photography() {
  return (
    <section id="photography" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          index="05"
          kicker="Creative"
          title="Photography"
          lede="Outside of code, I shoot. Hover to explore, click to expand."
        />

        <BlurFade delay={0.1}>
          <ExpandableGallery images={photos} className="mb-10" />
        </BlurFade>

        <BlurFade delay={0.2}>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="key mt-4"
          >
            <InstagramIcon className="w-4 h-4" />
            @y.gpics on Instagram
          </a>
        </BlurFade>
      </div>
    </section>
  );
}
