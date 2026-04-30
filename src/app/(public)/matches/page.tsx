import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchCard } from "@/components/match-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Partidos",
  description:
    "Consulta los 104 partidos del Mundial: fase de grupos, octavos, cuartos, semifinales y la gran final. Haz tus predicciones antes de que cierren.",
  alternates: {
    canonical: "/matches",
  },
  openGraph: {
    title: "Partidos — Quiniela Mundial",
    description:
      "Todos los partidos del Mundial. Predice marcadores y acumula puntos.",
  },
};

const STAGE_LABELS: Record<string, string> = {
  round32: "32avos",
  round16: "8vos",
  quarter: "4tos",
  semi: "Semis",
  third: "3er lugar",
  final: "Final",
};

export default async function MatchesPage() {
  const session = await auth();

  const matches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { matchNumber: "asc" },
  });

  const predictions = session?.user?.id
    ? await prisma.prediction.findMany({
        where: { userId: session.user.id },
      })
    : [];

  const predictionMap = new Map(predictions.map((prediction) => [prediction.matchId, prediction]));
  const groups = [...new Set(matches.filter((match) => match.group).map((match) => match.group!))].sort();
  const stages = [...new Set(matches.filter((match) => !match.group).map((match) => match.stage))];
  const tabs = [
    ...groups.map((group) => ({ key: group, label: `Grupo ${group}` })),
    ...stages.map((stage) => ({
      key: stage,
      label: STAGE_LABELS[stage] ?? stage,
    })),
  ];
  const defaultTab = tabs[0]?.key;

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">Partidos</h1>

      {tabs.length === 0 ? (
        <div className="rounded-2xl border border-white/12 bg-white/10 px-6 py-12 text-center text-white/65 backdrop-blur-sm">
          No hay partidos disponibles todavia.
        </div>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1 rounded-2xl border border-white/12 bg-white/10 p-1 backdrop-blur-sm">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="text-xs text-white/70 data-active:bg-white data-active:text-neutral-900"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {matches
                  .filter((match) => (groups.includes(tab.key) ? match.group === tab.key : match.stage === tab.key))
                  .map((match, index) => (
                    <MatchCard
                      key={match.id}
                      match={{
                        ...match,
                        dateTime: match.dateTime.toISOString(),
                      }}
                      prediction={predictionMap.get(match.id) ?? null}
                      animationIndex={index}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
