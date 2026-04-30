"use client";

import { useEffect, useRef, useState } from "react";
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
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  useGSAP(
    () => {
      if (!users.length) return;

      gsap.fromTo(
        ".leaderboard-row",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.045,
          ease: "power2.out",
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
        Aun no hay predicciones calificadas.
      </p>
    );
  }

  return (
    <div ref={tableRef} className="rounded-2xl border border-white/12 bg-white/10 p-2 backdrop-blur-sm">
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
          {users.map((user) => (
            <TableRow key={user.id} className="leaderboard-row border-white/10 text-white">
              <TableCell className="font-bold text-white">
                {user.rank <= 3 ? (
                  <span className="rank-medal text-lg">
                    {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  user.rank
                )}
              </TableCell>
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
  );
}
