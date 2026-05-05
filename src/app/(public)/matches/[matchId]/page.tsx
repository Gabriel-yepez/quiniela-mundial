import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MatchDetailClient } from "@/components/match-detail-client";
import { JsonLd } from "@/components/json-ld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quiniela-mundial.vercel.app";

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
      type: "website",
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
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 text-white">
      {match && <MatchSeo match={match} />}
      <MatchDetailClient matchId={matchId} />
    </div>
  );
}

interface MatchSeoData {
  id: string;
  matchNumber: number;
  dateTime: Date;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  homeTeam: { name: string; code: string } | null;
  awayTeam: { name: string; code: string } | null;
}

function MatchSeo({ match }: { match: MatchSeoData }) {
  const home = match.homeTeam?.name ?? "Por definir";
  const away = match.awayTeam?.name ?? "Por definir";
  const url = `${SITE_URL}/matches/${match.id}`;
  const eventStatus =
    match.status === "finished"
      ? "https://schema.org/EventScheduled"
      : match.status === "locked"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled";

  const sportsEvent = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${home} vs ${away} — Mundial 2026`,
    description: `Partido #${match.matchNumber} del Mundial 2026 entre ${home} y ${away}.`,
    startDate: match.dateTime.toISOString(),
    eventStatus,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: match.venue,
    },
    competitor: [
      match.homeTeam && {
        "@type": "SportsTeam",
        name: match.homeTeam.name,
        identifier: match.homeTeam.code,
      },
      match.awayTeam && {
        "@type": "SportsTeam",
        name: match.awayTeam.name,
        identifier: match.awayTeam.code,
      },
    ].filter(Boolean),
    sport: "Football",
    superEvent: {
      "@type": "SportsEvent",
      name: "FIFA World Cup 2026",
      startDate: "2026-06-11",
      endDate: "2026-07-19",
    },
    url,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Partidos",
        item: `${SITE_URL}/matches`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${home} vs ${away}`,
        item: url,
      },
    ],
  };

  return (
    <>
      <JsonLd data={sportsEvent} />
      <JsonLd data={breadcrumbs} />
    </>
  );
}
