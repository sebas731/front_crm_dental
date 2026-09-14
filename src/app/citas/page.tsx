"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CitaCardList } from "@/components/citas/CitaCardList";
import { CitaForm } from "@/components/citas/CitaForm";
import { CitasFilterBar } from "@/components/citas/CitasFilterBar";
import { PeriodoTabs } from "@/components/citas/PeriodoTabs";
import { WhatsAppButton } from "@/components/citas/WhatsAppButton";
import { useAuth } from "@/context/AuthContext";
import { ESTADO_CITA } from "@/lib/estados";
import {
  FILTROS_VACIOS,
  filterCitas,
  periodoDeRango,
  rangoDePeriodo,
  type CitaFiltros,
  type PeriodoRango,
} from "@/lib/filtros";
import { esMedico, puedeCrearCitas } from "@/lib/roles";
import { listAllCitas, listAllMedicos, listAllServicios } from "@/services/citas";
import { listAllPacientes } from "@/services/pacientes";
import type { Cita, Medico, Paciente, ServicioDental } from "@/types";

export default function CitasPage() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // Por defecto abre en "Esta semana" para no acumular todas las citas.
  const [filtros, setFiltros] = useState<CitaFiltros>(() => ({
    ...FILTROS_VACIOS,
    ...rangoDePeriodo("semana"),
  }));
  const [vista, setVista] = useState<"tabla" | "tarjetas">("tabla");

  const periodoActivo = periodoDeRango(filtros);

  function seleccionarPeriodo(p: PeriodoRango) {
    setFiltros((f) => ({ ...f, ...rangoDePeriodo(p) }));
  }

  async function load() {
    const [c, p, m, s] = await Promise.all([
      listAllCitas(),
      listAllPacientes(),
      listAllMedicos(),
      listAllServicios(),
    ]);
    setCitas(c);
    setPacientes(p);
    setMedicos(m);
    setServicios(s);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listAllCitas(),
      listAllPacientes(),
      listAllMedicos(),
      listAllServicios(),
    ])
      .then(([c, p, m, s]) => {
        if (!active) return;
        setCitas(c);
        setPacientes(p);
        setMedicos(m);
        setServicios(s);
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
    return p ? `${p.nombres} ${p.apellido_paterno}` : id;
  };
  const medicoName = (id: string) => {
    const m = medicos.find((x) => x.id === id);
    return m ? `${m.nombres} ${m.apellidos}` : id;
  };
  const servicioName = (id: string | null) => {
    const s = servicios.find((x) => x.id === id);
    return s ? s.nombre : "—";
  };

  // El médico solo ve sus propias citas.
  const miMedicoId = esMedico(user)
    ? (medicos.find((m) => m.usuario === user?.id)?.id ?? "__ninguno__")
    : null;

  const filtradas = useMemo(() => {
    const base = miMedicoId
      ? citas.filter((c) => c.medico === miMedicoId)
      : citas;
    return filterCitas(base, filtros);
  }, [citas, filtros, miMedicoId]);

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Citas ({filtradas.length})
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setVista("tabla")}
              className={`rounded-lg p-1.5 ${vista === "tabla" ? "bg-teal-50 text-teal-600" : "text-slate-400"}`}
              aria-label="Vista tabla"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVista("tarjetas")}
              className={`rounded-lg p-1.5 ${vista === "tarjetas" ? "bg-teal-50 text-teal-600" : "text-slate-400"}`}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          {puedeCrearCitas(user) && (
            <Button
              onClick={() => setShowForm((v) => !v)}
              disabled={pacientes.length === 0 || medicos.length === 0}
            >
              {showForm ? "Cancelar" : "Nueva cita"}
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <CitaForm
            pacientes={pacientes}
            medicos={medicos}
            servicios={servicios}
            onCreated={async () => {
              setShowForm(false);
              await load();
            }}
          />
        </div>
      )}

      <div className="mb-4">
        <PeriodoTabs activo={periodoActivo} onSelect={seleccionarPeriodo} />
      </div>

      <CitasFilterBar
        filtros={filtros}
        onChange={setFiltros}
        pacientes={pacientes}
        servicios={servicios}
      />

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : vista === "tarjetas" ? (
        <CitaCardList
          citas={filtradas}
          pacientes={pacientes}
          medicoName={medicoName}
          servicioName={servicioName}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Hora</th>
                <th className="px-4 py-2 font-medium">Paciente</th>
                <th className="px-4 py-2 font-medium">Médico</th>
                <th className="px-4 py-2 font-medium">Servicio</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={7}>
                    Sin citas.
                  </td>
                </tr>
              ) : (
                filtradas.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{c.fecha}</td>
                    <td className="px-4 py-2">{c.hora_inicio.slice(0, 5)}</td>
                    <td className="px-4 py-2">{pacienteName(c.paciente)}</td>
                    <td className="px-4 py-2">{medicoName(c.medico)}</td>
                    <td className="px-4 py-2">{servicioName(c.servicio)}</td>
                    <td className="px-4 py-2">
                      <Badge
                        label={ESTADO_CITA[c.estado].label}
                        color={ESTADO_CITA[c.estado].color}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-3">
                        <WhatsAppButton
                          cita={c}
                          paciente={pacientes.find((p) => p.id === c.paciente)}
                        />
                        <Link
                          href={`/citas/${c.id}`}
                          className="text-sm font-medium text-teal-600 hover:underline"
                        >
                          Ver / Atender
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
