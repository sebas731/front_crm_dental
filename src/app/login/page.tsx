"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ApiError } from "@/services/api";

const BULLETS = [
  { icon: Users, text: "Pacientes e historias clínicas centralizadas" },
  { icon: CalendarCheck, text: "Agenda y control de citas en tiempo real" },
  { icon: ShieldCheck, text: "Pagos validados y trazables" },
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
        className="relative hidden w-2/5 flex-col justify-between bg-teal-700 p-10 text-white md:flex"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Stethoscope className="h-6 w-6" />
          </span>
          <span className="text-xl font-semibold">DENTAL SAC</span>
        </div>
        <div>
          <h2 className="text-2xl leading-snug font-semibold">
            Gestión clínica dental, simple y ordenada.
          </h2>
          <ul className="mt-6 space-y-3">
            {BULLETS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-teal-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-teal-200/80">© DENTAL SAC · v1.0</p>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
        >
          <div className="space-y-1 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white md:hidden">
              <Stethoscope className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-semibold text-slate-800">
              Iniciar sesión
            </h1>
            <p className="text-sm text-slate-500">
              Ingresá tus credenciales para continuar
            </p>
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

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
