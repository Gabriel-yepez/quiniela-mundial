"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { invalidateApiCache } from "@/lib/api-cache";

interface PredictionFormProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  disabled: boolean;
  initialHome?: number;
  initialAway?: number;
}

export function PredictionForm({
  matchId,
  homeTeamName,
  awayTeamName,
  disabled,
  initialHome,
  initialAway,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(initialHome?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(initialAway?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (homeScore === "" || awayScore === "") {
      toast.error("Ingresa ambos marcadores", {
        description: "Debes llenar el marcador de ambos equipos.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(homeScore, 10),
          awayScore: parseInt(awayScore, 10),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar predicción", {
          description: "Hubo un problema al guardar. Intenta de nuevo.",
        });
        return;
      }

      toast.success("Predicción guardada correctamente");
      invalidateApiCache("/api/predictions");
      invalidateApiCache("/api/matches");
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar al servidor. Intenta más tarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-zinc-300 bg-zinc-400">
      <CardHeader>
        <CardTitle className="text-lg">Tu predicción</CardTitle>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <p className="text-sm text-muted-foreground">
            Este partido ya no acepta predicciones.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-4 justify-center">
              <div className="space-y-1 text-center">
                <Label className="text-xs">{homeTeamName}</Label>
                <NumberInput
                  value={homeScore}
                  onChange={setHomeScore}
                  className="w-16 text-center text-lg font-bold"
                />
              </div>
              <span className="text-lg font-bold pb-2">-</span>
              <div className="space-y-1 text-center">
                <Label className="text-xs">{awayTeamName}</Label>
                <NumberInput
                  value={awayScore}
                  onChange={setAwayScore}
                  className="w-16 text-center text-lg font-bold"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar predicción"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
