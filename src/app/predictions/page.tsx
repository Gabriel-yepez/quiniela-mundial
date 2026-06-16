import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PredictionsClient } from "@/components/predictions-client";

export const metadata: Metadata = {
  title: "Mis Predicciones",
  description:
    "Revisa todas tus predicciones del Mundial, los puntos obtenidos por partido y tu puntaje total acumulado.",
  robots: { index: false },
};

export default async function PredictionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="mx-auto min-h-[calc(100dvh-4rem)] max-w-4xl px-4 py-8 text-white">
      <PredictionsClient />
    </div>
  );
}
