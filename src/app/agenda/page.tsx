"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NotasPanel } from "@/components/agenda/NotasPanel";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { ESTADO_CITA } from "@/lib/estados";
import { esMedico } from "@/lib/roles";
import { listCitas, listMedicos } from "@/services/citas";
import { createNota, deleteNota, listNotas } from "@/services/notas";
import { listPacientes } from "@/services/pacientes";
import type { Cita, Medico, NotaAgenda, Paciente } from "@/types";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORA_INICIO = 8;
const HORA_FIN = 20;

/** Lunes de la semana que contiene `d`. */
function mondayOf(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // 0 = lunes
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function ymd(d: Date): string {
  // Formato local (evita el desfase de día de toISOString en UTC).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AgendaPage() {
  const { user } = useAuth();
  const puedeNotas = !esMedico(user); // el médico no ve/gestiona anotaciones
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()));
  const [notas, setNotas] = useState<NotaAgenda[]>([]);
  const [notaSlot, setNotaSlot] = useState<{
    fecha: string;
    hora: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listCitas(), listPacientes(), listMedicos()])
      .then(([c, p, m]) => {
        if (!active) return;
        setCitas(c.results);
        setPacientes(p.results);
        setMedicos(m.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dias = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const horas = useMemo(
    () =>
      Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i),
    [],
  );

  // Mes(es) que abarca la semana visible (para señalar el mes en el calendario).
  const mesLabel = useMemo(() => {
    const ini = dias[0];
    const fin = dias[5];
    if (ini.getMonth() === fin.getMonth()) {
      return ini.toLocaleDateString("es", { month: "long", year: "numeric" });
    }
    const iniStr = ini.toLocaleDateString("es", {
      month: "short",
      ...(ini.getFullYear() !== fin.getFullYear() && { year: "numeric" }),
    });
    const finStr = fin.toLocaleDateString("es", {
      month: "short",
      year: "numeric",
    });
    return `${iniStr} – ${finStr}`;
  }, [dias]);

  // Notas de la semana visible.
  const reloadNotas = useCallback(async () => {
    const fin = new Date(weekStart);
    fin.setDate(fin.getDate() + 5);
    const r = await listNotas({ desde: ymd(weekStart), hasta: ymd(fin) });
    setNotas(r.results);
  }, [weekStart]);

  useEffect(() => {
    if (!puedeNotas) return;
    let active = true;
    const fin = new Date(weekStart);
    fin.setDate(fin.getDate() + 5);
    listNotas({ desde: ymd(weekStart), hasta: ymd(fin) })
      .then((r) => {
        if (active) setNotas(r.results);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [weekStart, puedeNotas]);

  function notasEn(fecha: string, hora: number): NotaAgenda[] {
    return notas.filter(
      (n) => n.fecha === fecha && parseInt(n.hora.slice(0, 2), 10) === hora,
    );
  }

  const slotNotas = notaSlot ? notasEn(notaSlot.fecha, notaSlot.hora) : [];

  const pacienteName = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : "Paciente";
  };
  const medicoName = (id: string) => {
    const m = medicos.find((x) => x.id === id);
    return m ? `${m.nombres} ${m.apellidos}` : "";
  };

  function citasEn(dia: Date, hora: number): Cita[] {
    const key = ymd(dia);
    return citas.filter((c) => {
      if (c.fecha !== key) return false;
      const h = parseInt(c.hora_inicio.slice(0, 2), 10);
      return h === hora;
    });
  }

  function shiftWeek(delta: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  const rangeLabel = `${dias[0].toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
  })} – ${dias[5].toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            Agenda
          </p>
          <h1 className="text-2xl font-semibold text-slate-800 capitalize">
            {mesLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => shiftWeek(-1)}>
            ←
          </Button>
          <span className="text-muted min-w-[11rem] text-center text-sm">
            {rangeLabel}
          </span>
          <Button variant="secondary" onClick={() => shiftWeek(1)}>
            →
          </Button>
          <Button
            variant="secondary"
            onClick={() => setWeekStart(mondayOf(new Date()))}
          >
            Hoy
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-20 border-b border-slate-200/70 bg-slate-50 px-2 py-3 text-xs font-medium text-slate-400">
                  Hora
                </th>
                {dias.map((d, i) => {
                  const esHoy = ymd(d) === ymd(new Date());
                  return (
                    <th
                      key={i}
                      className={`border-b border-l border-slate-200/70 px-2 py-3 text-center ${
                        esHoy ? "bg-teal-50" : "bg-slate-50"
                      }`}
                    >
                      <div
                        className={`text-xs font-semibold ${esHoy ? "text-teal-700" : "text-slate-600"}`}
                      >
                        {DIAS[i]}
                      </div>
                      <div
                        className={`text-lg font-semibold ${esHoy ? "text-teal-600" : "text-slate-800"}`}
                      >
                        {d.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {horas.map((h) => (
                <tr key={h} className="h-20">
                  <td className="border-b border-slate-100 px-2 py-2 text-right align-top text-xs font-medium text-slate-400">
                    {String(h).padStart(2, "0")}:00
                  </td>
                  {dias.map((d, i) => {
                    const items = citasEn(d, h);
                    const esHoy = ymd(d) === ymd(new Date());
                    const fecha = ymd(d);
                    const tieneNotas = notasEn(fecha, h).length;
                    return (
                      <td
                        key={i}
                        onContextMenu={
                          puedeNotas
                            ? (e) => {
                                e.preventDefault();
                                setNotaSlot({ fecha, hora: h });
                              }
                            : undefined
                        }
                        className={`relative border-b border-l border-slate-100 p-1.5 align-top ${
                          esHoy ? "bg-teal-50/30" : ""
                        }`}
                        title={
                          puedeNotas ? "Clic derecho para anotar" : undefined
                        }
                      >
                        {puedeNotas && tieneNotas > 0 && (
                          <button
                            onClick={() => setNotaSlot({ fecha, hora: h })}
                            title={`${tieneNotas} nota(s)`}
                            className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <div className="space-y-1.5">
                          {items.map((c) => {
                            const est = ESTADO_CITA[c.estado];
                            return (
                              <Link
                                key={c.id}
                                href={`/citas/${c.id}`}
                                className="block rounded-lg px-2 py-1.5 text-xs text-white shadow-sm transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: est.color }}
                                title={`${est.label} · ${medicoName(c.medico)}`}
                              >
                                <div className="font-semibold">
                                  {c.hora_inicio.slice(0, 5)}
                                </div>
                                <div className="truncate">
                                  {pacienteName(c.paciente)}
                                </div>
                                <div className="truncate text-[10px] opacity-90">
                                  {medicoName(c.medico)}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {notaSlot && (
        <NotasPanel
          fecha={notaSlot.fecha}
          hora={`${String(notaSlot.hora).padStart(2, "0")}:00`}
          notas={slotNotas}
          onClose={() => setNotaSlot(null)}
          onCreate={async (texto) => {
            await createNota({
              fecha: notaSlot.fecha,
              hora: `${String(notaSlot.hora).padStart(2, "0")}:00:00`,
              texto,
            });
            await reloadNotas();
          }}
          onDelete={async (id) => {
            await deleteNota(id);
            await reloadNotas();
          }}
        />
      )}
    </AppShell>
  );
}
