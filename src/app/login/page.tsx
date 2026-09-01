"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { ApiError } from "@/services/api";

const BULLETS = [
  { icon: Users, text: "Pacientes e historias clínicas centralizadas" },
  { icon: CalendarCheck, text: "Agenda y control de citas en tiempo real" },
  { icon: ShieldCheck, text: "Ventas, cuotas y pagos validados" },
];

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Usuario o contraseña incorrectos."
          : "No se pudo iniciar sesión. Intentá de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Panel de marca (desktop) */}
      <div
        className="relative hidden w-2/5 flex-col justify-between overflow-hidden p-10 text-white md:flex"
        style={{
          backgroundColor: "#0d9488",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(135deg, #0d9488 0%, #0e7490 55%, #155e75 100%)",
          backgroundSize: "18px 18px, auto",
        }}
      >
        {/* Marca de agua del logo */}
        <div className="pointer-events-none absolute -right-16 -bottom-16 opacity-10">
          <LogoMark size={280} tone="white" />
        </div>

        <div className="relative">
          <Logo tone="white" size={46} />
        </div>

        <div className="relative">
          <h2 className="max-w-sm text-3xl leading-snug font-semibold">
            Gestión clínica dental, simple y ordenada.
          </h2>
          <ul className="mt-8 space-y-4">
            {BULLETS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/25">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-teal-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-teal-100/80">
          © DENTAL STUDIO · v1.0
        </p>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
              <LogoMark size={40} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Bienvenido
              </h1>
              <p className="text-sm text-slate-500">
                Ingresá a tu cuenta de DENTAL STUDIO
              </p>
            </div>
          </div>

          <Input
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
