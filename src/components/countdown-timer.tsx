"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

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
  const digitRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value && digitRef.current) {
      prevRef.current = value;
      gsap.fromTo(
        digitRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.22, ease: "power3.out" }
      );
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span
        ref={digitRef}
        className="text-4xl sm:text-5xl font-bold tabular-nums leading-none"
      >
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
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(cardRef.current, {
        boxShadow: "0 0 56px rgba(99, 102, 241, 0.28), 0 0 120px rgba(139, 92, 246, 0.12)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
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
  );
}
