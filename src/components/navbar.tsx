"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== "/";

  return (
    <nav className="border-b border-blue-800 bg-blue-900 text-white">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-6">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="text-blue-200 hover:text-white transition-colors"
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
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            Quiniela Mundial
          </Link>
          {session && (
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/matches"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Partidos
              </Link>
              <Link
                href="/predictions"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Mis Predicciones
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Ranking
              </Link>
              <Link
                href="/rules"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Reglas
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Admin
                </Link>
              )}
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
                {session.user.role === "admin" && (
                  <DropdownMenuItem className="sm:hidden">
                    <Link href="/admin" className="w-full">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button
                size="sm"
                className="bg-blue-900 border-white border text-white hover:bg-blue-800 text-base px-6 py-4"
              >
                Iniciar sesion
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
