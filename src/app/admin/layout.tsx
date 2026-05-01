import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "./admin-nav";

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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Admin</h1>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
