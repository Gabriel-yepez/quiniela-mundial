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
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">
        Administrar partidos
      </h1>
      <AdminMatchesClient matches={serialized} />
    </div>
  );
}
