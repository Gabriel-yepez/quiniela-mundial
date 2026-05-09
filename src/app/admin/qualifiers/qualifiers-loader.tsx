"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QualifiersClient, type QualifiersData } from "./qualifiers-client";

export function QualifiersLoader() {
  const [data, setData] = useState<QualifiersData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/qualifiers");
        if (!res.ok) throw new Error("No se pudieron cargar los clasificados");
        const json: QualifiersData = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error inesperado");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="py-8 text-center text-white/65">{error}</p>;
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
