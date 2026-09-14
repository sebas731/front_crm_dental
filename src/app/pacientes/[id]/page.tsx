"use client";

import { use, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { AntecedentesPanel } from "@/components/historia/AntecedentesPanel";
import { AtencionesTab } from "@/components/historia/AtencionesTab";
import { DocumentosPanel } from "@/components/historia/DocumentosPanel";
import { FichaHeader } from "@/components/historia/FichaHeader";
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
  listAllMedicos,
  listAllServicios,
  listCitasByPaciente,
} from "@/services/citas";
import { getPaciente, updatePaciente } from "@/services/pacientes";
import { listAllVentas } from "@/services/ventas";
import type {
  Cita,
  HistoriaClinica,
  Medico,
  Paciente,
  ServicioDental,
  Venta,
} from "@/types";

type Tab = "datos" | "historia" | "odontograma" | "atenciones" | "pagos";

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
  const [tab, setTab] = useState<Tab>("datos");
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
      listAllMedicos(),
      listAllServicios(),
    ])
      .then(([p, h, c, m, s]) => {
        if (!active) return;
        setPaciente(p);
        setHistoria(h);
        setCitas(c);
        setMedicos(m);
        setServicios(s);
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
    listAllVentas({ paciente: id })
      .then((r) => {
        if (active) setVentas(r);
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "datos", label: "Datos del paciente" },
    { key: "historia", label: "Ficha clínica" },
    { key: "odontograma", label: "Odontograma" },
    { key: "atenciones", label: `Atenciones (${atendidasCount})` },
    ...(puedeVerPagos
      ? [{ key: "pagos" as Tab, label: "Facturación y pagos" }]
      : []),
  ];

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/pacientes">Pacientes</BackButton>
        {puedeEditar && (
          <Button
            variant="secondary"
            className="ml-auto px-3 py-1.5 text-xs"
            onClick={() => {
              setEditando((v) => !v);
              setTab("datos");
            }}
          >
            {editando ? "Cancelar" : "Editar datos"}
          </Button>
        )}
      </div>

      {/* Cabecera con los datos personales */}
      <FichaHeader paciente={paciente} />

      {/* Separador de secciones (tabs) */}
      <div className="mt-4 mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "datos" &&
        (editando && puedeEditar ? (
          <Card title="Editar datos del paciente">
            <PacienteForm
              initial={paciente}
              submitLabel="Guardar cambios"
              onSubmit={handleUpdate}
            />
          </Card>
        ) : (
          <FichaPaciente paciente={paciente} />
        ))}

      {tab === "historia" &&
        (!historia ? (
          <Card title="Ficha clínica">
            <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <ClipboardList className="h-4 w-4" />
              Este paciente aún no tiene historia clínica.
            </p>
            {puedeEditar && (
              <Button onClick={handleCrearHistoria} disabled={creating}>
                {creating ? "Creando…" : "Crear historia clínica"}
              </Button>
            )}
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
          </div>
        ))}

      {tab === "odontograma" &&
        (!historia ? (
          <Card title="Odontograma">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <ClipboardList className="h-4 w-4" />
              Primero creá la historia clínica (pestaña “Ficha clínica”).
            </p>
          </Card>
        ) : (
          <Card title="Odontograma">
            <OdontogramaEditor
              historiaId={historia.id}
              odontograma={odontograma}
              onSaved={reloadHistoria}
              readOnly={!puedeEditar}
            />
          </Card>
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
    </AppShell>
  );
}
