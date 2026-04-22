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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Admin</h1>
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Partidos
          </Link>
          <Link
            href="/admin/scoring"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Puntuacion
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
