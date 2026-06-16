import type { Metadata } from "next";
import { GroupsTable } from "@/components/groups-table";

export const metadata: Metadata = {
  title: "Grupos",
  description:
    "Tabla de posiciones por grupo del Mundial. Consulta puntos, diferencia de goles y clasificacion en tiempo real.",
  alternates: {
    canonical: "/groups",
  },
  openGraph: {
    title: "Grupos — Quiniela Mundial",
    description:
      "Tabla de posiciones por grupo. Sigue la clasificacion del Mundial.",
  },
};

export default function GroupsPage() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-4rem)] max-w-6xl px-4 py-8 text-white">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Grupos
        </h1>
        <p className="text-sm text-white/65">
          Posiciones de cada grupo de la fase inicial.
        </p>
      </div>
      <GroupsTable />
    </div>
  );
}
