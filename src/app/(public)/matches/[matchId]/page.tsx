import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PredictionForm } from "@/components/prediction-form";

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
  const session = await auth();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!match) notFound();

  const prediction = session?.user?.id
    ? await prisma.prediction.findUnique({
        where: {
          userId_matchId: {
            userId: session.user.id,
            matchId: match.id,
          },
        },
      })
    : null;

  const date = new Date(match.dateTime);
  const isFinished = match.status === "finished";
  const canPredict = match.status === "scheduled";

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 text-white">
      <div className="space-y-2 text-center">
        {match.group && (
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            Grupo {match.group}
          </Badge>
        )}
        <p className="text-sm text-white/70">
          {date.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-white/55">{match.venue}</p>
      </div>

      <div className="flex items-center justify-center gap-6 py-4">
        <div className="space-y-2 text-center">
          {match.homeTeam?.flagUrl && (
            <Image
              src={match.homeTeam.flagUrl}
              alt={match.homeTeam.name ?? match.homeTeam.code}
              width={48}
              height={36}
              className="mx-auto rounded object-cover shadow-sm"
            />
          )}
          <p className="text-2xl font-bold">
            {match.homeTeam?.name ?? "Por definir"}
          </p>
          <p className="text-sm text-white/60">
            {match.homeTeam?.code ?? "TBD"}
          </p>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
          {isFinished ? (
            <span className="text-3xl font-semibold text-white">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-xl text-white/50">vs</span>
          )}
        </div>

        <div className="space-y-2 text-center">
          {match.awayTeam?.flagUrl && (
            <Image
              src={match.awayTeam.flagUrl}
              alt={match.awayTeam.name ?? match.awayTeam.code}
              width={48}
              height={36}
              className="mx-auto rounded object-cover shadow-sm"
            />
          )}
          <p className="text-2xl font-bold">
            {match.awayTeam?.name ?? "Por definir"}
          </p>
          <p className="text-sm text-white/60">
            {match.awayTeam?.code ?? "TBD"}
          </p>
        </div>
      </div>

      {isFinished && (
        <Badge className="mx-auto block w-fit border border-white/15 bg-white/12 text-white" variant="secondary">
          Partido finalizado
        </Badge>
      )}

      {session?.user && (
        <PredictionForm
          matchId={match.id}
          homeTeamName={match.homeTeam?.name ?? "Local"}
          awayTeamName={match.awayTeam?.name ?? "Visitante"}
          disabled={!canPredict}
          initialHome={prediction?.homeScore}
          initialAway={prediction?.awayScore}
        />
      )}

      {prediction && isFinished && (
        <div className="space-y-1 rounded-lg border border-white/15 bg-white/10 p-4 text-center backdrop-blur-sm">
          <p className="text-sm text-white/65">
            Tu prediccion: {prediction.homeScore} - {prediction.awayScore}
          </p>
          <p className="text-lg font-bold">
            {prediction.points !== null
              ? `${prediction.points} puntos`
              : "Pendiente de calificar"}
          </p>
        </div>
      )}
    </div>
  );
}
