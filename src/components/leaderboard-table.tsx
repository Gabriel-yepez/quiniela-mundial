"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/api-cache";

gsap.registerPlugin(useGSAP);

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  totalPredictions: number;
}

export function LeaderboardTable() {
  const { data } = useApiQuery<LeaderboardUser[]>("/api/leaderboard");
  const loading = data === null;
  const users = data ?? [];
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!users.length) return;

      gsap.fromTo(
        ".podium-card",
        { opacity: 0, y: 18, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.1,
          ease: "back.out(1.6)",
          clearProps: "transform",
        }
      );

      gsap.fromTo(
        ".leaderboard-row",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.045,
          ease: "power2.out",
          delay: 0.2,
          clearProps: "transform",
        }
      );

      gsap.fromTo(
        ".rank-medal",
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: "back.out(2)",
          delay: 0.12,
        }
      );
    },
    { scope: tableRef, dependencies: [users.length], revertOnUpdate: true }
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aún no hay predicciones calificadas.
      </p>
    );
  }

  const podium = users.slice(0, 3);
  const rest = users.slice(3);
  const podiumOrder: LeaderboardUser[] = [];
  if (podium[1]) podiumOrder.push(podium[1]);
  if (podium[0]) podiumOrder.push(podium[0]);
  if (podium[2]) podiumOrder.push(podium[2]);

  return (
    <div ref={tableRef} className="space-y-6">
      {podium.length > 0 && (
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
          {podiumOrder.map((user) => (
            <PodiumCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/10 p-2 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-white/70">#</TableHead>
                <TableHead className="text-white/70">Jugador</TableHead>
                <TableHead className="text-right text-white/70">Predicciones</TableHead>
                <TableHead className="text-right text-white/70">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map((user) => (
                <TableRow key={user.id} className="leaderboard-row border-white/10 text-white">
                  <TableCell className="font-bold text-white">{user.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.image ?? ""} />
                        <AvatarFallback className="bg-white/15 text-xs text-white">
                          {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-white">
                        {user.name ?? "Anonimo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.totalPredictions}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {user.totalPoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const PODIUM_STYLES: Record<number, {
  medal: string;
  height: string;
  ring: string;
  glow: string;
  badge: string;
  label: string;
}> = {
  1: {
    medal: "🥇",
    height: "min-h-44 sm:min-h-52",
    ring: "ring-2 ring-yellow-300/70",
    glow: "from-yellow-300/30 via-amber-200/15 to-transparent",
    badge: "bg-yellow-300 text-neutral-900",
    label: "1°",
  },
  2: {
    medal: "🥈",
    height: "min-h-36 sm:min-h-44",
    ring: "ring-2 ring-slate-200/60",
    glow: "from-slate-200/25 via-slate-100/10 to-transparent",
    badge: "bg-slate-200 text-neutral-900",
    label: "2°",
  },
  3: {
    medal: "🥉",
    height: "min-h-32 sm:min-h-40",
    ring: "ring-2 ring-amber-500/60",
    glow: "from-amber-500/25 via-amber-400/10 to-transparent",
    badge: "bg-amber-500 text-neutral-900",
    label: "3°",
  },
};

function PodiumCard({ user }: { user: LeaderboardUser }) {
  const style = PODIUM_STYLES[user.rank] ?? PODIUM_STYLES[3];

  return (
    <div
      className={`podium-card relative flex flex-col items-center justify-end gap-2 overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-2 py-4 text-center backdrop-blur-sm sm:px-4 ${style.height}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b ${style.glow}`}
      />
      <span
        className={`absolute right-2 top-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
      >
        {style.label}
      </span>
      <div className="relative flex flex-col items-center gap-2">
        <div className="rank-medal text-2xl sm:text-3xl" aria-hidden>
          {style.medal}
        </div>
        <Avatar className={`h-12 w-12 sm:h-16 sm:w-16 ${style.ring}`}>
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback className="bg-white/15 text-sm text-white">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <p className="line-clamp-1 max-w-[10ch] text-xs font-medium text-white sm:max-w-[14ch] sm:text-sm">
          {user.name ?? "Anonimo"}
        </p>
        <p className="text-base font-bold leading-none text-white sm:text-lg">
          {user.totalPoints}
          <span className="ml-1 text-[10px] font-normal text-white/60 sm:text-xs">
            pts
          </span>
        </p>
        <p className="text-[10px] text-white/55 sm:text-xs">
          {user.totalPredictions} predicciones
        </p>
      </div>
    </div>
  );
}
