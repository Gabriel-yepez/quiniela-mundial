"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

interface OtherPrediction {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  user: { name: string; image: string | null };
}

interface ApiResponse {
  locked: boolean;
  predictions: OtherPrediction[];
}

export function MatchOtherPredictions({
  matchId,
  matchStatus,
}: {
  matchId: string;
  matchStatus: string;
}) {
  const isOpen = matchStatus === "scheduled";
  const isFinished = matchStatus === "finished";
  const [predictions, setPredictions] = useState<OtherPrediction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/matches/${matchId}/predictions`);
        if (!res.ok) throw new Error("No se pudieron cargar las predicciones");
        const json: ApiResponse = await res.json();
        if (!cancelled) setPredictions(json.predictions);
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
  }, [matchId, isOpen]);

  const heading = (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
      Predicciones de otros
    </h2>
  );

  if (isOpen) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-sm text-white/65 backdrop-blur-sm">
          Las predicciones de otros se revelarán cuando cierre el partido.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-sm text-white/65 backdrop-blur-sm">
          {error}
        </p>
      </section>
    );
  }

  if (!predictions) {
    return (
      <section className="space-y-3">
        {heading}
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </section>
    );
  }

  if (predictions.length === 0) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-sm text-white/65 backdrop-blur-sm">
          Aún no hay predicciones para este partido.
        </p>
      </section>
    );
  }

  const pageCount = Math.max(1, Math.ceil(predictions.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = predictions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <section className="space-y-3">
      {heading}
      <ul className="space-y-2">
        {visible.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-sm"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={p.user.image ?? ""} />
              <AvatarFallback className="bg-white/15 text-xs text-white">
                {p.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm text-white">
              {p.user.name}
            </span>
            <span className="text-sm font-semibold tabular-nums text-white">
              {p.homeScore} - {p.awayScore}
            </span>
            {isFinished && p.points !== null && (
              <Badge
                variant="secondary"
                className="border border-white/15 bg-white/12 text-white"
              >
                {p.points} pts
              </Badge>
            )}
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-white/70">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}
    </section>
  );
}
