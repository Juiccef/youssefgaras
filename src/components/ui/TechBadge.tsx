/* eslint-disable @next/next/no-img-element */

const techIcons: Record<string, string> = {
  React: "react/react-original.svg",
  "Node.js": "nodejs/nodejs-original.svg",
  Supabase: "supabase/supabase-original.svg",
  Python: "python/python-original.svg",
  OpenCV: "opencv/opencv-original.svg",
  TensorFlow: "tensorflow/tensorflow-original.svg",
  Figma: "figma/figma-original.svg",
  HTML: "html5/html5-original.svg",
  CSS: "css3/css3-original.svg",
  JavaScript: "javascript/javascript-original.svg",
  "Next.js": "nextjs/nextjs-original.svg",
};

interface TechBadgeProps {
  tech: string;
}

export function TechBadge({ tech }: TechBadgeProps) {
  const icon = techIcons[tech];

  if (!icon) {
    return (
      <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {tech}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-white/[0.04] text-white/75 border border-white/10">
      <img
        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}`}
        alt=""
        className="w-3.5 h-3.5"
      />
      {tech}
    </span>
  );
}
