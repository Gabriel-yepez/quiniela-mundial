import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mis Predicciones",
  description:
    "Revisa todas tus predicciones del Mundial, los puntos obtenidos por partido y tu puntaje total acumulado.",
  robots: { index: false },
};

export default async function PredictionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true },
      },
    },
    orderBy: { match: { matchNumber: "asc" } },
  });

  const totalPoints = predictions.reduce(
    (sum, p) => sum + (p.points ?? 0),
    0
  );

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-4xl px-4 py-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Mis Predicciones</h1>
        <div className="text-right">
          <p className="text-sm text-white/65">Total</p>
          <p className="text-2xl font-semibold text-white">{totalPoints} pts</p>
        </div>
      </div>

      {predictions.length === 0 ? (
        <p className="py-12 text-center text-white/60">
          Aun no has hecho predicciones. Ve a la seccion de partidos para
          comenzar.
        </p>
      ) : (
        <div className="rounded-2xl border border-white/12 bg-white/10 p-2 backdrop-blur-sm">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white/70">#</TableHead>
              <TableHead className="text-white/70">Partido</TableHead>
              <TableHead className="text-center text-white/70">Tu prediccion</TableHead>
              <TableHead className="text-center text-white/70">Resultado</TableHead>
              <TableHead className="text-right text-white/70">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions.map((pred) => (
              <TableRow key={pred.id} className="border-white/10 text-white">
                <TableCell className="text-white/55">
                  {pred.match.matchNumber}
                </TableCell>
                <TableCell className="font-medium text-white">
                  {pred.match.homeTeam?.code ?? "TBD"} vs{" "}
                  {pred.match.awayTeam?.code ?? "TBD"}
                </TableCell>
                <TableCell className="text-center">
                  {pred.homeScore} - {pred.awayScore}
                </TableCell>
                <TableCell className="text-center">
                  {pred.match.status === "finished" ? (
                    `${pred.match.homeScore} - ${pred.match.awayScore}`
                  ) : (
                    <span className="text-white/55">Pendiente</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {pred.points !== null ? (
                    <Badge
                      variant={pred.points > 0 ? "default" : "secondary"}
                      >
                      {pred.points > 0 ? `+${pred.points}` : "0"}
                    </Badge>
                  ) : (
                    <span className="text-white/55">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
