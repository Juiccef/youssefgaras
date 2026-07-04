"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
}

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
        isHovered ? "border-emerald-500/30" : "",
        className
      )}
      style={{
        background: isHovered
          ? `radial-gradient(350px circle at ${position.x}px ${position.y}px, rgba(16,185,129,0.10), transparent 70%), #0f0f0f`
          : "#0f0f0f",
      }}
    >
      {children}
    </div>
  );
}
