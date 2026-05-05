import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MatchDetailClient } from "@/components/match-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!match) return { title: "Partido no encontrado" };

  const home = match.homeTeam?.name ?? "Por definir";
  const away = match.awayTeam?.name ?? "Por definir";
  const title = `${home} vs ${away}`;
  const description = `Partido #${match.matchNumber} del Mundial. ${home} vs ${away} en ${match.venue}. Haz tu prediccion y acumula puntos.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/matches/${matchId}`,
    },
    openGraph: {
      title: `${title} — Quiniela Mundial`,
      description,
    },
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 text-white">
      <MatchDetailClient matchId={matchId} />
    </div>
  );
}
