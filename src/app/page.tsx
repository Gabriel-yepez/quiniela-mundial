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
        boxShadow: "0 0 40px rgba(29, 78, 216, 0.3)",
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
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden"
    >
      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-blue-400/30"
          />
        ))}
      </div>

      <div className="text-center space-y-8 max-w-lg relative z-10">
        <h1
          ref={titleRef}
          className="text-5xl sm:text-7xl font-bold tracking-tight text-blue-900 opacity-0"
        >
          Quiniela Mundial
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl text-blue-400 font-medium opacity-0"
        >
          Quiniela del Mundial de Futbol
        </p>

        <div
          ref={countdownRef}
          className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-2xl p-8 shadow-xl"
        >
          <p className="text-sm text-blue-200 uppercase tracking-widest mb-4">
            Faltan
          </p>
          <div className="flex justify-center gap-3 sm:gap-5">
            <CountdownUnit value={timeLeft.days} label="Dias" />
            <span className="text-3xl font-bold text-blue-300 self-start mt-1">
              :
            </span>
            <CountdownUnit value={timeLeft.hours} label="Horas" />
            <span className="text-3xl font-bold text-blue-300 self-start mt-1">
              :
            </span>
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <span className="text-3xl font-bold text-blue-300 self-start mt-1">
              :
            </span>
            <CountdownUnit value={timeLeft.seconds} label="Seg" />
          </div>
        </div>

        <p ref={infoRef} className="text-blue-400 text-sm opacity-0">
          11 de junio - 19 de julio, 2026 &middot; USA, Mexico y Canada
        </p>

        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/matches" className="action-btn opacity-0">
            <Button size="lg" className="w-full min-w-[160px] h-12 text-base">
              Ver partidos
            </Button>
          </Link>
          <Link href="/leaderboard" className="action-btn opacity-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full min-w-[160px] h-12 text-base"
            >
              Ver ranking
            </Button>
          </Link>
          <Link href="/rules" className="action-btn opacity-0">
            <Button
              variant="outline"
              size="lg"
              className="w-full min-w-[160px] h-12 text-base"
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
      <span className="text-xs text-blue-300 uppercase tracking-wide mt-1">
        {label}
      </span>
    </div>
  );
}
