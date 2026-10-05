"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
}

// A card whose face lights up under the mouse, in the colour of the section
// it's in (--sec).
export function MagicCard({ children, className }: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 p-6 transition-colors duration-300",
        isHovered ? "border-sec/40" : "",
        className
      )}
      style={{
        background: isHovered
          ? `radial-gradient(350px circle at ${position.x}px ${position.y}px, color-mix(in srgb, var(--sec, #e6d9b5) 10%, transparent), transparent 70%), #0a0d19`
          : "#0a0d19",
      }}
    >
      {children}
    </div>
  );
}
