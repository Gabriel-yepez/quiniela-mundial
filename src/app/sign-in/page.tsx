"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type Mode = "signin" | "register" | "set-password" | "forgot-password" | "reset-password";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot-password") {
        const checkRes = await fetch("/api/auth/check-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const checkData = await checkRes.json();

        if (!checkData.exists) {
          toast.error("No existe una cuenta con ese correo");
          setLoading(false);
          return;
        }

        setMode("reset-password");
        setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setLoading(false);
        return;
      }

      if (mode === "reset-password") {
        if (form.password !== form.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Error al restablecer contraseña");
          setLoading(false);
          return;
        }

        toast.success("Contraseña actualizada. Iniciando sesion...");

        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Contraseña actualizada, pero hubo un error al iniciar sesion.");
          setMode("signin");
          setLoading(false);
          return;
        }

        router.push("/matches");
        return;
      }

      if (mode === "set-password") {
        const res = await fetch("/api/auth/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Error al establecer contrasena");
          setLoading(false);
          return;
        }

        toast.success("Contrasena establecida. Iniciando sesion...");

        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Error al iniciar sesion");
          setLoading(false);
          return;
        }

        router.push("/matches");
        return;
      }

      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Error al registrarse", {
            description: "Revisa los datos e intenta de nuevo.",
          });
          setLoading(false);
          return;
        }

        toast.success("Cuenta creada. Iniciando sesion...");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        const checkRes = await fetch("/api/auth/check-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const checkData = await checkRes.json();

        if (checkData.needsPassword) {
          setMode("set-password");
          setForm((prev) => ({ ...prev, password: "" }));
          toast.info(
            "Esta cuenta fue creada con Google. Establece una contrasena para iniciar sesion con email.",
          );
          setLoading(false);
          return;
        }

        toast.error("Correo o contrasena incorrectos", {
          description: "Verifica tus credenciales e intenta nuevamente.",
        });
        setLoading(false);
        return;
      }

      router.push("/matches");
    } catch {
      toast.error("Error de conexion", {
        description: "No se pudo conectar al servidor. Intenta mas tarde.",
      });
      setLoading(false);
    }
  }

  const titles: Record<Mode, string> = {
    signin: "Iniciar sesion",
    register: "Crear cuenta",
    "set-password": "Establecer contrasena",
    "forgot-password": "Recuperar contraseña",
    "reset-password": "Nueva contraseña",
  };

  const descriptions: Record<Mode, string> = {
    signin: "Inicia sesion para hacer tus predicciones",
    register: "Registrate para hacer tus predicciones",
    "set-password":
      "Tu cuenta fue creada con Google. Establece una contrasena para poder iniciar sesion con email y contrasena.",
    "forgot-password": "Ingresa tu correo para restablecer tu contraseña.",
    "reset-password": `Ingresa la nueva contraseña para ${form.email}`,
  };

  const buttonLabels: Record<Mode, string> = {
    signin: "Iniciar sesion",
    register: "Registrarse",
    "set-password": "Guardar contrasena e iniciar sesion",
    "forgot-password": "Continuar",
    "reset-password": "Guardar contraseña e iniciar sesion",
  };

  const showEmailField = mode === "signin" || mode === "register" || mode === "forgot-password";
  const showPasswordField = mode === "signin" || mode === "register" || mode === "set-password" || mode === "reset-password";
  const showConfirmField = mode === "reset-password";
  const showBackLink = mode === "set-password" || mode === "forgot-password" || mode === "reset-password";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="w-full max-w-sm border-blue-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-900">
            {titles[mode]}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{descriptions[mode]}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="space-y-1">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}
            {showEmailField && (
              <div className="space-y-1">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
            )}
            {mode === "set-password" && (
              <div className="space-y-1">
                <Label>Correo electronico</Label>
                <Input
                  type="email"
                  value={form.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}
            {mode === "reset-password" && (
              <div className="space-y-1">
                <Label>Correo electronico</Label>
                <Input
                  type="email"
                  value={form.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}
            {showPasswordField && (
              <div className="space-y-1">
                <Label htmlFor="password">
                  {mode === "set-password" || mode === "reset-password"
                    ? "Nueva contraseña"
                    : "Contrasena"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={mode === "set-password" || mode === "reset-password" ? 6 : 5}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {(mode === "set-password" || mode === "reset-password") && (
                  <p className="text-xs text-muted-foreground">
                    Minimo 6 caracteres
                  </p>
                )}
              </div>
            )}
            {showConfirmField && (
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white hover:bg-blue-600"
            >
              {loading ? "Cargando..." : buttonLabels[mode]}
            </Button>
          </form>

          {showBackLink && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setForm({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Volver a iniciar sesion
              </button>
            </div>
          )}

          {(mode === "signin" || mode === "register") && (
            <>
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setMode(mode === "register" ? "signin" : "register")
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  {mode === "register"
                    ? "Ya tienes cuenta? Inicia sesion"
                    : "No tienes cuenta? Registrate"}
                </button>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot-password");
                      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                    }}
                    className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
                  >
                    Olvidaste tu contraseña?
                  </button>
                )}
              </div>

              <div className="relative">
                <Separator />
              </div>

              <Button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/matches" })}
                variant="outline"
                className="w-full h-11 gap-3 p-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Iniciar con Google
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
