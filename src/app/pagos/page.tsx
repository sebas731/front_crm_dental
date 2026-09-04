"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PipelineTimeline } from "@/components/pipeline/PipelineTimeline";
import { Card } from "@/components/ui/Card";
import { PacientePicker } from "@/components/ui/PacientePicker";
import { listVentas } from "@/services/ventas";
import { listPacientes } from "@/services/pacientes";
import type { Paciente, Venta } from "@/types";

export default function PagosPipelinePage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listVentas(), listPacientes()])
      .then(([v, p]) => {
        if (!active) return;
        setVentas(v.results);
        setPacientes(p.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pacienteName = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : "Paciente";
  };

  const filtradas = useMemo(
    () =>
      pacienteId ? ventas.filter((v) => v.paciente === pacienteId) : ventas,
    [ventas, pacienteId],
  );

  const totalPagado = useMemo(
    () => filtradas.reduce((acc, v) => acc + Number(v.total_pagado), 0),
    [filtradas],
  );

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Pipeline de pagos
        </h1>
        <p className="text-sm text-slate-500">
          Ventas, cuotas y pagos por paciente
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <PacientePicker
            pacientes={pacientes}
            value={pacienteId}
            onChange={setPacienteId}
          />
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-400">Total pagado</p>
          <p className="text-lg font-semibold text-emerald-600">
            S/ {totalPagado.toFixed(2)}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <Card>
          <PipelineTimeline ventas={filtradas} pacienteName={pacienteName} />
        </Card>
      )}
    </AppShell>
  );
}
