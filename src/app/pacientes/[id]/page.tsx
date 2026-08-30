"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ClipboardList, FileText, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { AntecedentesPanel } from "@/components/historia/AntecedentesPanel";
import { AtencionesTab } from "@/components/historia/AtencionesTab";
import { DocumentosPanel } from "@/components/historia/DocumentosPanel";
import { FichaPaciente } from "@/components/historia/FichaPaciente";
import { OdontogramaEditor } from "@/components/odontograma/OdontogramaEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createHistoria, getHistoriaByPaciente } from "@/services/historia";
import {
  listCitasByPaciente,
  listMedicos,
  listServicios,
} from "@/services/citas";
import { getPaciente } from "@/services/pacientes";
import type {
  Cita,
  HistoriaClinica,
  Medico,
  Paciente,
  ServicioDental,
} from "@/types";

type Tab = "historia" | "atenciones";

export default function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [tab, setTab] = useState<Tab>("historia");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getPaciente(id),
      getHistoriaByPaciente(id),
      listCitasByPaciente(id),
      listMedicos(),
      listServicios(),
    ])
      .then(([p, h, c, m, s]) => {
        if (!active) return;
        setPaciente(p);
        setHistoria(h);
        setCitas(c.results);
        setMedicos(m.results);
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

  async function reloadHistoria() {
    setHistoria(await getHistoriaByPaciente(id));
  }

  async function handleCrearHistoria() {
    if (!paciente) return;
    setCreating(true);
    try {
      const h = await createHistoria(
        paciente.id,
        `HC-${paciente.numero_documento}`,
      );
      setHistoria(h);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-slate-500">Cargando…</p>
      </AppShell>
    );
  }
  if (!paciente) {
    return (
      <AppShell>
        <p className="text-slate-500">Paciente no encontrado.</p>
        <Link href="/pacientes" className="text-teal-600 underline">
          Volver
        </Link>
      </AppShell>
    );
  }

  const odontograma = historia?.odontogramas?.[0] ?? null;
  const atendidasCount = citas.filter(
    (c) => c.estado === "ATENDIDA" || c.atencion,
  ).length;

  const tabs: {
    key: Tab;
    label: string;
    icon: typeof FileText;
    sub: string;
  }[] = [
    {
      key: "historia",
      label: "Historia clínica",
      icon: FileText,
      sub: historia ? `${historia.documentos.length} documentos` : "sin crear",
    },
    {
      key: "atenciones",
      label: "Atenciones",
      icon: Stethoscope,
      sub: `${atendidasCount} atendidas`,
    },
  ];

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/pacientes">Pacientes</BackButton>
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Ficha del paciente
        </h1>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Izquierda: datos del paciente */}
        <div className="lg:col-span-1">
          <FichaPaciente paciente={paciente} />
        </div>

        {/* Derecha: tarjetas + contenido */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {tabs.map(({ key, label, icon: Icon, sub }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition-all ${
                    active
                      ? "border-teal-500 ring-2 ring-teal-200"
                      : "border-slate-200/70 hover:border-teal-300"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active
                        ? "bg-teal-600 text-white"
                        : "bg-teal-50 text-teal-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </button>
              );
            })}
          </div>

          {tab === "historia" &&
            (!historia ? (
              <Card title="Historia clínica">
                <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <ClipboardList className="h-4 w-4" />
                  Este paciente aún no tiene historia clínica.
                </p>
                <Button onClick={handleCrearHistoria} disabled={creating}>
                  {creating ? "Creando…" : "Crear historia clínica"}
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card title="Antecedentes personales y familiares">
                  <AntecedentesPanel
                    historiaId={historia.id}
                    antecedentes={historia.antecedentes}
                    onSaved={reloadHistoria}
                  />
                </Card>
                <Card title="Documentos">
                  <DocumentosPanel
                    historiaId={historia.id}
                    documentos={historia.documentos}
                    onChange={reloadHistoria}
                  />
                </Card>
                <Card title="Odontograma">
                  <OdontogramaEditor
                    historiaId={historia.id}
                    odontograma={odontograma}
                    onSaved={reloadHistoria}
                  />
                </Card>
              </div>
            ))}

          {tab === "atenciones" && (
            <Card title="Citas atendidas">
              <AtencionesTab
                citas={citas}
                medicos={medicos}
                servicios={servicios}
              />
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
