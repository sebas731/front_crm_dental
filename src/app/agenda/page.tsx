"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ESTADO_CITA } from "@/lib/estados";
import { listCitas, listMedicos } from "@/services/citas";
import { listPacientes } from "@/services/pacientes";
import type { Cita, Medico, Paciente } from "@/types";

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
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()));
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agenda</h1>
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
        <p className="text-muted">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="border-border text-muted w-16 border-b px-2 py-2 text-xs">
                  Hora
                </th>
                {dias.map((d, i) => (
                  <th
                    key={i}
                    className="border-border border-b border-l px-2 py-2 text-center font-medium"
                  >
                    {DIAS[i]} <span className="text-muted">{d.getDate()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((h) => (
                <tr key={h}>
                  <td className="border-border text-muted border-b px-2 py-2 text-right align-top text-xs">
                    {String(h).padStart(2, "0")}:00
                  </td>
                  {dias.map((d, i) => {
                    const items = citasEn(d, h);
                    return (
                      <td
                        key={i}
                        className="border-border border-b border-l p-1 align-top"
                      >
                        <div className="space-y-1">
                          {items.map((c) => {
                            const est = ESTADO_CITA[c.estado];
                            return (
                              <Link
                                key={c.id}
                                href={`/citas/${c.id}`}
                                className="block rounded-md px-2 py-1 text-xs text-white"
                                style={{ backgroundColor: est.color }}
                                title={`${est.label} · ${medicoName(c.medico)}`}
                              >
                                <div className="font-medium">
                                  {c.hora_inicio.slice(0, 5)}{" "}
                                  {pacienteName(c.paciente)}
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
    </AppShell>
  );
}
