import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchCard } from "@/components/match-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Partidos",
  description:
    "Consulta los 104 partidos del Mundial: fase de grupos, octavos, cuartos, semifinales y la gran final. Haz tus predicciones antes de que cierren.",
  openGraph: {
    title: "Partidos — Quiniela Mundial",
    description:
      "Todos los partidos del Mundial. Predice marcadores y acumula puntos.",
  },
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

  const predictionMap = new Map(
    predictions.map((p) => [p.matchId, p])
  );

  const groups = [...new Set(matches.filter((m) => m.group).map((m) => m.group!))].sort();
  const stages = [...new Set(matches.filter((m) => !m.group).map((m) => m.stage))];

  const allTabs = [
    ...groups.map((g) => ({ key: g, label: `Grupo ${g}` })),
    ...stages.map((s) => ({
      key: s,
      label:
        s === "round32"
          ? "32avos"
          : s === "round16"
          ? "8vos"
          : s === "quarter"
          ? "4tos"
          : s === "semi"
          ? "Semis"
          : s === "third"
          ? "3er lugar"
          : s === "final"
          ? "Final"
          : s,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">Partidos</h1>

      <Tabs defaultValue={groups[0] ?? "A"}>
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          {allTabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {allTabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matches
                .filter((m) =>
                  groups.includes(tab.key)
                    ? m.group === tab.key
                    : m.stage === tab.key
                )
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    match={{
                      ...match,
                      dateTime: match.dateTime.toISOString(),
                    }}
                    prediction={predictionMap.get(match.id) ?? null}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
