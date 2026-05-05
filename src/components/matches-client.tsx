"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/match-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Team {
  name: string;
  code: string;
  flagUrl: string | null;
}

interface MatchPayload {
  id: string;
  matchNumber: number;
  stage: string;
  group: string | null;
  dateTime: string;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
}

interface PredictionPayload {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
}

const STAGE_LABELS: Record<string, string> = {
  round32: "32avos",
  round16: "8vos",
  quarter: "4tos",
  semi: "Semis",
  third: "3er lugar",
  final: "Final",
};

export function MatchesClient() {
  const [matches, setMatches] = useState<MatchPayload[] | null>(null);
  const [predictions, setPredictions] = useState<PredictionPayload[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const matchesRes = await fetch("/api/matches");
        if (!matchesRes.ok) throw new Error("No se pudieron cargar los partidos");
        const matchesData: MatchPayload[] = await matchesRes.json();

        let predictionsData: PredictionPayload[] = [];
        const predRes = await fetch("/api/predictions");
        if (predRes.ok) {
          const data = await predRes.json();
          predictionsData = data.predictions ?? [];
        }

        if (!cancelled) {
          setMatches(matchesData);
          setPredictions(predictionsData);
        }
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
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/12 bg-white/10 px-6 py-12 text-center text-white/65 backdrop-blur-sm">
        {error}
      </div>
    );
  }

  if (!matches) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const predictionMap = new Map(predictions.map((p) => [p.matchId, p]));
  const groups = [
    ...new Set(matches.filter((m) => m.group).map((m) => m.group!)),
  ].sort();
  const stages = [
    ...new Set(matches.filter((m) => !m.group).map((m) => m.stage)),
  ];
  const tabs = [
    ...groups.map((group) => ({ key: group, label: `Grupo ${group}` })),
    ...stages.map((stage) => ({
      key: stage,
      label: STAGE_LABELS[stage] ?? stage,
    })),
  ];
  const defaultTab = tabs[0]?.key;

  if (tabs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/12 bg-white/10 px-6 py-12 text-center text-white/65 backdrop-blur-sm">
        No hay partidos disponibles todavia.
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab}>
      <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <TabsList className="inline-flex h-auto w-max flex-nowrap gap-1 rounded-2xl border border-white/12 bg-white/10 p-1 backdrop-blur-sm">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="shrink-0 whitespace-nowrap text-xs text-white/70 data-active:bg-white data-active:text-neutral-900"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.key} value={tab.key}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches
              .filter((match) =>
                groups.includes(tab.key)
                  ? match.group === tab.key
                  : match.stage === tab.key
              )
              .map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictionMap.get(match.id) ?? null}
                  animationIndex={index}
                />
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
