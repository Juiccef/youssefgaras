import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for the classic view's name and section titles. The width
// axis is what makes it a poster face: set narrow and black (.display in
// globals.css).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// The picture a shared link shows is the room: opengraph-image.png and
// twitter-image.png next to this file (Next adds the tags).
export const metadata: Metadata = {
  metadataBase: new URL("https://youssefgaras.vercel.app"),
  title: "Youssef Garas | Cybersecurity Engineer",
  description:
    "Georgia State Computer Science graduate (Cybersecurity), CCNA and Security+, and an endpoint intern at McKenney's. Step inside my homelab and see my projects and experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // the page is what loads, except a first visit's opening (lab/intro-gate.ts); stepping into the room changes it (lab/view.ts)
      data-view="classic"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#080808] text-[#f0f0f0]">
        {/* Pre-hydration check: hide the boot intro instantly for repeat
            visitors and reduced-motion users — no flash before React loads. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('yg-boot')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.boot='seen'}catch(e){document.documentElement.dataset.boot='seen'}",
          }}
        />
        <noscript>
          <style>{`#boot-intro{display:none}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
