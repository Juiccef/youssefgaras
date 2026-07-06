import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youssef Garas — Software Engineer",
  description:
    "CS + Cybersecurity student at Georgia State University. Building intelligent systems at the intersection of AI, security, and full-stack engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
