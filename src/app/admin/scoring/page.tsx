"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Configuracion de Puntos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exactScore">
              Marcador exacto
            </Label>
            <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
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
  );
}
