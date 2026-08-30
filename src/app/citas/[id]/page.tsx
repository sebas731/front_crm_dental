"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AtencionForm } from "@/components/citas/AtencionForm";
import { WhatsAppButton } from "@/components/citas/WhatsAppButton";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { Card } from "@/components/ui/Card";
import { ESTADO_CITA } from "@/lib/estados";
import { getCita, listMedicos, listServicios } from "@/services/citas";
import { listPacientes } from "@/services/pacientes";
import type { Cita, Medico, Paciente, ServicioDental } from "@/types";

export default function CitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [cita, setCita] = useState<Cita | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getCita(id), listMedicos(), listPacientes(), listServicios()])
      .then(([c, m, p, s]) => {
        if (!active) return;
        setCita(c);
        setMedicos(m.results);
        setPacientes(p.results);
        setServicios(s.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const paciente = pacientes.find((x) => x.id === cita?.paciente);
  const medicoName = (mid: string) => {
    const m = medicos.find((x) => x.id === mid);
    return m ? `${m.nombres} ${m.apellidos}` : mid;
  };

  if (loading) {
    return (
      <AppShell>
        <p className="text-slate-500">Cargando…</p>
      </AppShell>
    );
  }
  if (!cita) {
    return (
      <AppShell>
        <p className="text-slate-500">Cita no encontrada.</p>
        <Link href="/citas" className="text-teal-600 underline">
          Volver
        </Link>
      </AppShell>
    );
  }

  const est = ESTADO_CITA[cita.estado];

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/citas">Citas</BackButton>
        <h1 className="text-2xl font-semibold text-slate-800">Cita</h1>
        <Badge label={est.label} color={est.color} />
        <div className="ml-auto">
          <WhatsAppButton cita={cita} paciente={paciente} />
        </div>
      </div>

      <div className="mb-6 grid gap-2 rounded-2xl border border-slate-200/70 bg-white p-4 text-sm shadow-sm sm:grid-cols-2">
        <div>
          <span className="text-slate-400">Paciente:</span>{" "}
          {paciente
            ? `${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`
            : cita.paciente}
        </div>
        <div>
          <span className="text-slate-400">Médico:</span>{" "}
          {medicoName(cita.medico)}
        </div>
        <div>
          <span className="text-slate-400">Fecha:</span> {cita.fecha}{" "}
          {cita.hora_inicio.slice(0, 5)}
        </div>
        <div>
          <span className="text-slate-400">Motivo:</span> {cita.motivo || "—"}
        </div>
      </div>

      <Card title={`Atención ${cita.atencion ? "✓" : ""}`}>
        <AtencionForm
          cita={cita}
          medicos={medicos}
          servicios={servicios}
          onSaved={setCita}
        />
      </Card>
    </AppShell>
  );
}
