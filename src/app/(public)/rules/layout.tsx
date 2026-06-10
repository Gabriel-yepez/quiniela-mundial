import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reglas",
  description:
    "Conoce el sistema de puntuación de la quiniela. Ganas 5 puntos por marcador exacto, 3 por ganador correcto y 2 por empate correcto.",
  alternates: {
    canonical: "/rules",
  },
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
