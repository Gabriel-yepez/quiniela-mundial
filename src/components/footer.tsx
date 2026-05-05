import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-base font-semibold text-white">Quiniela Mundial</h2>
            <p className="mt-2 text-sm text-white/60">
              Predice los marcadores del Mundial 2026 y compite con tus amigos.
            </p>
          </div>

          <nav aria-label="Secciones">
            <h3 className="text-sm font-semibold text-white/80">Quiniela</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/matches"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Partidos
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Ranking
                </Link>
              </li>
              <li>
                <Link
                  href="/predictions"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Mis predicciones
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Informacion">
            <h3 className="text-sm font-semibold text-white/80">Informacion</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/rules"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Reglas
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Iniciar sesion
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-white/80">Mundial 2026</h3>
            <p className="mt-3 text-sm text-white/60">
              11 de junio &mdash; 19 de julio, 2026
            </p>
            <p className="mt-1 text-sm text-white/60">
              USA, Mexico y Canada
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Quiniela Mundial. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
