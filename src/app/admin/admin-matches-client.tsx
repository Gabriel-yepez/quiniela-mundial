"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/flag";
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
import {
  STAGE_LABELS,
  STATUS_LABELS,
  isKnockoutStage,
} from "@/lib/match-constants";
import { invalidateApiCache } from "@/lib/api-cache";

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

interface ScoreState {
  home: string;
  away: string;
  etHome: string;
  etAway: string;
  penHome: string;
  penAway: string;
}

const EMPTY_SCORE: ScoreState = {
  home: "",
  away: "",
  etHome: "",
  etAway: "",
  penHome: "",
  penAway: "",
};

const PAGE_SIZE = 10;

const selectClass =
  "h-9 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus-visible:border-white/30 focus-visible:ring-3 focus-visible:ring-white/20 [&>option]:bg-zinc-900 [&>option]:text-white";

interface AdminMatchesClientProps {
  matches: Match[];
  onReload?: () => Promise<void>;
}

export function AdminMatchesClient({ matches, onReload }: AdminMatchesClientProps) {
  const [scores, setScores] = useState<Record<string, ScoreState>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});

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

  function getScore(matchId: string): ScoreState {
    return scores[matchId] ?? EMPTY_SCORE;
  }

  function updateScore(matchId: string, patch: Partial<ScoreState>) {
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] ?? EMPTY_SCORE), ...patch },
    }));
  }

  function parseOptionalInt(value: string): number | null {
    return value === "" ? null : parseInt(value, 10);
  }

  function toInputValue(value: number | null): string {
    return value === null ? "" : String(value);
  }

  function startEdit(match: Match) {
    setScores((prev) => ({
      ...prev,
      [match.id]: {
        home: toInputValue(match.homeScore),
        away: toInputValue(match.awayScore),
        etHome: toInputValue(match.extraTimeHomeScore),
        etAway: toInputValue(match.extraTimeAwayScore),
        penHome: toInputValue(match.penaltyHomeScore),
        penAway: toInputValue(match.penaltyAwayScore),
      },
    }));
    setEditing((prev) => ({ ...prev, [match.id]: true }));
  }

  function cancelEdit(matchId: string) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
    setScores((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  }

  async function handleSaveResult(match: Match) {
    const s = getScore(match.id);
    if (s.home === "" || s.away === "") {
      toast.error("Ingresa ambos marcadores", {
        description: "Debes llenar el marcador de ambos equipos.",
      });
      return;
    }

    const knockout = isKnockoutStage(match.stage);

    const etHome = parseOptionalInt(s.etHome);
    const etAway = parseOptionalInt(s.etAway);
    const penHome = parseOptionalInt(s.penHome);
    const penAway = parseOptionalInt(s.penAway);

    if (knockout) {
      const etPartial =
        (etHome === null) !== (etAway === null);
      const penPartial =
        (penHome === null) !== (penAway === null);
      if (etPartial || penPartial) {
        toast.error("Marcador incompleto", {
          description:
            "Si capturas tiempo extra o penales, debes llenar ambos equipos.",
        });
        return;
      }
    }

    setLoading(match.id);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          homeScore: parseInt(s.home, 10),
          awayScore: parseInt(s.away, 10),
          ...(knockout
            ? {
                extraTimeHomeScore: etHome,
                extraTimeAwayScore: etAway,
                penaltyHomeScore: penHome,
                penaltyAwayScore: penAway,
              }
            : {}),
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
      const wasEditing = editing[match.id] === true;
      toast.success(wasEditing ? "Resultado actualizado" : "Resultado guardado", {
        description: `Se recalcularon ${data.scored} predicciones correctamente.`,
      });
      cancelEdit(match.id);
      invalidateApiCache("/api/");
      await onReload?.();
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar al servidor. Intenta más tarde.",
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleLock(matchId: string, action: "lock" | "unlock") {
    setLoading(matchId);
    try {
      const res = await fetch("/api/admin/matches/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, action }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(
          action === "lock"
            ? "Error al bloquear partido"
            : "Error al desbloquear partido",
          {
            description:
              data?.error ?? "No se pudo completar la acción. Intenta de nuevo.",
          }
        );
        return;
      }

      toast.success(
        action === "lock" ? "Partido bloqueado" : "Partido desbloqueado"
      );
      invalidateApiCache("/api/");
      await onReload?.();
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar al servidor. Intenta más tarde.",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/12 bg-white/5 p-4 backdrop-blur-sm">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-white/70 mb-1 block">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-white/55" />
            <Input
              placeholder="Equipo, sede, #partido..."
              value={search}
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="pl-8 h-9 border-white/15 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        {/* Group */}
        <div>
          <label className="text-xs font-medium text-white/70 mb-1 block">
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
          <label className="text-xs font-medium text-white/70 mb-1 block">
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
          <label className="text-xs font-medium text-white/70 mb-1 block">
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
      <p className="text-sm text-white/60">
        {filtered.length} {filtered.length === 1 ? "partido" : "partidos"}
        {hasActiveFilters ? " encontrados" : " en total"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/12 bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-12 text-white/70">#</TableHead>
              <TableHead className="text-white/70">Partido</TableHead>
              <TableHead className="text-white/70">Grupo</TableHead>
              <TableHead className="text-white/70">Estado</TableHead>
              <TableHead className="text-white/70">Resultado</TableHead>
              <TableHead className="text-white/70">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMatches.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-white/55">
                  No se encontraron partidos con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedMatches.map((match) => {
                const s = getScore(match.id);
                const knockout = isKnockoutStage(match.stage);
                const isFinished = match.status === "finished";
                const isEditing = editing[match.id] === true;
                return (
                  <TableRow key={match.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white/55">
                      {match.matchNumber}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap text-white">
                      <div className="flex items-center gap-1.5">
                        {match.homeTeam && (
                          <Flag
                            url={match.homeTeam.flagUrl}
                            code={match.homeTeam.code}
                            alt={match.homeTeam.name}
                          />
                        )}
                        {match.homeTeam?.code ?? "TBD"}
                        <span className="text-white/55">vs</span>
                        {match.awayTeam && (
                          <Flag
                            url={match.awayTeam.flagUrl}
                            code={match.awayTeam.code}
                            alt={match.awayTeam.name}
                          />
                        )}
                        {match.awayTeam?.code ?? "TBD"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.group ? (
                        <Badge className="text-white" variant="outline">Grupo {match.group}</Badge>
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
                    <TableCell className="text-white">
                      {isFinished && !isEditing ? (
                        <div className="flex flex-col gap-0.5 text-sm">
                          <span className="font-bold">
                            {match.homeScore} - {match.awayScore}
                          </span>
                          {knockout &&
                            match.extraTimeHomeScore !== null &&
                            match.extraTimeAwayScore !== null && (
                              <span className="text-xs text-white/55">
                                T. extra: +{match.extraTimeHomeScore} - +
                                {match.extraTimeAwayScore}
                              </span>
                            )}
                          {knockout &&
                            match.penaltyHomeScore !== null &&
                            match.penaltyAwayScore !== null && (
                              <span className="text-xs text-white/55">
                                Penales: {match.penaltyHomeScore} -{" "}
                                {match.penaltyAwayScore}
                              </span>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div>
                            <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/45">
                              90 min
                            </p>
                            <div className="flex items-center gap-1">
                              <NumberInput
                                className="w-14 text-center border-white/15 bg-white/5 text-white"
                                value={s.home}
                                onChange={(value) =>
                                  updateScore(match.id, { home: value })
                                }
                              />
                              <span className="text-white/70">-</span>
                              <NumberInput
                                className="w-14 text-center border-white/15 bg-white/5 text-white"
                                value={s.away}
                                onChange={(value) =>
                                  updateScore(match.id, { away: value })
                                }
                              />
                            </div>
                          </div>
                          {knockout && (
                            <>
                              <div>
                                <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/45">
                                  T. extra (goles)
                                </p>
                                <div className="flex items-center gap-1">
                                  <NumberInput
                                    className="w-14 text-center border-white/15 bg-white/5 text-white"
                                    value={s.etHome}
                                    onChange={(value) =>
                                      updateScore(match.id, { etHome: value })
                                    }
                                  />
                                  <span className="text-white/70">-</span>
                                  <NumberInput
                                    className="w-14 text-center border-white/15 bg-white/5 text-white"
                                    value={s.etAway}
                                    onChange={(value) =>
                                      updateScore(match.id, { etAway: value })
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="mb-0.5 text-[10px] uppercase tracking-wide text-white/45">
                                  Penales
                                </p>
                                <div className="flex items-center gap-1">
                                  <NumberInput
                                    className="w-14 text-center border-white/15 bg-white/5 text-white"
                                    value={s.penHome}
                                    onChange={(value) =>
                                      updateScore(match.id, { penHome: value })
                                    }
                                  />
                                  <span className="text-white/70">-</span>
                                  <NumberInput
                                    className="w-14 text-center border-white/15 bg-white/5 text-white"
                                    value={s.penAway}
                                    onChange={(value) =>
                                      updateScore(match.id, { penAway: value })
                                    }
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(!isFinished || isEditing) && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveResult(match)}
                            disabled={loading === match.id}
                          >
                            Guardar
                          </Button>
                        )}
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelEdit(match.id)}
                            disabled={loading === match.id}
                            className="text-white hover:bg-white/10 hover:text-white"
                          >
                            Cancelar
                          </Button>
                        )}
                        {isFinished && !isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(match)}
                            disabled={loading === match.id}
                            className=" text-black"
                          >
                            Editar
                          </Button>
                        )}
                        {match.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLock(match.id, "lock")}
                            disabled={loading === match.id}
                            className=" text-black"
                          >
                            Bloquear
                          </Button>
                        )}
                        {match.status === "locked" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLock(match.id, "unlock")}
                            disabled={loading === match.id}
                            className=" text-black"
                          >
                            Desbloquear
                          </Button>
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
          <p className="text-sm text-white/60">
            Pagina {safePage} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
              className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
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
                  <span key={`e${i}`} className="px-1 text-white/55">
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant="outline"
                    size="sm"
                    className={
                      safePage === item
                        ? "h-8 w-8 border-white/40 bg-white/15 p-0 text-white hover:bg-white/20 hover:text-white"
                        : "h-8 w-8 border-white/15 bg-transparent p-0 text-white hover:bg-white/10 hover:text-white"
                    }
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
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
              className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              Ultima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
