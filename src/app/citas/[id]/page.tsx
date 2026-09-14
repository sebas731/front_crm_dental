"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AtencionForm } from "@/components/citas/AtencionForm";
import { WhatsAppButton } from "@/components/citas/WhatsAppButton";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { CargaEstado } from "@/components/ui/CargaEstado";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { HoraAmPm } from "@/components/ui/HoraAmPm";
import { useAuth } from "@/context/AuthContext";
import { ESTADO_CITA } from "@/lib/estados";
import { esAdministrativo, puedeCrearCitas } from "@/lib/roles";
import { ApiError } from "@/services/api";
import {
  deleteCita,
  getCita,
  listAllMedicos,
  listAllServicios,
  updateCita,
} from "@/services/citas";
import { listAllPacientes } from "@/services/pacientes";
import type { Cita, Medico, Paciente, ServicioDental } from "@/types";

export default function CitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const puedeGestionar = puedeCrearCitas(user); // admin y asistente (editar)
  const puedeEliminar = esAdministrativo(user); // borrar: solo administrativos

  const [cita, setCita] = useState<Cita | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<"notfound" | "server" | null>(
    null,
  );
  const [editando, setEditando] = useState(false);
  const [edit, setEdit] = useState({ fecha: "", hora_inicio: "", servicio: "" });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getCita(id),
      listAllMedicos(),
      listAllPacientes(),
      listAllServicios(),
    ])
      .then(([c, m, p, s]) => {
        if (!active) return;
        setCita(c);
        setMedicos(m);
        setPacientes(p);
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

  const paciente = pacientes.find((x) => x.id === cita?.paciente);
  const medicoName = (mid: string) => {
    const m = medicos.find((x) => x.id === mid);
    return m ? `${m.nombres} ${m.apellidos}` : mid;
  };

  // Solo los tratamientos (subservicios), no las categorías.
  const tratamientos = servicios.filter((s) => s.padre);

  function abrirEdicion() {
    if (!cita) return;
    setEdit({
      fecha: cita.fecha,
      hora_inicio: cita.hora_inicio.slice(0, 5),
      servicio: cita.servicio ?? "",
    });
    setEditando(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const actualizada = await updateCita(id, {
        fecha: edit.fecha,
        hora_inicio: edit.hora_inicio,
        servicio: edit.servicio || null,
      });
      setCita(actualizada);
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "¿Eliminar esta cita? Esta acción no se puede deshacer. Úsala solo si te equivocaste al registrarla.",
      )
    )
      return;
    await deleteCita(id);
    router.push("/citas");
  }

  if (loading || errorCarga || !cita) {
    return (
      <CargaEstado
        estado={
          loading ? "cargando" : errorCarga === "server" ? "server" : "notfound"
        }
        entidad="Cita"
        volverHref="/citas"
        volverLabel="Volver a citas"
      />
    );
  }

  const est = ESTADO_CITA[cita.estado];

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <BackButton href="/citas">Citas</BackButton>
        <h1 className="text-2xl font-semibold text-slate-800">Cita</h1>
        <Badge label={est.label} color={est.color} />
        <div className="ml-auto flex items-center gap-2">
          {puedeGestionar && (
            <>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() => (editando ? setEditando(false) : abrirEdicion())}
              >
                {editando ? "Cancelar" : "Editar"}
              </Button>
              {puedeEliminar && (
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  onClick={handleDelete}
                >
                  Eliminar
                </Button>
              )}
            </>
          )}
          <WhatsAppButton cita={cita} paciente={paciente} />
        </div>
      </div>

      {editando && puedeGestionar && (
        <Card title="Editar cita" className="mb-6">
          <form
            onSubmit={handleUpdate}
            className="grid items-end gap-3 sm:grid-cols-3"
          >
            <Input
              label="Fecha"
              type="date"
              value={edit.fecha}
              onChange={(e) => setEdit((f) => ({ ...f, fecha: e.target.value }))}
              required
            />
            <HoraAmPm
              label="Hora"
              value={edit.hora_inicio}
              onChange={(v) => setEdit((f) => ({ ...f, hora_inicio: v }))}
              required
            />
            <Select
              label="Servicio"
              value={edit.servicio}
              onChange={(e) =>
                setEdit((f) => ({ ...f, servicio: e.target.value }))
              }
            >
              <option value="">— Sin servicio —</option>
              {tratamientos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Card>
      )}

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

      {cita.venta && esAdministrativo(user) && (
        <Card title="Orden de venta" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              <p>
                Se generó automáticamente una orden de venta para esta cita.
              </p>
              <p className="mt-1 text-slate-500">
                Servicio:{" "}
                <span className="font-medium text-slate-700">
                  {servicios.find((s) => s.id === cita.servicio)?.nombre ??
                    "—"}
                </span>{" "}
                · Paciente:{" "}
                <span className="font-medium text-slate-700">
                  {paciente
                    ? `${paciente.nombres} ${paciente.apellido_paterno}`
                    : "—"}
                </span>
              </p>
            </div>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={() => router.push(`/ventas/${cita.venta}`)}
            >
              Editar orden de venta
            </Button>
          </div>
        </Card>
      )}

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
