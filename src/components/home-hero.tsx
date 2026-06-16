"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";

gsap.registerPlugin(useGSAP);

export function HomeHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!heroRef.current) {
        return;
      }

      const prefersReducedMotion =
        typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReducedMotion) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(".hero-title",
          { opacity: 0, y: 52 },
          { opacity: 1, y: 0, duration: 0.95 }
        )
          .fromTo(".hero-subtitle",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.65 },
            "-=0.52"
          )
          .fromTo(".hero-countdown",
            { opacity: 0, y: 30, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.2)" },
            "-=0.32"
          )
          .fromTo(".hero-date",
            { opacity: 0 },
            { opacity: 1, duration: 0.5 },
            "-=0.42"
          )
          .fromTo(".hero-btn",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.52, stagger: 0.08, ease: "back.out(1.5)" },
            "-=0.28"
          );
      }
    },
    { scope: heroRef }
  );

  return (
    <div
      ref={heroRef}
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Content */}
      <div className="relative z-10 max-w-lg space-y-8 text-center">
        <h1 className="hero-title text-5xl font-semibold tracking-[-0.035em] text-white sm:text-7xl">
          Quiniela Mundial
        </h1>

        <p className="hero-subtitle text-xl font-medium text-white/65 sm:text-2xl">
          Quiniela del Mundial de Fútbol
        </p>

        <div className="hero-countdown">
          <CountdownTimer />
        </div>

        <p className="hero-date text-sm text-white/45">
          11 de junio de 2026 · Estados Unidos, México y Canadá
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/matches">
            <Button
              size="lg"
              className="hero-btn h-12 w-full min-w-[160px] bg-white text-base font-semibold text-neutral-900 hover:bg-white/90"
            >
              Ver partidos
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              variant="outline"
              size="lg"
              className="hero-btn h-12 w-full min-w-[160px] border-white/20 bg-white/8 text-base text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/35"
            >
              Ver ranking
            </Button>
          </Link>
          <Link href="/rules">
            <Button
              variant="outline"
              size="lg"
              className="hero-btn h-12 w-full min-w-[160px] border-white/20 bg-white/8 text-base text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/35"
            >
              Ver reglas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
