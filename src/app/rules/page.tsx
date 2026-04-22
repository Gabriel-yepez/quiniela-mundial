"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";

export default function RulesPage() {
  const [config, setConfig] = useState({
    exactScore: 5,
    correctWinner: 3,
    correctDraw: 2,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/scoring")
      .then((res) => res.json())
      .then((data) => {
        if (data) setConfig(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".rules-hero",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo(
        ".rules-card",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "back.out(1.2)",
          delay: 0.3,
        }
      );

      gsap.fromTo(
        ".points-card",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.5)",
          delay: 0.6,
        }
      );

      gsap.fromTo(
        ".example-row",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.9,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      {/* Hero */}
      <div className="rules-hero text-center space-y-3 opacity-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 tracking-tight">
          Reglas de la Quiniela
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Predice los resultados de los partidos del Mundial y compite
          contra otros jugadores para ganar la mayor cantidad de puntos.
        </p>
      </div>

      {/* Como funciona */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-900">
          Como funciona
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rules-card opacity-0 border-blue-100">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-sm">
                  1
                </span>
                <h3 className="font-semibold">Registrate</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea tu cuenta con correo y contrasena o inicia sesion con
                Google para comenzar a participar.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card opacity-0 border-blue-100">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-sm">
                  2
                </span>
                <h3 className="font-semibold">Haz tus predicciones</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Entra a cada partido y predice el marcador final (goles local
                y visitante). Puedes modificar tu prediccion hasta que el
                partido sea bloqueado.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card opacity-0 border-blue-100">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-sm">
                  3
                </span>
                <h3 className="font-semibold">Espera los resultados</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Cuando el partido finalice, el administrador registrara el
                marcador real y el sistema calculara automaticamente tus
                puntos.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card opacity-0 border-blue-100">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-sm">
                  4
                </span>
                <h3 className="font-semibold">Revisa el ranking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Consulta la tabla de posiciones para ver como vas comparado
                con los demas participantes. El que acumule mas puntos al
                final del torneo gana.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sistema de puntos */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-900">
          Sistema de puntos
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="points-card opacity-0 border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-5 text-center space-y-2">
              <div className="text-4xl font-bold text-emerald-600">
                {config.exactScore}
              </div>
              <div className="text-sm font-semibold">Marcador exacto</div>
              <p className="text-xs text-muted-foreground">
                Acertaste el resultado exacto del partido (mismos goles para
                ambos equipos).
              </p>
            </CardContent>
          </Card>

          <Card className="points-card opacity-0 border-blue-200 bg-blue-50/50">
            <CardContent className="p-5 text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">
                {config.correctWinner}
              </div>
              <div className="text-sm font-semibold">Ganador correcto</div>
              <p className="text-xs text-muted-foreground">
                Acertaste quien gano el partido pero no el marcador exacto.
              </p>
            </CardContent>
          </Card>

          <Card className="points-card opacity-0 border-amber-200 bg-amber-50/50">
            <CardContent className="p-5 text-center space-y-2">
              <div className="text-4xl font-bold text-amber-600">
                {config.correctDraw}
              </div>
              <div className="text-sm font-semibold">Empate correcto</div>
              <p className="text-xs text-muted-foreground">
                Predijiste empate y el partido termino en empate, pero con
                diferente marcador.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge variant="destructive" className="shrink-0">
              0 pts
            </Badge>
            <p className="text-sm text-muted-foreground">
              Si no aciertas ninguna de las condiciones anteriores, no
              obtendras puntos por ese partido.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Ejemplos */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-900">
          Ejemplos
        </h2>

        <Card className="border-blue-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium">Tu prediccion</th>
                    <th className="text-left p-3 font-medium">Resultado real</th>
                    <th className="text-left p-3 font-medium">Puntos</th>
                    <th className="text-left p-3 font-medium">Razon</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="example-row border-b opacity-0">
                    <td className="p-3 font-mono">2 - 1</td>
                    <td className="p-3 font-mono">2 - 1</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-600">+{config.exactScore}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Marcador exacto
                    </td>
                  </tr>
                  <tr className="example-row border-b opacity-0">
                    <td className="p-3 font-mono">3 - 1</td>
                    <td className="p-3 font-mono">2 - 0</td>
                    <td className="p-3">
                      <Badge className="bg-blue-600">+{config.correctWinner}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Gano el local en ambos casos
                    </td>
                  </tr>
                  <tr className="example-row border-b opacity-0">
                    <td className="p-3 font-mono">0 - 2</td>
                    <td className="p-3 font-mono">1 - 3</td>
                    <td className="p-3">
                      <Badge className="bg-blue-600">+{config.correctWinner}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Gano el visitante en ambos casos
                    </td>
                  </tr>
                  <tr className="example-row border-b opacity-0">
                    <td className="p-3 font-mono">1 - 1</td>
                    <td className="p-3 font-mono">0 - 0</td>
                    <td className="p-3">
                      <Badge className="bg-amber-600">+{config.correctDraw}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Ambos son empate, diferente marcador
                    </td>
                  </tr>
                  <tr className="example-row border-b opacity-0">
                    <td className="p-3 font-mono">0 - 0</td>
                    <td className="p-3 font-mono">0 - 0</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-600">+{config.exactScore}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Marcador exacto (incluye empates)
                    </td>
                  </tr>
                  <tr className="example-row opacity-0">
                    <td className="p-3 font-mono">2 - 0</td>
                    <td className="p-3 font-mono">0 - 1</td>
                    <td className="p-3">
                      <Badge variant="destructive">0</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Predijiste local, gano visitante
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Estados del partido */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-900">
          Estados de un partido
        </h2>

        <div className="space-y-3">
          <Card className="rules-card border-blue-100">
            <CardContent className="p-4 flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                Programado
              </Badge>
              <p className="text-sm text-muted-foreground">
                El partido aun no inicia. Puedes crear o modificar tu
                prediccion libremente.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-blue-100">
            <CardContent className="p-4 flex items-start gap-3">
              <Badge variant="destructive" className="mt-0.5 shrink-0">
                Bloqueado
              </Badge>
              <p className="text-sm text-muted-foreground">
                El partido esta a punto de iniciar o ya inicio. Las
                predicciones estan cerradas y ya no se pueden modificar.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-blue-100">
            <CardContent className="p-4 flex items-start gap-3">
              <Badge className="mt-0.5 shrink-0">
                Finalizado
              </Badge>
              <p className="text-sm text-muted-foreground">
                El partido termino. El resultado ya fue registrado y tus
                puntos fueron calculados automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-900">
          Consejos
        </h2>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-5 space-y-3">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">&#9679;</span>
                <span>
                  Intenta predecir el marcador exacto siempre que puedas, ya
                  que otorga la mayor cantidad de puntos.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">&#9679;</span>
                <span>
                  Si no estas seguro del marcador, al menos intenta acertar
                  al ganador para obtener puntos parciales.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">&#9679;</span>
                <span>
                  No olvides hacer tu prediccion antes de que el partido sea
                  bloqueado, ya que despues no podras modificarla.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">&#9679;</span>
                <span>
                  Puedes cambiar tu prediccion cuantas veces quieras mientras
                  el partido siga en estado &quot;Programado&quot;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">&#9679;</span>
                <span>
                  Revisa el ranking frecuentemente para ver tu posicion y
                  motivarte a seguir participando.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
