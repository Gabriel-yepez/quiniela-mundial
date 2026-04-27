"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
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
    const diff = Math.max(
      0,
      Math.floor((WORLD_CUP_DATE - now * 1000) / 1000)
    );
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

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-item flex flex-col items-center">
      <span className="text-4xl sm:text-5xl font-bold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wide text-neutral-300">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer() {
  const timeLeft = useCountdown();
  const countdownRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        ".countdown-item",
        { opacity: 0, y: 60, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.4)",
        }
      );

      gsap.to(countdownRef.current, {
        boxShadow: "0 0 42px rgba(115, 115, 115, 0.22)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-neutral-400/30"
          />
        ))}
      </div>

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
    </>
  );
}
