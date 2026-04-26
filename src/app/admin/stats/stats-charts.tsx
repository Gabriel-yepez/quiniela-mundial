"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsResponse {
  summary: {
    totalUsers: number;
    totalPredictions: number;
    totalMatches: number;
    completedMatches: number;
    avgPointsPerUser: number;
    maxPoints: number;
  };
  leaderboard: Array<{
    name: string | null;
    image: string | null;
    totalPoints: number;
    totalPredictions: number;
    exactScores: number;
    correctWinners: number;
    correctDraws: number;
  }>;
  matchParticipation: Array<{
    matchNumber: number;
    label: string;
    predictionCount: number;
    stage: string;
    status: string;
  }>;
  predictionAccuracy: {
    exact: number;
    correctWinner: number;
    correctDraw: number;
    wrong: number;
    pending: number;
  };
  pointsDistribution: Array<{
    range: string;
    count: number;
  }>;
}

const ACCURACY_COLORS: Record<string, string> = {
  Exactas: "#22c55e",
  "Ganador correcto": "#3b82f6",
  "Empate correcto": "#eab308",
  Incorrectas: "#ef4444",
  Pendientes: "#d1d5db",
};

function truncate(value: string, max = 12) {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function LeaderboardTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StatsResponse["leaderboard"][number] }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-background p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">{data.name ?? "Sin nombre"}</p>
      <p className="text-muted-foreground">
        Puntos: <span className="font-medium text-foreground">{data.totalPoints}</span>
      </p>
      <p className="text-muted-foreground">
        Predicciones:{" "}
        <span className="font-medium text-foreground">{data.totalPredictions}</span>
      </p>
      <p className="text-muted-foreground">
        Exactas: <span className="font-medium text-foreground">{data.exactScores}</span>
      </p>
      <p className="text-muted-foreground">
        Ganador: <span className="font-medium text-foreground">{data.correctWinners}</span>
      </p>
      <p className="text-muted-foreground">
        Empate: <span className="font-medium text-foreground">{data.correctDraws}</span>
      </p>
    </div>
  );
}

function ParticipationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StatsResponse["matchParticipation"][number] }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-background p-3 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">Partido #{data.matchNumber}</p>
      <p className="text-muted-foreground">{data.label}</p>
      <p className="text-muted-foreground">
        Etapa: <span className="font-medium text-foreground">{data.stage}</span>
      </p>
      <p className="text-muted-foreground">
        Predicciones:{" "}
        <span className="font-medium text-foreground">{data.predictionCount}</span>
      </p>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className={idx === 2 ? "lg:col-span-2" : undefined}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StatsCharts() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats", {
          signal: controller.signal,
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: no se pudieron cargar las estadísticas`);
        }
        const data: StatsResponse = await res.json();
        setStats(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  if (loading) return <StatsSkeleton />;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No se pudieron cargar las estadísticas</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) return null;

  const {
    summary,
    leaderboard,
    matchParticipation,
    predictionAccuracy,
  } = stats;

  const topLeaderboard = leaderboard.slice(0, 15).map((entry) => ({
    ...entry,
    displayName: truncate(entry.name ?? "Sin nombre"),
  }));

  const accuracyEntries = [
    { name: "Exactas", value: predictionAccuracy.exact },
    { name: "Ganador correcto", value: predictionAccuracy.correctWinner },
    { name: "Empate correcto", value: predictionAccuracy.correctDraw },
    { name: "Incorrectas", value: predictionAccuracy.wrong },
    { name: "Pendientes", value: predictionAccuracy.pending },
  ].filter((entry) => entry.value > 0);

  const accuracyTotal = accuracyEntries.reduce((sum, entry) => sum + entry.value, 0);

  const completionLabel = `${summary.completedMatches} / ${summary.totalMatches}`;
  const avgFormatted = (Math.round(summary.avgPointsPerUser * 10) / 10).toFixed(1);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Participantes</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{summary.totalUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Predicciones hechas</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {summary.totalPredictions}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Partidos completados</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{completionLabel}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Promedio de puntos</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{avgFormatted}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Top participantes por puntos</CardTitle>
          <CardDescription>
            Los {topLeaderboard.length} jugadores con mayor puntaje acumulado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topLeaderboard.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aún no hay datos de participantes
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={topLeaderboard}
                margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<LeaderboardTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="totalPoints" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de predicciones</CardTitle>
            <CardDescription>
              Distribución de aciertos sobre {accuracyTotal} predicciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accuracyEntries.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Aún no hay predicciones registradas
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={accuracyEntries}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={2}
                  >
                    {accuracyEntries.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={ACCURACY_COLORS[entry.name] ?? "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const n = typeof value === "number" ? value : 0;
                      const pct = accuracyTotal
                        ? ((n / accuracyTotal) * 100).toFixed(1)
                        : "0";
                      return [`${n} (${pct}%)`, name];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string, entry) => {
                      const item = entry?.payload as
                        | { value?: number }
                        | undefined;
                      const count = item?.value ?? 0;
                      const pct = accuracyTotal
                        ? ((count / accuracyTotal) * 100).toFixed(1)
                        : "0";
                      return (
                        <span className="text-xs text-muted-foreground">
                          {value} ({pct}%)
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participación por partido</CardTitle>
            <CardDescription>
              Cantidad de predicciones registradas en cada encuentro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchParticipation.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Aún no hay partidos con predicciones
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={matchParticipation}
                  margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="matchNumber"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    content={<ParticipationTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="predictionCount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
