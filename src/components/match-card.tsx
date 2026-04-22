"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/match-constants";

interface MatchCardProps {
  match: {
    id: string;
    matchNumber: number;
    stage: string;
    group: string | null;
    dateTime: string;
    venue: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    homeTeam: { name: string; code: string; flagUrl: string | null } | null;
    awayTeam: { name: string; code: string; flagUrl: string | null } | null;
  };
  prediction?: {
    homeScore: number;
    awayScore: number;
    points: number | null;
  } | null;
}

export function MatchCard({ match, prediction }: MatchCardProps) {
  const isFinished = match.status === "finished";
  const isLocked = match.status === "locked";
  const date = new Date(match.dateTime);

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md hover:shadow-blue-100 transition-shadow cursor-pointer border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {date.toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div className="flex gap-1">
              {match.group && (
                <Badge variant="outline" className="text-xs">
                  Grupo {match.group}
                </Badge>
              )}
              {isFinished && (
                <Badge variant="secondary" className="text-xs">
                  {STATUS_LABELS["finished"]}
                </Badge>
              )}
              {isLocked && (
                <Badge variant="destructive" className="text-xs">
                  {STATUS_LABELS["locked"]}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center justify-end gap-2">
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {match.homeTeam?.name ?? "Por definir"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.homeTeam?.code ?? "TBD"}
                </p>
              </div>
              {match.homeTeam?.flagUrl && (
                <img
                  src={match.homeTeam.flagUrl}
                  alt={match.homeTeam.code}
                  className="w-8 h-6 object-cover rounded-sm shadow-sm"
                />
              )}
            </div>

            <div className="px-3 py-1 rounded-md bg-blue-50 text-center min-w-[60px]">
              {isFinished ? (
                <span className="font-bold text-lg">
                  {match.homeScore} - {match.awayScore}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">vs</span>
              )}
            </div>

            <div className="flex-1 flex items-center gap-2">
              {match.awayTeam?.flagUrl && (
                <img
                  src={match.awayTeam.flagUrl}
                  alt={match.awayTeam.code}
                  className="w-8 h-6 object-cover rounded-sm shadow-sm"
                />
              )}
              <div className="text-left">
                <p className="font-semibold text-sm">
                  {match.awayTeam?.name ?? "Por definir"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.awayTeam?.code ?? "TBD"}
                </p>
              </div>
            </div>
          </div>

          {prediction && (
            <div className="mt-3 pt-2 border-t text-center">
              <span className="text-xs text-muted-foreground">
                Tu prediccion: {prediction.homeScore} - {prediction.awayScore}
              </span>
              {prediction.points !== null && (
                <Badge
                  variant={prediction.points > 0 ? "default" : "secondary"}
                  className="ml-2 text-xs"
                >
                  {prediction.points > 0 ? `+${prediction.points} pts` : "0 pts"}
                </Badge>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2 text-center">
            {match.venue}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
