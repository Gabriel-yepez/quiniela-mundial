"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Partidos" },
  { href: "/admin/qualifiers", label: "Clasificados" },
  { href: "/admin/scoring", label: "Puntuacion" },
  { href: "/admin/stats", label: "Estadísticas" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-colors"
                : "rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
