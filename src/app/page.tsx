"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FunnelCard } from "@/components/dashboard/FunnelCard";
import { ProximasCitas } from "@/components/dashboard/ProximasCitas";
import { TareasCard } from "@/components/dashboard/TareasCard";
import { VentasAnalytics } from "@/components/dashboard/VentasAnalytics";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import { alertasCuotas } from "@/lib/alertas";
import { hoyLocal } from "@/lib/fechas";
import { esAdministrativo } from "@/lib/roles";
import { listCitas, listServicios } from "@/services/citas";
import { listVentas } from "@/services/ventas";
import { listPacientes } from "@/services/pacientes";
import { listUsers } from "@/services/users";
import type { Cita, Paciente, ServicioDental, User, Venta } from "@/types";

type Vista = "resumen" | "ventas";

export default function DashboardPage() {
  const { user } = useAuth();
  const admin = esAdministrativo(user);
  const [vista, setVista] = useState<Vista>("resumen");
  const [citas, setCitas] = useState<Cita[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pacientesCount, setPacientesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const empty = Promise.resolve({ results: [] });
    Promise.all([
      listCitas(),
      listPacientes(),
      admin ? listVentas() : empty,
      admin ? listServicios() : empty,
      admin ? listUsers() : empty,
    ])
      .then(([c, p, v, s, u]) => {
        if (!active) return;
        setCitas(c.results);
        setPacientes(p.results);
        setPacientesCount(p.count);
        setVentas((v as { results: Venta[] }).results);
        setServicios((s as { results: ServicioDental[] }).results);
        setUsers((u as { results: User[] }).results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [admin]);

  const nombre = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : "Paciente";
  };

  const atendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
  const programadas = citas.filter((c) => c.estado === "PROGRAMADA").length;
  const porCobrar = useMemo(
    () =>
      ventas
        .filter((v) => v.estado === "PENDIENTE")
        .reduce((acc, v) => acc + Number(v.saldo), 0),
    [ventas],
  );
  const alertas = useMemo(() => alertasCuotas(ventas, 7), [ventas]);
  const proximas = useMemo(() => {
    const hoy = hoyLocal();
    // Solo citas realmente pendientes (no atendidas, canceladas ni inasistencias).
    const PENDIENTES = ["PROGRAMADA", "CONFIRMADA", "EN_ATENCION"];
    return citas
      .filter((c) => c.fecha >= hoy && PENDIENTES.includes(c.estado))
      .sort((a, b) =>
        (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio),
      )
      .slice(0, 5);
  }, [citas]);

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            {vista === "resumen" ? "Resumen" : "Ventas"}
          </h1>
          <p className="text-sm text-slate-500">
            {vista === "resumen"
              ? "Vista general de la clínica"
              : "Análisis de ventas y cobranza"}
          </p>
        </div>
        {admin && (
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setVista("resumen")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                vista === "resumen"
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Resumen
            </button>
            <button
              onClick={() => setVista("ventas")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                vista === "ventas"
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Ventas
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : vista === "ventas" && admin ? (
        <VentasAnalytics ventas={ventas} servicios={servicios} users={users} />
      ) : (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatCard
              icon={Users}
              value={pacientesCount}
              label="Pacientes"
              tono="teal"
            />
            <StatCard
              icon={CalendarDays}
              value={citas.length}
              label="Citas"
              tono="cyan"
            />
            <StatCard
              icon={CheckCircle2}
              value={atendidas}
              label="Atendidas"
              tono="emerald"
            />
            {admin ? (
              <StatCard
                icon={CreditCard}
                value={`S/ ${porCobrar.toFixed(0)}`}
                label="Por cobrar"
                sub="saldo de ventas"
                tono="amber"
              />
            ) : (
              <StatCard
                icon={CalendarClock}
                value={programadas}
                label="Programadas"
                tono="amber"
              />
            )}
          </div>

          {admin ? (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              <FunnelCard citas={citas} />
              <TareasCard alertas={alertas} nombre={nombre} />
            </div>
          ) : (
            <FunnelCard citas={citas} />
          )}

          <ProximasCitas citas={proximas} nombre={nombre} />
        </div>
      )}
    </AppShell>
  );
}
