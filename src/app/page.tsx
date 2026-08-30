"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FunnelCard } from "@/components/dashboard/FunnelCard";
import { ProximasCitas } from "@/components/dashboard/ProximasCitas";
import { TareasCard } from "@/components/dashboard/TareasCard";
import { StatCard } from "@/components/ui/StatCard";
import { alertasCuotas } from "@/lib/alertas";
import { listCitas } from "@/services/citas";
import { listVentas } from "@/services/ventas";
import { listPacientes } from "@/services/pacientes";
import type { Cita, Paciente, Venta } from "@/types";

export default function DashboardPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacientesCount, setPacientesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listCitas(), listVentas(), listPacientes()])
      .then(([c, v, p]) => {
        if (!active) return;
        setCitas(c.results);
        setVentas(v.results);
        setPacientes(p.results);
        setPacientesCount(p.count);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const nombre = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : "Paciente";
  };

  const atendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
  const porCobrar = useMemo(
    () =>
      ventas
        .filter((v) => v.estado === "PENDIENTE")
        .reduce((acc, v) => acc + Number(v.saldo), 0),
    [ventas],
  );
  const alertas = useMemo(() => alertasCuotas(ventas, 7), [ventas]);
  const proximas = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return citas
      .filter((c) => c.fecha >= hoy && c.estado !== "CANCELADA")
      .sort((a, b) =>
        (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio),
      )
      .slice(0, 5);
  }, [citas]);

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Resumen
        </h1>
        <p className="text-sm text-slate-500">Vista general de la clínica</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
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
            <StatCard
              icon={CreditCard}
              value={`S/ ${porCobrar.toFixed(0)}`}
              label="Por cobrar"
              sub="saldo de ventas"
              tono="amber"
            />
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <FunnelCard citas={citas} />
            <TareasCard alertas={alertas} nombre={nombre} />
          </div>

          <ProximasCitas citas={proximas} nombre={nombre} />
        </div>
      )}
    </AppShell>
  );
}
