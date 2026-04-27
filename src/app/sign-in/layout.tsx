import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta de Quiniela Mundial para hacer tus predicciones del Mundial 2026.",
  alternates: {
    canonical: "/sign-in",
  },
  robots: { index: false },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
