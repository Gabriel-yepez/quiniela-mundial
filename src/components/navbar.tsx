"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

gsap.registerPlugin(useGSAP);

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== "/";
  const navRef = useRef<HTMLElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { role: null }))
      .then((data: { role: string | null }) => {
        if (!cancelled) setIsAdmin(data.role === "admin");
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  useGSAP(
    () => {
      gsap.fromTo(
        navRef.current,
        { y: -72, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "power3.out", delay: 0.05 }
      );
    },
    { scope: navRef }
  );

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 border-b border-black/5 bg-white/80 text-neutral-900 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-6">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Volver"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 text-[1.1rem] font-semibold tracking-[-0.02em] text-neutral-900"
          >
            Quiniela Mundial
          </Link>
          {session && (
            <div className="hidden sm:flex items-center gap-4">
              {[
                { href: "/matches", label: "Partidos" },
                { href: "/groups", label: "Grupos" },
                { href: "/predictions", label: "Mis Predicciones" },
                { href: "/leaderboard", label: "Ranking" },
                { href: "/rules", label: "Reglas" },
                ...(isAdmin
                  ? [{ href: "/admin", label: "Admin" }]
                  : []),
              ].map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "text-sm font-semibold text-black transition-colors"
                        : "text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt={session.user.name ?? ""}
                  />
                  <AvatarFallback>
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  {session.user.name}
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Link href="/matches" className="w-full">
                    Partidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Link href="/groups" className="w-full">
                    Grupos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Link href="/predictions" className="w-full">
                    Mis Predicciones
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Link href="/leaderboard" className="w-full">
                    Ranking
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Link href="/rules" className="w-full">
                    Reglas
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="sm:hidden">
                    <Link href="/admin" className="w-full">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button
                size="sm"
                className="border border-neutral-300 bg-gradient-to-b from-white to-neutral-100 text-neutral-900 hover:from-neutral-50 hover:to-neutral-200 text-base px-6 py-4 shadow-sm"
              >
                Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
