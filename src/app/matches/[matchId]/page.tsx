import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
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
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        {match.group && (
          <Badge variant="outline">Grupo {match.group}</Badge>
        )}
        <p className="text-sm text-muted-foreground">
          {date.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-muted-foreground">{match.venue}</p>
      </div>

      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center space-y-2">
          {match.homeTeam?.flagUrl && (
            <img
              src={match.homeTeam.flagUrl}
              alt={match.homeTeam.code}
              className="w-12 h-9 object-cover rounded shadow-sm mx-auto"
            />
          )}
          <p className="text-2xl font-bold">
            {match.homeTeam?.name ?? "Por definir"}
          </p>
          <p className="text-sm text-muted-foreground">
            {match.homeTeam?.code ?? "TBD"}
          </p>
        </div>

        <div className="px-4 py-2 rounded-lg bg-muted text-center">
          {isFinished ? (
            <span className="text-3xl font-bold">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-xl text-muted-foreground">vs</span>
          )}
        </div>

        <div className="text-center space-y-2">
          {match.awayTeam?.flagUrl && (
            <img
              src={match.awayTeam.flagUrl}
              alt={match.awayTeam.code}
              className="w-12 h-9 object-cover rounded shadow-sm mx-auto"
            />
          )}
          <p className="text-2xl font-bold">
            {match.awayTeam?.name ?? "Por definir"}
          </p>
          <p className="text-sm text-muted-foreground">
            {match.awayTeam?.code ?? "TBD"}
          </p>
        </div>
      </div>

      {isFinished && (
        <Badge className="mx-auto block w-fit" variant="secondary">
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
        <div className="text-center p-4 rounded-lg bg-muted space-y-1">
          <p className="text-sm text-muted-foreground">
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
