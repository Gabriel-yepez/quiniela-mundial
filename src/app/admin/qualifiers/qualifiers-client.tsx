"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import type { GroupStanding } from "@/lib/standings";
import { resolveBracket, type ThirdPlacedRanking } from "@/lib/bracket";

interface TeamLite {
  id: string;
  name: string;
  code: string;
  flagUrl: string | null;
  group: string | null;
}

interface Round32Match {
  id: string;
  matchNumber: number;
  dateTime: string;
  venue: string;
  status: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeam: { name: string; code: string; flagUrl: string | null } | null;
  awayTeam: { name: string; code: string; flagUrl: string | null } | null;
}

export interface QualifiersData {
  groups: GroupStanding[];
  bestThirds: ThirdPlacedRanking[];
  round32Matches: Round32Match[];
  incompleteGroupMatches: number;
  teams: TeamLite[];
}

interface Assignment {
  homeTeamId: string | null;
  awayTeamId: string | null;
}

export function QualifiersClient({ data }: { data: QualifiersData }) {
  const [assignments, setAssignments] = useState<Map<string, Assignment>>(
    () =>
      new Map(
        data.round32Matches.map((m) => [
          m.id,
          { homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId },
        ])
      )
  );

  const qualifiedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const g of data.groups) {
      for (const s of g.standings) {
        if (s.position === 1 || s.position === 2) ids.add(s.teamId);
      }
    }
    for (const t of data.bestThirds.slice(0, 8)) ids.add(t.teamId);
    return ids;
  }, [data]);

  const [saving, setSaving] = useState(false);

  const resolved = useMemo(
    () => resolveBracket(data.groups, data.bestThirds),
    [data.groups, data.bestThirds]
  );

  function updateAssignment(matchId: string, patch: Partial<Assignment>) {
    setAssignments((prev) => {
      const next = new Map(prev);
      const current = next.get(matchId) ?? { homeTeamId: null, awayTeamId: null };
      next.set(matchId, { ...current, ...patch });
      return next;
    });
  }

  function applyBracket() {
    setAssignments((prev) => {
      const next = new Map(prev);
      for (const m of data.round32Matches) {
        if (m.status === "finished") continue;
        const r = resolved.get(m.matchNumber);
        if (!r) continue;
        next.set(m.id, { homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId });
      }
      return next;
    });
    toast.success("Bracket FIFA 2026 aplicado");
  }

  function clearAll() {
    setAssignments((prev) => {
      const next = new Map(prev);
      for (const m of data.round32Matches) {
        if (m.status === "finished") continue;
        next.set(m.id, { homeTeamId: null, awayTeamId: null });
      }
      return next;
    });
  }

  function validateClient(): string | null {
    const teamCounts = new Map<string, number>();
    for (const a of assignments.values()) {
      if (a.homeTeamId !== null && a.homeTeamId === a.awayTeamId) {
        return "Un equipo no puede jugar contra si mismo";
      }
      for (const id of [a.homeTeamId, a.awayTeamId]) {
        if (!id) continue;
        teamCounts.set(id, (teamCounts.get(id) ?? 0) + 1);
      }
    }
    for (const [, count] of teamCounts) {
      if (count > 1) return "Un equipo aparece en mas de un partido";
    }
    return null;
  }

  async function save() {
    const error = validateClient();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/qualifiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignments: data.round32Matches.map((m) => ({
            matchId: m.id,
            ...(assignments.get(m.id) ?? { homeTeamId: null, awayTeamId: null }),
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Error al guardar");
        return;
      }
      toast.success(`Clasificados guardados (${json.updated})`);
    } catch {
      toast.error("Error de conexion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 pb-24">
      {data.incompleteGroupMatches > 0 && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Faltan {data.incompleteGroupMatches} partidos de fase de grupos. Los
          standings reflejan resultados parciales.
        </div>
      )}

      <GroupsGrid groups={data.groups} qualifiedIds={qualifiedIds} />
      <BestThirdsList bestThirds={data.bestThirds} />
      <BracketTable
        matches={data.round32Matches}
        teams={data.teams}
        qualifiedIds={qualifiedIds}
        assignments={assignments}
        resolved={resolved}
        onChange={updateAssignment}
      />

      <div className="sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t border-white/10 bg-zinc-950/85 px-4 py-3 backdrop-blur">
        <Button onClick={applyBracket} disabled={saving}>
          Aplicar bracket FIFA 2026
        </Button>
        <Button variant="outline" onClick={clearAll} disabled={saving}>
          Limpiar
        </Button>
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

function GroupsGrid({
  groups,
  qualifiedIds,
}: {
  groups: GroupStanding[];
  qualifiedIds: Set<string>;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-white">Grupos</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.group}
            className="rounded-xl border border-white/12 bg-white/5 p-3 backdrop-blur-sm"
          >
            <h3 className="mb-2 text-sm font-semibold text-white">
              Grupo {g.group}
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="h-7 text-xs text-white/60">#</TableHead>
                  <TableHead className="h-7 text-xs text-white/60">Equipo</TableHead>
                  <TableHead className="h-7 text-right text-xs text-white/60">Pts</TableHead>
                  <TableHead className="h-7 text-right text-xs text-white/60">DG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.standings.map((s) => (
                  <TableRow
                    key={s.teamId}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="py-1 text-xs text-white/55">
                      {s.position}
                    </TableCell>
                    <TableCell className="py-1 text-xs text-white">
                      <div className="flex items-center gap-1.5">
                        <Flag
                          url={s.team.flagUrl}
                          code={s.team.code}
                          alt={s.team.name}
                        />
                        <span className="truncate">{s.team.code}</span>
                        {qualifiedIds.has(s.teamId) && (
                          <Badge className="ml-1 h-4 bg-emerald-500/20 px-1 text-[10px] text-emerald-300">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs text-white">
                      {s.points}
                    </TableCell>
                    <TableCell className="py-1 text-right text-xs text-white/70">
                      {s.goalDifference}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </section>
  );
}

function BestThirdsList({
  bestThirds,
}: {
  bestThirds: ThirdPlacedRanking[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-white">Mejores terceros</h2>
      <div className="overflow-hidden rounded-xl border border-white/12 bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Seed</TableHead>
              <TableHead className="text-white/70">Grupo</TableHead>
              <TableHead className="text-white/70">Equipo</TableHead>
              <TableHead className="text-right text-white/70">Pts</TableHead>
              <TableHead className="text-right text-white/70">DG</TableHead>
              <TableHead className="text-right text-white/70">GF</TableHead>
              <TableHead className="text-white/70">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bestThirds.map((t) => {
              const qualifies = t.seed <= 8;
              return (
                <TableRow key={t.teamId} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white/55">{t.seed}</TableCell>
                  <TableCell className="text-white">{t.group}</TableCell>
                  <TableCell className="text-white">
                    <div className="flex items-center gap-1.5">
                      <Flag url={t.team.flagUrl} code={t.team.code} alt={t.team.name} />
                      {t.team.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white">{t.points}</TableCell>
                  <TableCell className="text-right text-white/70">
                    {t.goalDifference}
                  </TableCell>
                  <TableCell className="text-right text-white/70">
                    {t.goalsFor}
                  </TableCell>
                  <TableCell>
                    {qualifies ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300">
                        Clasificado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="opacity-60">
                        Eliminado
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function teamLabel(team: TeamLite | undefined): string {
  if (!team) return "—";
  const groupTag = team.group ? `[${team.group}] ` : "";
  return `${groupTag}${team.name}`;
}

function BracketTable({
  matches,
  teams,
  qualifiedIds,
  assignments,
  resolved,
  onChange,
}: {
  matches: Round32Match[];
  teams: TeamLite[];
  qualifiedIds: Set<string>;
  assignments: Map<string, Assignment>;
  resolved: Map<number, { homeTeamId: string | null; awayTeamId: string | null }>;
  onChange: (matchId: string, patch: Partial<Assignment>) => void;
}) {
  const sortedTeams = useMemo(
    () =>
      [...teams].sort((a, b) => {
        const aQ = qualifiedIds.has(a.id);
        const bQ = qualifiedIds.has(b.id);
        if (aQ !== bQ) return aQ ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [teams, qualifiedIds]
  );

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-white">Bracket — Round of 32</h2>
      <div className="overflow-x-auto rounded-xl border border-white/12 bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-12 text-white/70">#</TableHead>
              <TableHead className="text-white/70">Local</TableHead>
              <TableHead className="text-white/70">Visitante</TableHead>
              <TableHead className="text-white/70">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((m) => {
              const a = assignments.get(m.id) ?? {
                homeTeamId: null,
                awayTeamId: null,
              };
              const auto = resolved.get(m.matchNumber);
              const isAuto =
                auto !== undefined &&
                auto.homeTeamId !== null &&
                auto.awayTeamId !== null &&
                a.homeTeamId === auto.homeTeamId &&
                a.awayTeamId === auto.awayTeamId;
              const isFinished = m.status === "finished";
              return (
                <TableRow key={m.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white/55">{m.matchNumber}</TableCell>
                  <TableCell>
                    <TeamSelect
                      value={a.homeTeamId}
                      teams={sortedTeams}
                      qualifiedIds={qualifiedIds}
                      disabled={isFinished}
                      onChange={(value) => onChange(m.id, { homeTeamId: value })}
                    />
                  </TableCell>
                  <TableCell>
                    <TeamSelect
                      value={a.awayTeamId}
                      teams={sortedTeams}
                      qualifiedIds={qualifiedIds}
                      disabled={isFinished}
                      onChange={(value) => onChange(m.id, { awayTeamId: value })}
                    />
                  </TableCell>
                  <TableCell>
                    {isFinished ? (
                      <Badge>Finalizado</Badge>
                    ) : a.homeTeamId === null && a.awayTeamId === null ? (
                      <Badge variant="secondary">Sin asignar</Badge>
                    ) : isAuto ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300">Auto</Badge>
                    ) : (
                      <Badge variant="outline" className="text-white">
                        Manual
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function TeamSelect({
  value,
  teams,
  qualifiedIds,
  disabled,
  onChange,
}: {
  value: string | null;
  teams: TeamLite[];
  qualifiedIds: Set<string>;
  disabled: boolean;
  onChange: (value: string | null) => void;
}) {
  const qualified = teams.filter((t) => qualifiedIds.has(t.id));
  const eliminated = teams.filter((t) => !qualifiedIds.has(t.id));
  return (
    <select
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus-visible:border-white/30 focus-visible:ring-3 focus-visible:ring-white/20 [&>*]:bg-zinc-900 [&>*]:text-white disabled:opacity-50"
    >
      <option value="">— Sin asignar —</option>
      {qualified.length > 0 && (
        <optgroup label="Clasificados">
          {qualified.map((t) => (
            <option key={t.id} value={t.id}>
              {teamLabel(t)}
            </option>
          ))}
        </optgroup>
      )}
      {eliminated.length > 0 && (
        <optgroup label="Eliminados">
          {eliminated.map((t) => (
            <option key={t.id} value={t.id}>
              {teamLabel(t)}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
