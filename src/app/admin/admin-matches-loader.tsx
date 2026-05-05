"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminMatchesClient } from "./admin-matches-client";

interface Match {
  id: string;
  matchNumber: number;
  stage: string;
  group: string | null;
  dateTime: string;
  venue: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  homeTeam: { name: string; code: string; flagUrl: string | null } | null;
  awayTeam: { name: string; code: string; flagUrl: string | null } | null;
}

export function AdminMatchesLoader() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/matches");
        if (!res.ok) throw new Error("No se pudieron cargar los partidos");
        const data: Match[] = await res.json();
        if (!cancelled) setMatches(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error inesperado");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="py-8 text-center text-white/65">{error}</p>;
  }

  if (!matches) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return <AdminMatchesClient matches={matches} />;
}
