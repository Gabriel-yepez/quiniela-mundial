"use client";

import { useMemo, useState } from "react";
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
import type { ThirdPlacedRanking } from "@/lib/bracket";

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
  const [, setAssignments] = useState<Map<string, Assignment>>(
    () =>
      new Map(
        data.round32Matches.map((m) => [
          m.id,
          { homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId },
        ])
      )
  );

  // Suppress unused-state warning until Task 8 wires actions.
  void setAssignments;

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

  return (
    <div className="space-y-8">
      {data.incompleteGroupMatches > 0 && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Faltan {data.incompleteGroupMatches} partidos de fase de grupos. Los
          standings reflejan resultados parciales.
        </div>
      )}

      <GroupsGrid groups={data.groups} qualifiedIds={qualifiedIds} />
      <BestThirdsList bestThirds={data.bestThirds} />

      {/* Bracket table + actions added in Task 8 */}
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
