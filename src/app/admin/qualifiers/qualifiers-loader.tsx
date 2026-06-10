"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/lib/api-cache";
import { QualifiersClient, type QualifiersData } from "./qualifiers-client";

export function QualifiersLoader() {
  const { data, error } = useApiQuery<QualifiersData>("/api/admin/qualifiers");

  if (error) {
    return (
      <p className="py-8 text-center text-white/65">
        No se pudieron cargar los clasificados
      </p>
    );
  }
  if (!data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  return <QualifiersClient data={data} />;
}
