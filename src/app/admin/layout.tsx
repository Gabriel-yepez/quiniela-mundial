import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
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
