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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Mis Predicciones</h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{totalPoints} pts</p>
        </div>
      </div>

      {predictions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aun no has hecho predicciones. Ve a la seccion de partidos para
          comenzar.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead className="text-center">Tu prediccion</TableHead>
              <TableHead className="text-center">Resultado</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions.map((pred) => (
              <TableRow key={pred.id}>
                <TableCell className="text-muted-foreground">
                  {pred.match.matchNumber}
                </TableCell>
                <TableCell className="font-medium">
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
                    <span className="text-muted-foreground">Pendiente</span>
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
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
