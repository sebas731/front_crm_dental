"use client";

import { use, useEffect, useState } from "react";
import { ClipboardList, FileText, Stethoscope, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { AntecedentesPanel } from "@/components/historia/AntecedentesPanel";
import { AtencionesTab } from "@/components/historia/AtencionesTab";
import { DocumentosPanel } from "@/components/historia/DocumentosPanel";
import { FichaPaciente } from "@/components/historia/FichaPaciente";
import { HistorialPagos } from "@/components/historia/HistorialPagos";
import { OdontogramaEditor } from "@/components/odontograma/OdontogramaEditor";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { Button } from "@/components/ui/Button";
import { CargaEstado } from "@/components/ui/CargaEstado";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";
import { esAdministrativo, puedeRegistrarPacientes } from "@/lib/roles";
import { createHistoria, getHistoriaByPaciente } from "@/services/historia";
import {
  listCitasByPaciente,
  listMedicos,
  listServicios,
} from "@/services/citas";
import { getPaciente, updatePaciente } from "@/services/pacientes";
import { listVentas } from "@/services/ventas";
import type {
  Cita,
  HistoriaClinica,
  Medico,
  Paciente,
  ServicioDental,
  Venta,
} from "@/types";

type Tab = "historia" | "atenciones" | "pagos";

export default function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const puedeEditar = puedeRegistrarPacientes(user);
  const puedeVerPagos = esAdministrativo(user); // finanzas solo administrativos
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [tab, setTab] = useState<Tab>("historia");
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<"notfound" | "server" | null>(
    null,
  );
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
      .catch((err) => {
        if (!active) return;
        setErrorCarga(
          err instanceof ApiError && err.status === 404 ? "notfound" : "server",
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!puedeVerPagos) return;
    let active = true;
    listVentas({ paciente: id })
      .then((r) => {
        if (active) setVentas(r.results);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id, puedeVerPagos]);

  async function reloadHistoria() {
    setHistoria(await getHistoriaByPaciente(id));
  }

  async function handleUpdate(data: Parameters<typeof updatePaciente>[1]) {
    const updated = await updatePaciente(id, data);
    setPaciente(updated);
    setEditando(false);
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

  if (loading || errorCarga || !paciente) {
    return (
      <CargaEstado
        estado={
          loading ? "cargando" : errorCarga === "server" ? "server" : "notfound"
        }
        entidad="Paciente"
        volverHref="/pacientes"
        volverLabel="Volver a pacientes"
      />
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
    ...(puedeVerPagos
      ? [
          {
            key: "pagos" as Tab,
            label: "Historial de pagos",
            icon: Wallet,
            sub: `${ventas.length} venta(s)`,
          },
        ]
      : []),
  ];

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/pacientes">Pacientes</BackButton>
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Ficha del paciente
        </h1>
        {puedeEditar && (
          <Button
            variant="secondary"
            className="ml-auto px-3 py-1.5 text-xs"
            onClick={() => setEditando((v) => !v)}
          >
            {editando ? "Cancelar" : "Editar datos"}
          </Button>
        )}
      </div>

      {editando && puedeEditar && (
        <Card title="Editar datos del paciente" className="mb-4">
          <PacienteForm
            initial={paciente}
            submitLabel="Guardar cambios"
            onSubmit={handleUpdate}
          />
        </Card>
      )}

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Izquierda: datos del paciente */}
        <div className="lg:col-span-1">
          <FichaPaciente paciente={paciente} />
        </div>

        {/* Derecha: tarjetas + contenido */}
        <div className="space-y-4 lg:col-span-2">
          <div
            className={`grid gap-3 md:gap-4 ${
              tabs.length > 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
            }`}
          >
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
                    readOnly={!puedeEditar}
                  />
                </Card>
                <Card title="Documentos">
                  <DocumentosPanel
                    historiaId={historia.id}
                    documentos={historia.documentos}
                    onChange={reloadHistoria}
                    readOnly={!puedeEditar}
                  />
                </Card>
                <Card title="Odontograma">
                  <OdontogramaEditor
                    historiaId={historia.id}
                    odontograma={odontograma}
                    onSaved={reloadHistoria}
                    readOnly={!puedeEditar}
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

          {tab === "pagos" && puedeVerPagos && (
            <Card title="Historial de pagos">
              <HistorialPagos
                ventas={ventas}
                servicios={servicios}
                pacienteNombre={`${paciente.nombres} ${paciente.apellido_paterno} ${paciente.apellido_materno}`.trim()}
              />
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
