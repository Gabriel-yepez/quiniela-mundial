import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white">
      <div className="flex items-center gap-6 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Admin</h1>
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            Partidos
          </Link>
          <Link
            href="/admin/scoring"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            Puntuacion
          </Link>
          <Link
            href="/admin/stats"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            Estadísticas
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
