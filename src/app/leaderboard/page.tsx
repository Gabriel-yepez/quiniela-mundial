import type { Metadata } from "next";
import { LeaderboardTable } from "@/components/leaderboard-table";

export const metadata: Metadata = {
  title: "Ranking",
  description:
    "Tabla de posiciones de la quiniela del Mundial 2026. Consulta quien lidera la clasificacion y cuantos puntos llevas acumulados.",
  openGraph: {
    title: "Ranking — Quiniela Mundial 2026",
    description:
      "Tabla de posiciones de la quiniela. Mira quien va ganando.",
  },
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Ranking</h1>
      <LeaderboardTable />
    </div>
  );
}
