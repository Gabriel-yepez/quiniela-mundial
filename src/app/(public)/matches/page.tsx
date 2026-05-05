import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MatchesClient } from "@/components/matches-client";
import { JsonLd } from "@/components/json-ld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quiniela-mundial.vercel.app";

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

export default async function MatchesPage() {
  let matches: { id: string }[] = [];
  try {
    matches = await prisma.match.findMany({
      select: { id: true },
      orderBy: { matchNumber: "asc" },
    });
  } catch {
    matches = [];
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Partidos del Mundial 2026",
    numberOfItems: matches.length,
    itemListElement: matches.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/matches/${m.id}`,
    })),
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 text-white">
      <JsonLd data={itemList} />
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">Partidos</h1>
      <MatchesClient />
    </div>
  );
}
