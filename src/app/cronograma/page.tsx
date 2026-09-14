"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { PacientePicker } from "@/components/ui/PacientePicker";
import { listAllVentas } from "@/services/ventas";
import { listAllPacientes } from "@/services/pacientes";
import type { Cuota, Paciente, Venta } from "@/types";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface CuotaCal {
  cuota: Cuota;
  venta: Venta;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Color de la cuota según su estado y vencimiento. */
function colorCuota(cuota: Cuota, hoy: string): string {
  if (cuota.estado === "PAGADO") return "#10b981";
  if (cuota.fecha_limite && cuota.fecha_limite < hoy) return "#f43f5e";
  return "#f59e0b";
}

export default function CronogramaPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listAllVentas(), listAllPacientes()])
      .then(([v, p]) => {
        if (!active) return;
        setVentas(v);
        setPacientes(p);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hoy = ymd(new Date());

  // Todas las cuotas (filtradas por paciente) con su venta.
  const cuotas = useMemo<CuotaCal[]>(() => {
    const out: CuotaCal[] = [];
    for (const venta of ventas) {
      if (pacienteId && venta.paciente !== pacienteId) continue;
      if (venta.estado === "ANULADO") continue;
      for (const cuota of venta.cuotas) {
        if (cuota.fecha_limite) out.push({ cuota, venta });
      }
    }
    return out;
  }, [ventas, pacienteId]);

  const pendiente = cuotas
    .filter((c) => c.cuota.estado === "PENDIENTE")
    .reduce((a, c) => a + Number(c.cuota.saldo), 0);

  // Grilla del mes (6 semanas).
  const dias = useMemo(() => {
    const first = cursor;
    const startOffset = (first.getDay() + 6) % 7; // lunes = 0
    const start = new Date(
      first.getFullYear(),
      first.getMonth(),
      1 - startOffset,
    );
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const cuotasEn = (d: Date) =>
    cuotas.filter((c) => c.cuota.fecha_limite === ymd(d));

  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const mesLabel = cursor.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Cronograma de pagos
          </h1>
          <p className="text-sm text-slate-500">
            Vencimientos de cuotas por paciente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => shiftMonth(-1)}>
            ←
          </Button>
          <span className="min-w-[9rem] text-center text-sm font-medium text-slate-700 capitalize">
            {mesLabel}
          </span>
          <Button variant="secondary" onClick={() => shiftMonth(1)}>
            →
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <PacientePicker
            pacientes={pacientes}
            value={pacienteId}
            onChange={setPacienteId}
          />
        </div>
        <div className="flex items-end">
          <div className="w-full rounded-2xl border border-slate-200/70 bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-slate-400">Por cobrar (filtro)</p>
            <p className="text-lg font-semibold text-amber-600">
              S/ {pendiente.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="grid min-w-[720px] grid-cols-7 border-b border-slate-200/70 bg-slate-50 text-center text-xs font-medium text-slate-400">
            {DIAS.map((d) => (
              <div key={d} className="px-2 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid min-w-[720px] grid-cols-7">
            {dias.map((d, i) => {
              const items = cuotasEn(d);
              const esMes = d.getMonth() === cursor.getMonth();
              const esHoy = ymd(d) === hoy;
              return (
                <div
                  key={i}
                  className={`min-h-[92px] border-b border-l border-slate-100 p-1 ${
                    esMes ? "" : "bg-slate-50/60"
                  }`}
                >
                  <div
                    className={`mb-1 text-right text-xs ${
                      esHoy
                        ? "font-bold text-teal-600"
                        : esMes
                          ? "text-slate-500"
                          : "text-slate-300"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                  <div className="space-y-1">
                    {items.map(({ cuota, venta }) => (
                      <Link
                        key={cuota.id}
                        href={`/ventas/${venta.id}`}
                        className="block rounded-md px-1.5 py-1 text-[11px] leading-tight text-white"
                        style={{ backgroundColor: colorCuota(cuota, hoy) }}
                        title={`${venta.numero} · cuota ${cuota.numero}`}
                      >
                        S/ {cuota.monto}
                        <span className="block opacity-90">
                          {pacientes.find((p) => p.id === venta.paciente)
                            ?.apellido_paterno ?? ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <Leyenda color="#f59e0b" label="Pendiente" />
        <Leyenda color="#f43f5e" label="Vencida" />
        <Leyenda color="#10b981" label="Pagada" />
      </div>
    </AppShell>
  );
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
