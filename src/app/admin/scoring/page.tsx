"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ScoringPage() {
  const [exactScore, setExactScore] = useState("5");
  const [correctWinner, setCorrectWinner] = useState("3");
  const [correctDraw, setCorrectDraw] = useState("2");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/scoring")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setExactScore(data.exactScore.toString());
          setCorrectWinner(data.correctWinner.toString());
          setCorrectDraw(data.correctDraw.toString());
        }
      })
      .catch(() => {
        toast.error("Error al cargar configuracion", {
          description: "No se pudieron cargar los puntos actuales.",
        });
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scoring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exactScore: parseInt(exactScore, 10),
          correctWinner: parseInt(correctWinner, 10),
          correctDraw: parseInt(correctDraw, 10),
        }),
      });

      if (!res.ok) {
        toast.error("Error al guardar configuracion", {
          description: "No se pudieron guardar los puntos. Intenta de nuevo.",
        });
        return;
      }

      toast.success("Configuracion de puntos actualizada");
    } catch {
      toast.error("Error de conexion", {
        description: "No se pudo conectar al servidor. Intenta mas tarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="max-w-xl">
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-white">
            Configuracion de Puntos
          </h2>
          <p className="text-sm text-white/65">
            Define cuantos puntos otorga cada tipo de acierto al calificar las
            predicciones de los usuarios. Estos valores se aplican automaticamente
            cuando guardas el resultado de un partido.
          </p>
        </div>
        <Card className="w-full max-w-md justify-self-start border-white/12 bg-white/10 text-white backdrop-blur-sm md:justify-self-end">
          <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exactScore">
              Marcador exacto
            </Label>
            <p className="text-xs text-white/60">
              Puntos cuando el usuario acierta el marcador exacto
            </p>
            <NumberInput
              id="exactScore"
              value={exactScore}
              onChange={setExactScore}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctWinner">
              Ganador correcto
            </Label>
            <p className="text-xs text-white/60">
              Puntos cuando acierta el ganador pero no el marcador
            </p>
            <NumberInput
              id="correctWinner"
              value={correctWinner}
              onChange={setCorrectWinner}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctDraw">
              Empate correcto
            </Label>
            <p className="text-xs text-white/60">
              Puntos cuando predice empate y es empate, pero diferente marcador
            </p>
            <NumberInput
              id="correctDraw"
              value={correctDraw}
              onChange={setCorrectDraw}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar configuracion"}
          </Button>
        </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
