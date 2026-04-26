"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

const WORLD_CUP_DATE = new Date("2026-06-11T00:00:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SERVER_SNAPSHOT: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

let cachedSnapshot = SERVER_SNAPSHOT;
let cachedSecond = -1;

function getSnapshot(): TimeLeft {
  const now = Math.floor(Date.now() / 1000);
  if (now !== cachedSecond) {
    cachedSecond = now;
    const diff = Math.max(0, Math.floor((WORLD_CUP_DATE - now * 1000) / 1000));
    cachedSnapshot = {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): TimeLeft {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void) {
  const interval = setInterval(onStoreChange, 1000);
  return () => clearInterval(interval);
}

function useCountdown(): TimeLeft {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function HomePage() {
  const timeLeft = useCountdown();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating particles
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        Array.from(particles).forEach((particle) => {
          gsap.set(particle, {
            x: gsap.utils.random(0, window.innerWidth),
            y: gsap.utils.random(0, window.innerHeight),
            opacity: gsap.utils.random(0.1, 0.4),
            scale: gsap.utils.random(0.3, 1),
          });
          gsap.to(particle, {
            y: `-=${gsap.utils.random(100, 300)}`,
            x: `+=${gsap.utils.random(-80, 80)}`,
            opacity: 0,
            duration: gsap.utils.random(3, 6),
            repeat: -1,
            ease: "none",
            delay: gsap.utils.random(0, 3),
          });
        });
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Title: scale up with bounce
      tl.fromTo(
        titleRef.current,
        { opacity: 0, scale: 0.5, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
      );

      // Subtitle: slide in from left
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.6 },
        "-=0.3"
      );

      // Countdown cards: stagger from below
      tl.fromTo(
        ".countdown-item",
        { opacity: 0, y: 60, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.4)",
        },
        "-=0.2"
      );

      // Info text: fade in
      tl.fromTo(
        infoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.1"
      );

      // Buttons: slide up with stagger
      tl.fromTo(
        ".action-btn",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
        "-=0.2"
      );

      // Continuous pulse on countdown
      gsap.to(countdownRef.current, {
        boxShadow: "0 0 42px rgba(115, 115, 115, 0.22)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-100 px-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_80%_15%,rgba(212,212,212,0.3),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(229,229,229,0.45),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(163,163,163,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(163,163,163,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-neutral-400/30"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg space-y-8 text-center">
        <h1
          ref={titleRef}
          className="text-5xl font-semibold tracking-[-0.035em] text-neutral-900 opacity-0 sm:text-7xl"
        >
          Quiniela Mundial
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl font-medium text-neutral-600 opacity-0 sm:text-2xl"
        >
          Quiniela del Mundial de Futbol
        </p>

        <div
          ref={countdownRef}
          className="rounded-3xl border border-white/70 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 p-8 text-white shadow-[0_14px_48px_-18px_rgba(10,10,10,0.6)] backdrop-blur-sm"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-300">
            Faltan
          </p>
          <div className="flex justify-center gap-3 sm:gap-5">
            <CountdownUnit value={timeLeft.days} label="Dias" />
            <span className="mt-1 self-start text-3xl font-bold text-neutral-300">
              :
            </span>
            <CountdownUnit value={timeLeft.hours} label="Horas" />
            <span className="mt-1 self-start text-3xl font-bold text-neutral-300">
              :
            </span>
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <span className="mt-1 self-start text-3xl font-bold text-neutral-300">
              :
            </span>
            <CountdownUnit value={timeLeft.seconds} label="Seg" />
          </div>
        </div>

        <p ref={infoRef} className="text-sm text-neutral-600 opacity-0">
          11 de junio - 19 de julio, 2026 &middot; USA, Mexico y Canada
        </p>

        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/matches" className="action-btn opacity-0">
            <Button
              size="lg"
              className="h-12 w-full min-w-[160px] border border-neutral-800 bg-neutral-900 text-base text-white hover:bg-neutral-800"
            >
              Ver partidos
            </Button>
          </Link>
          <Link href="/leaderboard" className="action-btn opacity-0">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full min-w-[160px] border-neutral-300 bg-white/75 text-base text-neutral-900 hover:bg-neutral-100"
            >
              Ver ranking
            </Button>
          </Link>
          <Link href="/rules" className="action-btn opacity-0">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full min-w-[160px] border-neutral-300 bg-white/75 text-base text-neutral-900 hover:bg-neutral-100"
            >
              Ver reglas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-item flex flex-col items-center opacity-0">
      <span className="text-4xl sm:text-5xl font-bold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wide text-neutral-300">
        {label}
      </span>
    </div>
  );
}
