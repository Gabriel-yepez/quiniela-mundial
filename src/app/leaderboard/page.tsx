import type { Metadata } from "next";
import { LeaderboardTable } from "@/components/leaderboard-table";

export const metadata: Metadata = {
  title: "Ranking",
  description:
    "Tabla de posiciones de la quiniela del Mundial. Consulta quien lidera la clasificacion y cuantos puntos llevas acumulados.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Ranking — Quiniela Mundial",
    description:
      "Tabla de posiciones de la quiniela. Mira quien va ganando.",
  },
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-2xl px-4 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">Ranking</h1>
      <LeaderboardTable />
    </div>
  );
}
