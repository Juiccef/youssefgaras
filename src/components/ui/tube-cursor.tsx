"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type TubesCursorProps = {
  title?: string;
  subtitle?: string;
  caption?: string;
  initialColors?: string[];
  lightColors?: string[];
  lightIntensity?: number;
  /** 0–1, dims the WebGL canvas so it frames content instead of covering it */
  canvasOpacity?: number;
  titleSize?: string;
  subtitleSize?: string;
  captionSize?: string;
  enableRandomizeOnClick?: boolean;
  className?: string;
  height?: string;
  children?: ReactNode;
};

const TubesCursor = ({
  title,
  subtitle,
  caption,
  initialColors = ["#f967fb", "#53bc28", "#6958d5"],
  lightColors = ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
  lightIntensity = 200,
  canvasOpacity = 1,
  titleSize = "text-[80px]",
  subtitleSize = "text-[60px]",
  captionSize = "text-base",
  enableRandomizeOnClick = false,
  className = "",
  height = "h-screen",
  children,
}: TubesCursorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appRef = useRef<any>(null);

  useEffect(() => {
    let removeClick: (() => void) | null = null;
    let destroyed = false;

    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await (Function('return import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js")')() as Promise<any>).catch(() => null);
      if (!mod) return; // CDN unavailable — the CSS glow fallback carries the hero
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const TubesCursorCtor = (mod as any).default ?? mod;

      if (!canvasRef.current || destroyed) return;

      const app = TubesCursorCtor(canvasRef.current, {
        tubes: {
          colors: initialColors,
          lights: {
            intensity: lightIntensity,
            colors: lightColors,
          },
        },
      });

      appRef.current = app;

      // Library forces position:fixed on the canvas — override so it scrolls with the page
      const forceAbsolute = () => {
        if (!canvasRef.current) return;
        canvasRef.current.style.setProperty("position", "absolute", "important");
        canvasRef.current.style.setProperty("top", "0", "important");
        canvasRef.current.style.setProperty("left", "0", "important");
        canvasRef.current.style.setProperty("width", "100%", "important");
        canvasRef.current.style.setProperty("height", "100%", "important");
        canvasRef.current.style.setProperty("z-index", "0", "important");
        canvasRef.current.style.setProperty("opacity", String(canvasOpacity), "important");
      };
      forceAbsolute();
      // Re-apply if the library mutates style on resize
      const observer = new MutationObserver(forceAbsolute);
      observer.observe(canvasRef.current!, { attributes: true, attributeFilter: ["style"] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (appRef.current as any).__styleObserver = observer;

      if (enableRandomizeOnClick) {
        const handler = () => {
          const colors = randomColors(initialColors.length);
          const lights = randomColors(lightColors.length);
          app.tubes.setColors(colors);
          app.tubes.setLightsColors(lights);
        };
        document.body.addEventListener("click", handler);
        removeClick = () =>
          document.body.removeEventListener("click", handler);
      }
    })();

    return () => {
      destroyed = true;
      if (removeClick) removeClick();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (appRef.current as any)?.__styleObserver?.disconnect?.();
        appRef.current?.dispose?.();
        appRef.current = null;
      } catch {
        // ignore
      }
    };
  }, [initialColors, lightColors, lightIntensity, enableRandomizeOnClick, canvasOpacity]);

  return (
    <div className={`relative ${height} w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        style={{ opacity: canvasOpacity }}
      />

      {title || subtitle || caption ? (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 select-none">
          {title && (
            <h1 className={`m-0 p-0 text-white font-bold uppercase leading-none drop-shadow-[0_0_20px_rgba(0,0,0,1)] ${titleSize}`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <h2 className={`m-0 p-0 text-white font-medium uppercase leading-none drop-shadow-[0_0_20px_rgba(0,0,0,1)] ${subtitleSize}`}>
              {subtitle}
            </h2>
          )}
          {caption && (
            <p className={`m-0 p-0 text-white/70 leading-none drop-shadow-[0_0_20px_rgba(0,0,0,1)] ${captionSize}`}>
              {caption}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      ) : (
        children && <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
};

function randomColors(count: number) {
  return new Array(count).fill(0).map(
    () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
  );
}

export { TubesCursor };
