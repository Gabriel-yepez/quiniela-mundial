import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { JsonLd } from "@/components/json-ld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quiniela-mundial.vercel.app";

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

export default async function LeaderboardPage() {
  let topPlayers: { name: string | null }[] = [];
  try {
    const users = await prisma.user.findMany({
      select: {
        name: true,
        predictions: { select: { points: true } },
      },
    });
    topPlayers = users
      .map((u) => ({
        name: u.name,
        totalPoints: u.predictions.reduce(
          (sum, p) => sum + (p.points ?? 0),
          0
        ),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  } catch {
    topPlayers = [];
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ranking — Quiniela Mundial 2026",
    description: "Top jugadores de la quiniela ordenados por puntos",
    numberOfItems: topPlayers.length,
    itemListElement: topPlayers.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name ?? "Anonimo",
    })),
    url: `${SITE_URL}/leaderboard`,
  };

  return (
    <div className="mx-auto min-h-[calc(100dvh-4rem)] max-w-2xl px-4 py-8 text-white">
      <JsonLd data={itemList} />
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">Ranking</h1>
      <LeaderboardTable />
    </div>
  );
}
