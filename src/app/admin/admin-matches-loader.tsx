"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/api-cache";
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
  extraTimeHomeScore: number | null;
  extraTimeAwayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  status: string;
  homeTeam: { name: string; code: string; flagUrl: string | null } | null;
  awayTeam: { name: string; code: string; flagUrl: string | null } | null;
}

export function AdminMatchesLoader() {
  const {
    data: matches,
    error,
    reload,
  } = useApiQuery<Match[]>("/api/admin/matches");

  if (error) {
    return (
      <p className="py-8 text-center text-white/65">
        No se pudieron cargar los partidos
      </p>
    );
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

  return <AdminMatchesClient matches={matches} onReload={reload} />;
}
