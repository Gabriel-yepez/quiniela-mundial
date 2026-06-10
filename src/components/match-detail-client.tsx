"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "@/components/flag";
import { PredictionForm } from "@/components/prediction-form";

interface Team {
  name: string;
  code: string;
  flagUrl: string | null;
}

interface MatchDetail {
  id: string;
  matchNumber: number;
  group: string | null;
  dateTime: string;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
  extraTimeHomeScore: number | null;
  extraTimeAwayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  status: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
}

interface PredictionDetail {
  homeScore: number;
  awayScore: number;
  points: number | null;
}

interface ApiResponse {
  match: MatchDetail;
  prediction: PredictionDetail | null;
}

export function MatchDetailClient({ matchId }: { matchId: string }) {
  const { status } = useSession();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.status === 404) {
          notFound();
          return;
        }
        if (!res.ok) throw new Error("No se pudo cargar el partido");
        const json: ApiResponse = await res.json();
        if (!cancelled) setData(json);
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
  }, [matchId]);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/12 bg-white/10 px-6 py-12 text-center text-white/65 backdrop-blur-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const { match, prediction } = data;
  const date = new Date(match.dateTime);
  const isFinished = match.status === "finished";
  const canPredict = match.status === "scheduled";
  const isAuthenticated = status === "authenticated";

  return (
    <>
      <div className="space-y-2 text-center">
        {match.group && (
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            Grupo {match.group}
          </Badge>
        )}
        <p className="text-sm text-white/70">
          {date.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-white/55">{match.venue}</p>
      </div>

      <div className="flex items-center justify-center gap-6 py-4">
        <div className="space-y-2 text-center">
          {match.homeTeam && (
            <Flag
              url={match.homeTeam.flagUrl}
              code={match.homeTeam.code}
              alt={match.homeTeam.name}
              className="mx-auto shadow-sm"
            />
          )}
          <p className="text-2xl font-bold">
            {match.homeTeam?.name ?? "Por definir"}
          </p>
          <p className="text-sm text-white/60">
            {match.homeTeam?.code ?? "TBD"}
          </p>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
          {isFinished ? (
            <div className="flex flex-col">
              <span className="text-3xl font-semibold text-white leading-tight">
                {match.homeScore} - {match.awayScore}
              </span>
              {match.extraTimeHomeScore != null &&
                match.extraTimeAwayScore != null && (
                  <span className="text-xs text-white/65 mt-1">
                    Tiempo extra: +{match.extraTimeHomeScore} - +
                    {match.extraTimeAwayScore}
                  </span>
                )}
              {match.penaltyHomeScore != null &&
                match.penaltyAwayScore != null && (
                  <span className="text-xs text-white/65">
                    Penales: {match.penaltyHomeScore} -{" "}
                    {match.penaltyAwayScore}
                  </span>
                )}
            </div>
          ) : (
            <span className="text-xl text-white/50">vs</span>
          )}
        </div>

        <div className="space-y-2 text-center">
          {match.awayTeam && (
            <Flag
              url={match.awayTeam.flagUrl}
              code={match.awayTeam.code}
              alt={match.awayTeam.name}
              className="mx-auto shadow-sm"
            />
          )}
          <p className="text-2xl font-bold">
            {match.awayTeam?.name ?? "Por definir"}
          </p>
          <p className="text-sm text-white/60">
            {match.awayTeam?.code ?? "TBD"}
          </p>
        </div>
      </div>

      {isFinished && (
        <Badge className="mx-auto block w-fit border border-white/15 bg-white/12 text-white" variant="secondary">
          Partido finalizado
        </Badge>
      )}

      {isAuthenticated && (
        <PredictionForm
          matchId={match.id}
          homeTeamName={match.homeTeam?.name ?? "Local"}
          awayTeamName={match.awayTeam?.name ?? "Visitante"}
          disabled={!canPredict}
          initialHome={prediction?.homeScore}
          initialAway={prediction?.awayScore}
        />
      )}

      {prediction && isFinished && (
        <div className="space-y-1 rounded-lg border border-white/15 bg-white/10 p-4 text-center backdrop-blur-sm">
          <p className="text-sm text-white/65">
            Tu predicción: {prediction.homeScore} - {prediction.awayScore}
          </p>
          <p className="text-lg font-bold">
            {prediction.points !== null
              ? `${prediction.points} puntos`
              : "Pendiente de calificar"}
          </p>
        </div>
      )}
    </>
  );
}
