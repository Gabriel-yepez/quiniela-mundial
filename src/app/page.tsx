import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";

export default function HomePage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-100 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_80%_15%,rgba(212,212,212,0.3),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(229,229,229,0.45),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(163,163,163,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(163,163,163,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative z-10 max-w-lg space-y-8 text-center">
        <h1 className="text-5xl font-semibold tracking-[-0.035em] text-neutral-900 sm:text-7xl">
          Quiniela Mundial
        </h1>

        <p className="text-xl font-medium text-neutral-600 sm:text-2xl">
          Quiniela del Mundial de Futbol
        </p>

        <CountdownTimer />

        <p className="text-sm text-neutral-600">
          11 de junio - 19 de julio, 2026 &middot; USA, Mexico y Canada
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/matches">
            <Button
              size="lg"
              className="h-12 w-full min-w-[160px] border border-neutral-800 bg-neutral-900 text-base text-white hover:bg-neutral-800"
            >
              Ver partidos
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full min-w-[160px] border-neutral-300 bg-white/75 text-base text-neutral-900 hover:bg-neutral-100"
            >
              Ver ranking
            </Button>
          </Link>
          <Link href="/rules">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full min-w-[160px] border-neutral-300 bg-white/75 text-base text-neutral-900 hover:bg-neutral-100"
            >
              Ver reglas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
