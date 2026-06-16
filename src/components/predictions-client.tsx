"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/api-cache";

const PAGE_SIZE = 10;

/** Normaliza para buscar sin distinguir mayúsculas ni acentos. */
function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

interface PredictionRow {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  match: {
    id: string;
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
  const router = useRouter();
  const { data, error } = useApiQuery<ApiResponse>("/api/predictions");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const predictions = useMemo(() => data?.predictions ?? [], [data]);

  const filtered = useMemo(() => {
    const term = normalizeForSearch(search);
    if (!term) return predictions;
    return predictions.filter((pred) => {
      const home = pred.match.homeTeam?.code ?? "TBD";
      const away = pred.match.awayTeam?.code ?? "TBD";
      const haystack = normalizeForSearch(
        `${home} ${away} ${home} vs ${away} #${pred.match.matchNumber}`
      );
      return haystack.includes(term);
    });
  }, [predictions, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Si la página actual quedó fuera de rango tras filtrar, mostramos la última válida.
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

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

  const { totalPoints } = data;

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
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar partido..."
              aria-label="Buscar partido"
              className="border-white/12 bg-white/10 pl-9 text-white placeholder:text-white/50"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/60">
              No se encontraron partidos.
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
                  {visible.map((pred) => (
                    <TableRow
                      key={pred.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/matches/${pred.match.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/matches/${pred.match.id}`);
                        }
                      }}
                      className="cursor-pointer border-white/10 text-white transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
                    >
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

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1 border-white/12 bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-white/65">
                Página {currentPage} de {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="gap-1 border-white/12 bg-white/10 text-white hover:bg-white/20"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
