import { prisma } from "@/lib/prisma";
import { AdminMatchesClient } from "./admin-matches-client";

export default async function AdminPage() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: { matchNumber: "asc" },
  });

  const serialized = matches.map((m) => ({
    ...m,
    dateTime: m.dateTime.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">
        Administrar partidos
      </h1>
      <AdminMatchesClient matches={serialized} />
    </div>
  );
}
