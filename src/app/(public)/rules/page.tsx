"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div ref={containerRef} className="mx-auto max-w-3xl space-y-10 px-4 py-10 text-white">
      <div className="rules-hero space-y-3 text-center opacity-0">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Reglas de la Quiniela
        </h1>
        <p className="mx-auto max-w-xl text-white/70">
          Predice los resultados de los partidos del Mundial y compite
          contra otros jugadores para ganar la mayor cantidad de puntos.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Como funciona</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rules-card border-white/12 bg-white/10 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-900">
                  1
                </span>
                <h3 className="font-semibold text-white">Registrate</h3>
              </div>
              <p className="text-sm text-white/65">
                Crea tu cuenta con correo y contrasena o inicia sesion con
                Google para comenzar a participar.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-white/12 bg-white/10 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-900">
                  2
                </span>
                <h3 className="font-semibold text-white">Haz tus predicciones</h3>
              </div>
              <p className="text-sm text-white/65">
                Entra a cada partido y predice el marcador final (goles local
                y visitante). Puedes modificar tu prediccion hasta que el
                partido sea bloqueado.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-white/12 bg-white/10 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-900">
                  3
                </span>
                <h3 className="font-semibold text-white">Espera los resultados</h3>
              </div>
              <p className="text-sm text-white/65">
                Cuando el partido finalice, el administrador registrara el
                marcador real y el sistema calculara automaticamente tus
                puntos.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-white/12 bg-white/10 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-900">
                  4
                </span>
                <h3 className="font-semibold text-white">Revisa el ranking</h3>
              </div>
              <p className="text-sm text-white/65">
                Consulta la tabla de posiciones para ver como vas comparado
                con los demas participantes. El que acumule mas puntos al
                final del torneo gana.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Sistema de puntos</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="points-card border-white/15 bg-white/14 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5 text-center">
              <div className="text-4xl font-bold text-white">{config.exactScore}</div>
              <div className="text-sm font-semibold text-white">Marcador exacto</div>
              <p className="text-xs text-white/65">
                Acertaste el resultado exacto del partido (mismos goles para
                ambos equipos).
              </p>
            </CardContent>
          </Card>

          <Card className="points-card border-white/12 bg-white/10 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5 text-center">
              <div className="text-4xl font-bold text-white/90">{config.correctWinner}</div>
              <div className="text-sm font-semibold text-white">Ganador correcto</div>
              <p className="text-xs text-white/65">
                Acertaste quien gano el partido pero no el marcador exacto.
              </p>
            </CardContent>
          </Card>

          <Card className="points-card border-white/10 bg-white/8 opacity-0 backdrop-blur-sm">
            <CardContent className="space-y-2 p-5 text-center">
              <div className="text-4xl font-bold text-white/80">{config.correctDraw}</div>
              <div className="text-sm font-semibold text-white">Empate correcto</div>
              <p className="text-xs text-white/65">
                Predijiste empate y el partido termino en empate, pero con
                diferente marcador.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/12 bg-white/10 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <Badge className="shrink-0 border border-white/18 bg-white/16 text-white hover:bg-white/16">
              0 pts
            </Badge>
            <p className="text-sm text-white/65">
              Si no aciertas ninguna de las condiciones anteriores, no
              obtendras puntos por ese partido.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Ejemplos</h2>

        <Card className="border-white/12 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead>
                  <tr className="border-b border-white/10 bg-white/6">
                    <th className="p-3 text-left font-medium">Tu prediccion</th>
                    <th className="p-3 text-left font-medium">Resultado real</th>
                    <th className="p-3 text-left font-medium">Puntos</th>
                    <th className="p-3 text-left font-medium">Razon</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="example-row border-b border-white/10 opacity-0">
                    <td className="p-3 font-mono">2 - 1</td>
                    <td className="p-3 font-mono">2 - 1</td>
                    <td className="p-3">
                      <Badge className="bg-white text-zinc-900">+{config.exactScore}</Badge>
                    </td>
                    <td className="p-3 text-white/65">Marcador exacto</td>
                  </tr>
                  <tr className="example-row border-b border-white/10 opacity-0">
                    <td className="p-3 font-mono">3 - 1</td>
                    <td className="p-3 font-mono">2 - 0</td>
                    <td className="p-3">
                      <Badge className="bg-white/75 text-zinc-900">+{config.correctWinner}</Badge>
                    </td>
                    <td className="p-3 text-white/65">Gano el local en ambos casos</td>
                  </tr>
                  <tr className="example-row border-b border-white/10 opacity-0">
                    <td className="p-3 font-mono">0 - 2</td>
                    <td className="p-3 font-mono">1 - 3</td>
                    <td className="p-3">
                      <Badge className="bg-white/75 text-zinc-900">+{config.correctWinner}</Badge>
                    </td>
                    <td className="p-3 text-white/65">Gano el visitante en ambos casos</td>
                  </tr>
                  <tr className="example-row border-b border-white/10 opacity-0">
                    <td className="p-3 font-mono">1 - 1</td>
                    <td className="p-3 font-mono">0 - 0</td>
                    <td className="p-3">
                      <Badge className="bg-white/55 text-zinc-900">+{config.correctDraw}</Badge>
                    </td>
                    <td className="p-3 text-white/65">Ambos son empate, diferente marcador</td>
                  </tr>
                  <tr className="example-row border-b border-white/10 opacity-0">
                    <td className="p-3 font-mono">0 - 0</td>
                    <td className="p-3 font-mono">0 - 0</td>
                    <td className="p-3">
                      <Badge className="bg-white text-zinc-900">+{config.exactScore}</Badge>
                    </td>
                    <td className="p-3 text-white/65">Marcador exacto (incluye empates)</td>
                  </tr>
                  <tr className="example-row opacity-0">
                    <td className="p-3 font-mono">2 - 0</td>
                    <td className="p-3 font-mono">0 - 1</td>
                    <td className="p-3">
                      <Badge className="border border-white/18 bg-white/16 text-white hover:bg-white/16">0</Badge>
                    </td>
                    <td className="p-3 text-white/65">Predijiste local, gano visitante</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Estados de un partido</h2>

        <div className="space-y-3">
          <Card className="rules-card border-white/12 bg-white/10 backdrop-blur-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <Badge variant="secondary" className="mt-0.5 shrink-0 border border-white/12 bg-white/14 text-white">
                Programado
              </Badge>
              <p className="text-sm text-white/65">
                El partido aun no inicia. Puedes crear o modificar tu
                prediccion libremente.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-white/12 bg-white/10 backdrop-blur-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <Badge className="mt-0.5 shrink-0 bg-white/80 text-zinc-900 hover:bg-white/80">
                Bloqueado
              </Badge>
              <p className="text-sm text-white/65">
                El partido esta a punto de iniciar o ya inicio. Las
                predicciones estan cerradas y ya no se pueden modificar.
              </p>
            </CardContent>
          </Card>

          <Card className="rules-card border-white/12 bg-white/10 backdrop-blur-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <Badge className="mt-0.5 shrink-0 bg-white text-zinc-900 hover:bg-white">
                Finalizado
              </Badge>
              <p className="text-sm text-white/65">
                El partido termino. El resultado ya fue registrado y tus
                puntos fueron calculados automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Consejos</h2>

        <Card className="border-white/12 bg-white/10 backdrop-blur-sm">
          <CardContent className="space-y-3 p-5">
            <ul className="space-y-2 text-sm text-white/65">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/45">&#9679;</span>
                <span>
                  Intenta predecir el marcador exacto siempre que puedas, ya
                  que otorga la mayor cantidad de puntos.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/45">&#9679;</span>
                <span>
                  Si no estas seguro del marcador, al menos intenta acertar
                  al ganador para obtener puntos parciales.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/45">&#9679;</span>
                <span>
                  No olvides hacer tu prediccion antes de que el partido sea
                  bloqueado, ya que despues no podras modificarla.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/45">&#9679;</span>
                <span>
                  Puedes cambiar tu prediccion cuantas veces quieras mientras
                  el partido siga en estado &quot;Programado&quot;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-white/45">&#9679;</span>
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
