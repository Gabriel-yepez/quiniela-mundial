"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AuroraBackground } from "@/components/aurora-background";

gsap.registerPlugin(useGSAP);

const PUBLIC_POINTS = Array.from({ length: 36 }, (_, index) => {
  const column = index % 6;
  const row = Math.floor(index / 6);
  const left = 10 + (column * 15) + ((row % 2) * 3) + ((index % 3) - 1);
  const top = 16 + (row * 12) + (((column % 2) * 2) - 1);

  return {
    left,
    top,
    size: index % 5 === 0 ? 4 : 3,
    baseOpacity: index % 4 === 0 ? 0.3 : index % 3 === 0 ? 0.22 : 0.16,
    baseScale: index % 5 === 0 ? 1.15 : 1,
  };
});

export function PublicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointFieldRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const container = containerRef.current;
      const glow = glowRef.current;
      const points = Array.from(
        pointFieldRef.current?.querySelectorAll<HTMLElement>("[data-point]") ?? []
      );
      const makeContextSafe = contextSafe
        ?? (<T extends (...args: never[]) => void>(callback: T) => callback);

      if (!container || !glow) {
        return;
      }

      const mm = gsap.matchMedia();

      const resetPoints = () => {
        points.forEach((point, index) => {
          gsap.set(point, {
            opacity: PUBLIC_POINTS[index].baseOpacity,
            scale: PUBLIC_POINTS[index].baseScale,
          });
        });
      };

      resetPoints();
      gsap.set(glow, {
        x: container.clientWidth / 2,
        y: container.clientHeight / 2,
        opacity: 0,
      });

      mm.add(
        {
          finePointer: "(pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { finePointer = false, reduceMotion = false } =
            (context.conditions ?? {}) as {
              finePointer?: boolean;
              reduceMotion?: boolean;
            };

          if (!finePointer || reduceMotion) {
            gsap.set(glow, { opacity: 0 });
            resetPoints();
            return;
          }

          const glowXTo = gsap.quickTo(glow, "x", { duration: 0.28, ease: "power3.out" });
          const glowYTo = gsap.quickTo(glow, "y", { duration: 0.28, ease: "power3.out" });
          let frameId: number | null = null;
          let pendingPointer: { x: number; y: number; width: number; height: number } | null = null;

          const updatePoints = (localX: number, localY: number, width: number, height: number) => {
            const effectRadius = 170;

            points.forEach((point, index) => {
              const pointConfig = PUBLIC_POINTS[index];
              const pointX = (width * pointConfig.left) / 100;
              const pointY = (height * pointConfig.top) / 100;
              const distance = Math.hypot(localX - pointX, localY - pointY);
              const intensity = Math.max(0, 1 - (distance / effectRadius));

              gsap.set(point, {
                opacity: Math.min(0.88, pointConfig.baseOpacity + (intensity * 0.48)),
                scale: pointConfig.baseScale + (intensity * 0.8),
              });
            });
          };

          const flushPointerEffect = () => {
            frameId = null;

            if (!pendingPointer) {
              return;
            }

            glowXTo(pendingPointer.x);
            glowYTo(pendingPointer.y);
            updatePoints(pendingPointer.x, pendingPointer.y, pendingPointer.width, pendingPointer.height);
          };

          const schedulePointerEffect = (x: number, y: number, width: number, height: number) => {
            pendingPointer = { x, y, width, height };

            if (frameId !== null) {
              return;
            }

            frameId = window.requestAnimationFrame(flushPointerEffect);
          };

          const handlePointerMove = makeContextSafe((event: PointerEvent) => {
            const rect = container.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;

            schedulePointerEffect(localX, localY, rect.width, rect.height);
          });

          const handlePointerEnter = makeContextSafe((event: PointerEvent) => {
            const rect = container.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;

            gsap.to(glow, { opacity: 0.75, duration: 0.24, ease: "power2.out" });
            schedulePointerEffect(localX, localY, rect.width, rect.height);
          });

          const handlePointerLeave = makeContextSafe(() => {
            if (frameId !== null) {
              window.cancelAnimationFrame(frameId);
              frameId = null;
            }

            pendingPointer = null;
            gsap.to(glow, { opacity: 0, duration: 0.35, ease: "power2.out" });
            resetPoints();
          });

          container.addEventListener("pointerenter", handlePointerEnter);
          container.addEventListener("pointermove", handlePointerMove);
          container.addEventListener("pointerleave", handlePointerLeave);

          return () => {
            if (frameId !== null) {
              window.cancelAnimationFrame(frameId);
            }

            container.removeEventListener("pointerenter", handlePointerEnter);
            container.removeEventListener("pointermove", handlePointerMove);
            container.removeEventListener("pointerleave", handlePointerLeave);
          };
        },
        containerRef
      );

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      data-testid="public-background"
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <AuroraBackground />

      <div ref={pointFieldRef} className="absolute inset-0">
        {PUBLIC_POINTS.map((point, index) => (
          <div
            key={index}
            data-point
            className="absolute rounded-full bg-white will-change-transform"
            style={{
              left: `${point.left}%`,
              top: `${point.top}%`,
              width: point.size,
              height: point.size,
              opacity: point.baseOpacity,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-48 w-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 32%, rgba(255,255,255,0.03) 52%, transparent 74%)",
          filter: "blur(22px)",
          opacity: 0,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
