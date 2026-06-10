"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "@/components/flag";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/lib/api-cache";

gsap.registerPlugin(useGSAP);

interface TeamPayload {
  name: string;
  code: string;
  flagUrl: string | null;
}

interface StandingPayload {
  teamId: string;
  team: TeamPayload;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

interface GroupPayload {
  group: string;
  standings: StandingPayload[];
}

const QUALIFIED_DIRECT = 2;
const QUALIFIED_PLAYOFF = 3;

function positionAccent(position: number) {
  if (position <= QUALIFIED_DIRECT) return "bg-emerald-400";
  if (position === QUALIFIED_PLAYOFF) return "bg-amber-300";
  return "bg-white/15";
}

export function GroupsTable() {
  const { data: groups, error } = useApiQuery<GroupPayload[]>("/api/groups");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!groups?.length) return;
      gsap.fromTo(
        ".group-card",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform",
        }
      );
    },
    { scope: containerRef, dependencies: [groups?.length] }
  );

  if (error) {
    return (
      <p className="rounded-2xl border border-white/12 bg-white/5 px-6 py-12 text-center text-white/70 backdrop-blur-sm">
        No se pudieron cargar los grupos
      </p>
    );
  }

  if (!groups) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="rounded-2xl border border-white/12 bg-white/5 px-6 py-12 text-center text-white/70 backdrop-blur-sm">
        Aún no hay grupos para mostrar.
      </p>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <Legend />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <GroupCard key={group.group} group={group} />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/65">
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />
        Clasifica directo
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm bg-amber-300" />
        Repechaje (mejores terceros)
      </span>
      <span className="ml-auto text-[11px] text-white/45">
        Pts &middot; DG &middot; GF
      </span>
    </div>
  );
}

function GroupCard({ group }: { group: GroupPayload }) {
  return (
    <div className="group-card overflow-hidden rounded-2xl border border-white/12 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
          Grupo {group.group}
        </h2>
        <span className="text-[11px] uppercase tracking-wider text-white/55">
          {group.standings.length} equipos
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-8 px-2 text-[11px] uppercase tracking-wider text-white/55">
              #
            </TableHead>
            <TableHead className="px-2 text-[11px] uppercase tracking-wider text-white/55">
              Equipo
            </TableHead>
            <TableHead className="w-9 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              PJ
            </TableHead>
            <TableHead className="w-9 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              G
            </TableHead>
            <TableHead className="w-9 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              E
            </TableHead>
            <TableHead className="w-9 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              P
            </TableHead>
            <TableHead className="w-10 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              GF
            </TableHead>
            <TableHead className="w-10 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              GC
            </TableHead>
            <TableHead className="w-10 px-1 text-center text-[11px] uppercase tracking-wider text-white/55">
              DG
            </TableHead>
            <TableHead className="w-12 px-2 text-center text-[11px] uppercase tracking-wider text-white">
              Pts
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {group.standings.map((row) => (
            <TableRow
              key={row.teamId}
              className="border-white/8 text-white hover:bg-white/5"
            >
              <TableCell className="relative w-8 px-2 text-xs font-semibold text-white/80">
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full",
                    positionAccent(row.position)
                  )}
                  aria-hidden
                />
                {row.position}
              </TableCell>
              <TableCell className="px-2">
                <div className="flex items-center gap-2">
                  <Flag
                    url={row.team.flagUrl}
                    code={row.team.code}
                    alt={row.team.name}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight text-white">
                      {row.team.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-white/45">
                      {row.team.code}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-1 text-center text-sm tabular-nums text-white/80">
                {row.matchesPlayed}
              </TableCell>
              <TableCell className="px-1 text-center text-sm tabular-nums text-white/80">
                {row.wins}
              </TableCell>
              <TableCell className="px-1 text-center text-sm tabular-nums text-white/80">
                {row.draws}
              </TableCell>
              <TableCell className="px-1 text-center text-sm tabular-nums text-white/80">
                {row.losses}
              </TableCell>
              <TableCell className="px-1 text-center text-sm tabular-nums text-white/80">
                {row.goalsFor}
              </TableCell>
              <TableCell className="px-1 text-center text-sm tabular-nums text-white/80">
                {row.goalsAgainst}
              </TableCell>
              <TableCell
                className={cn(
                  "px-1 text-center text-sm tabular-nums",
                  row.goalDifference > 0 && "text-emerald-300",
                  row.goalDifference < 0 && "text-rose-300",
                  row.goalDifference === 0 && "text-white/70"
                )}
              >
                {row.goalDifference > 0 ? "+" : ""}
                {row.goalDifference}
              </TableCell>
              <TableCell className="px-2 text-center text-sm font-bold tabular-nums text-white">
                {row.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
