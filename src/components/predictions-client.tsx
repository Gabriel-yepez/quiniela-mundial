"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/api-cache";

interface PredictionRow {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  match: {
    matchNumber: number;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    homeTeam: { code: string } | null;
    awayTeam: { code: string } | null;
  };
}

interface ApiResponse {
  predictions: PredictionRow[];
  totalPoints: number;
}

export function PredictionsClient() {
  const { data, error } = useApiQuery<ApiResponse>("/api/predictions");

  if (error) {
    return (
      <p className="py-12 text-center text-white/65">
        No se pudieron cargar tus predicciones
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const { predictions, totalPoints } = data;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Mis Predicciones</h1>
        <div className="text-right">
          <p className="text-sm text-white/65">Total</p>
          <p className="text-2xl font-semibold text-white">{totalPoints} pts</p>
        </div>
      </div>

      {predictions.length === 0 ? (
        <p className="py-12 text-center text-white/60">
          Aún no has hecho predicciones. Ve a la sección de partidos para
          comenzar.
        </p>
      ) : (
        <div className="rounded-2xl border border-white/12 bg-white/10 p-2 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white/70">#</TableHead>
                <TableHead className="text-white/70">Partido</TableHead>
                <TableHead className="text-center text-white/70">Tu predicción</TableHead>
                <TableHead className="text-center text-white/70">Resultado</TableHead>
                <TableHead className="text-right text-white/70">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((pred) => (
                <TableRow key={pred.id} className="border-white/10 text-white">
                  <TableCell className="text-white/55">
                    {pred.match.matchNumber}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {pred.match.homeTeam?.code ?? "TBD"} vs{" "}
                    {pred.match.awayTeam?.code ?? "TBD"}
                  </TableCell>
                  <TableCell className="text-center">
                    {pred.homeScore} - {pred.awayScore}
                  </TableCell>
                  <TableCell className="text-center">
                    {pred.match.status === "finished" ? (
                      `${pred.match.homeScore} - ${pred.match.awayScore}`
                    ) : (
                      <span className="text-white/55">Pendiente</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {pred.points !== null ? (
                      <Badge variant={pred.points > 0 ? "default" : "secondary"}>
                        {pred.points > 0 ? `+${pred.points}` : "0"}
                      </Badge>
                    ) : (
                      <span className="text-white/55">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
