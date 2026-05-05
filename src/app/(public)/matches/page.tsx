import type { Metadata } from "next";
import { MatchesClient } from "@/components/matches-client";

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

export default function MatchesPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-white">Partidos</h1>
      <MatchesClient />
    </div>
  );
}
