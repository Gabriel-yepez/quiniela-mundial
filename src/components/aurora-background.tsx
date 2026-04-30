"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const BLOBS = [
  { color: "#4f46e5", size: 650, left: "12%",  top: "8%",  duration: 14, delay: 0   },
  { color: "#7c3aed", size: 520, left: "72%",  top: "15%", duration: 19, delay: 2.5 },
  { color: "#0ea5e9", size: 440, left: "62%",  top: "72%", duration: 13, delay: 4   },
  { color: "#06b6d4", size: 380, left: "8%",   top: "78%", duration: 17, delay: 1   },
  { color: "#6d28d9", size: 480, left: "44%",  top: "42%", duration: 22, delay: 3.5 },
  { color: "#3730a3", size: 320, left: "86%",  top: "58%", duration: 11, delay: 5   },
  { color: "#0c4a6e", size: 560, left: "30%",  top: "90%", duration: 16, delay: 7   },
] as const;

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const blobs = containerRef.current!.querySelectorAll<HTMLElement>(".aurora-blob");

      blobs.forEach((blob) => {
        const dur   = Number(blob.dataset.duration);
        const delay = Number(blob.dataset.delay);

        gsap.to(blob, {
          x: () => gsap.utils.random(-180, 180),
          y: () => gsap.utils.random(-140, 140),
          scale: () => gsap.utils.random(0.82, 1.22),
          duration: dur,
          delay,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="aurora-blob absolute rounded-full"
          data-duration={blob.duration}
          data-delay={blob.delay}
          style={{
            width:      blob.size,
            height:     blob.size,
            left:       blob.left,
            top:        blob.top,
            transform:  "translate(-50%, -50%)",
            background: `radial-gradient(circle at 38% 38%, ${blob.color}cc 0%, ${blob.color}55 38%, transparent 68%)`,
            filter:     "blur(72px)",
            willChange: "transform",
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* Vignette — darker edges keep text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 10%, rgba(3,3,18,0.82) 80%)",
        }}
      />

      {/* Subtle film grain via SVG turbulence */}
      <svg className="absolute w-0 h-0" aria-hidden>
        <defs>
          <filter id="aurora-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.68"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "url(#aurora-grain)", opacity: 0.028, background: "white" }}
      />
    </div>
  );
}
