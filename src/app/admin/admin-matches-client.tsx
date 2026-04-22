"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/match-constants";

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

const PAGE_SIZE = 10;

const selectClass =
  "h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AdminMatchesClient({ matches }: { matches: Match[] }) {
  const [scores, setScores] = useState<
    Record<string, { home: string; away: string }>
  >({});
  const [loading, setLoading] = useState<string | null>(null);

  // Filters
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Derived filter options
  const groups = useMemo(
    () =>
      [...new Set(matches.filter((m) => m.group).map((m) => m.group!))].sort(),
    [matches]
  );
  const stages = useMemo(
    () => [...new Set(matches.map((m) => m.stage))],
    [matches]
  );
  const statuses = useMemo(
    () => [...new Set(matches.map((m) => m.status))],
    [matches]
  );

  // Filtered matches
  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (filterGroup !== "all" && m.group !== filterGroup) return false;
      if (filterStage !== "all" && m.stage !== filterStage) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          m.homeTeam?.name.toLowerCase().includes(q) ||
          m.homeTeam?.code.toLowerCase().includes(q) ||
          m.awayTeam?.name.toLowerCase().includes(q) ||
          m.awayTeam?.code.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q) ||
          String(m.matchNumber).includes(q);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [matches, filterGroup, filterStage, filterStatus, search]);

  // Pagination
  const { totalPages, safePage, paginatedMatches } = useMemo(() => {
    const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safe = Math.min(page, total);
    return {
      totalPages: total,
      safePage: safe,
      paginatedMatches: filtered.slice((safe - 1) * PAGE_SIZE, safe * PAGE_SIZE),
    };
  }, [filtered, page]);

  // Reset page when filters change
  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setFilterGroup("all");
    setFilterStage("all");
    setFilterStatus("all");
    setSearch("");
    setPage(1);
  }

  const hasActiveFilters =
    filterGroup !== "all" ||
    filterStage !== "all" ||
    filterStatus !== "all" ||
    search !== "";

  function getScore(matchId: string) {
    return scores[matchId] ?? { home: "", away: "" };
  }

  async function handleSaveResult(matchId: string) {
    const s = getScore(matchId);
    if (s.home === "" || s.away === "") {
      toast.error("Ingresa ambos marcadores", {
        description: "Debes llenar el marcador de ambos equipos.",
      });
      return;
    }

    setLoading(matchId);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(s.home, 10),
          awayScore: parseInt(s.away, 10),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar resultado", {
          description: "No se pudo guardar el resultado del partido.",
        });
        return;
      }

      const data = await res.json();
      toast.success("Resultado guardado", {
        description: `Se calificaron ${data.scored} predicciones correctamente.`,
      });
    } catch {
      toast.error("Error de conexion", {
        description: "No se pudo conectar al servidor. Intenta mas tarde.",
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleLock(matchId: string) {
    setLoading(matchId);
    try {
      const res = await fetch("/api/admin/matches/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });

      if (!res.ok) {
        toast.error("Error al bloquear partido", {
          description: "No se pudo bloquear. Intenta de nuevo.",
        });
        return;
      }

      toast.success("Partido bloqueado");
    } catch {
      toast.error("Error de conexion", {
        description: "No se pudo conectar al servidor. Intenta mas tarde.",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-muted/40 p-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Equipo, sede, #partido..."
              value={search}
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Group */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Grupo
          </label>
          <select
            value={filterGroup}
            onChange={(e) => updateFilter(setFilterGroup, e.target.value)}
            className={selectClass}
          >
            <option value="all">Todos</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                Grupo {g}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Fase
          </label>
          <select
            value={filterStage}
            onChange={(e) => updateFilter(setFilterStage, e.target.value)}
            className={selectClass}
          >
            <option value="all">Todas</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => updateFilter(setFilterStatus, e.target.value)}
            className={selectClass}
          >
            <option value="all">Todos</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "partido" : "partidos"}
        {hasActiveFilters ? " encontrados" : " en total"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron partidos con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedMatches.map((match) => {
                const s = getScore(match.id);
                return (
                  <TableRow key={match.id}>
                    <TableCell className="text-muted-foreground">
                      {match.matchNumber}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {match.homeTeam?.flagUrl && (
                          <img
                            src={match.homeTeam.flagUrl}
                            alt={match.homeTeam.code}
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                        )}
                        {match.homeTeam?.code ?? "TBD"}
                        <span className="text-muted-foreground">vs</span>
                        {match.awayTeam?.flagUrl && (
                          <img
                            src={match.awayTeam.flagUrl}
                            alt={match.awayTeam.code}
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                        )}
                        {match.awayTeam?.code ?? "TBD"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.group ? (
                        <Badge variant="outline">Grupo {match.group}</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {STAGE_LABELS[match.stage] ?? match.stage}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          match.status === "finished"
                            ? "default"
                            : match.status === "locked"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {STATUS_LABELS[match.status] ?? match.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {match.status === "finished" ? (
                        <span className="font-bold">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <NumberInput
                            className="w-14 text-center"
                            value={s.home}
                            onChange={(value) =>
                              setScores((prev) => ({
                                ...prev,
                                [match.id]: { ...s, home: value },
                              }))
                            }
                          />
                          <span>-</span>
                          <NumberInput
                            className="w-14 text-center"
                            value={s.away}
                            onChange={(value) =>
                              setScores((prev) => ({
                                ...prev,
                                [match.id]: { ...s, away: value },
                              }))
                            }
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {match.status !== "finished" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveResult(match.id)}
                              disabled={loading === match.id}
                            >
                              Guardar
                            </Button>
                            {match.status === "scheduled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLock(match.id)}
                                disabled={loading === match.id}
                              >
                                Bloquear
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Pagina {safePage} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - safePage) <= 1;
              })
              .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "ellipsis" ? (
                  <span key={`e${i}`} className="px-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={safePage === item ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
            >
              Ultima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
