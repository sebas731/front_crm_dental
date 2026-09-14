"use client";

import { Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BarChart, DonutChart } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { LogoMark } from "@/components/ui/Logo";
import { cobrosPorProcedencia, pagosPorMetodo } from "@/lib/analytics";
import { rangoDePeriodo } from "@/lib/filtros";
import { listAllPacientes } from "@/services/pacientes";
import { listAllVentas } from "@/services/ventas";
import type { Paciente, Venta } from "@/types";

const money = (v: number) => `S/ ${v.toFixed(2)}`;

export default function ReportesPage() {
  const rango = rangoDePeriodo("mes");
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [desde, setDesde] = useState(rango.desde);
  const [hasta, setHasta] = useState(rango.hasta);
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

  const metodos = useMemo(
    () => pagosPorMetodo(ventas, desde, hasta),
    [ventas, desde, hasta],
  );
  const procedencia = useMemo(
    () => cobrosPorProcedencia(ventas, pacientes, desde, hasta),
    [ventas, pacientes, desde, hasta],
  );
  const totalCobrado = metodos.reduce((a, m) => a + m.monto, 0);
  const cantPagos = metodos.reduce((a, m) => a + m.cantidad, 0);

  const generado = new Date().toLocaleString("es", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const fmt = (d: string) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("es") : "—";
  const pct = (m: number) => (totalCobrado ? (m / totalCobrado) * 100 : 0);

  return (
    <AppShell>
      {/* Controles (no salen en el PDF) */}
      <div className="no-print mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Reporte de pagos
          </h1>
          <p className="text-sm text-slate-500">
            Cobros por método y procedencia, por rango de fechas
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            label="Desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
          <Button onClick={() => window.print()} disabled={loading}>
            <Printer className="h-4 w-4" /> Descargar PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="print-area rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          {/* Cabecera con la marca */}
          <div
            className="-mx-6 -mt-6 mb-6 flex items-center justify-between rounded-t-2xl px-6 py-4 text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-dark, #0f766e))",
            }}
          >
            <div className="flex items-center gap-2">
              <LogoMark size={34} tone="white" />
              <div>
                <p className="text-sm font-semibold tracking-wide">
                  DENTAL STUDIO
                </p>
                <p className="text-xs text-white/80">Reporte de pagos</p>
              </div>
            </div>
            <div className="text-right text-xs text-white/90">
              <p className="font-medium">
                {fmt(desde)} — {fmt(hasta)}
              </p>
              <p className="text-white/70">Generado: {generado}</p>
            </div>
          </div>

          {/* Resumen */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { l: "Total cobrado", v: money(totalCobrado), c: "text-emerald-600" },
              { l: "Pagos", v: String(cantPagos), c: "text-slate-800" },
              {
                l: "Fuentes activas",
                v: String(procedencia.length),
                c: "text-teal-700",
              },
            ].map((x) => (
              <div
                key={x.l}
                className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-center"
              >
                <p className="text-xs text-slate-400">{x.l}</p>
                <p className={`text-lg font-bold ${x.c}`}>{x.v}</p>
              </div>
            ))}
          </div>

          {/* Pagos por método */}
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Pagos por método
          </h2>
          <div className="mb-4">
            <DonutChart
              data={metodos.map((m) => ({ label: m.metodo, value: m.monto }))}
              format={money}
              centro={money(totalCobrado)}
            />
          </div>
          <table className="mb-6 w-full text-left text-sm">
            <thead>
              <tr className="bg-teal-50 text-xs text-teal-700">
                <th className="rounded-l-lg px-3 py-2 font-semibold">Método</th>
                <th className="px-3 py-2 text-right font-semibold">Pagos</th>
                <th className="px-3 py-2 text-right font-semibold">Monto</th>
                <th className="rounded-r-lg px-3 py-2 text-right font-semibold">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {metodos.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={4}>
                    Sin pagos en el rango.
                  </td>
                </tr>
              ) : (
                metodos.map((m) => (
                  <tr key={m.metodo} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{m.metodo}</td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {m.cantidad}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">
                      {money(m.monto)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {pct(m.monto).toFixed(0)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Procedencia de pacientes */}
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            ¿De dónde vienen los pacientes?
          </h2>
          <div className="mb-4">
            <BarChart
              data={procedencia.map((p) => ({
                label: `${p.procedencia} (${p.pacientes})`,
                value: p.monto,
              }))}
              format={money}
            />
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-teal-50 text-xs text-teal-700">
                <th className="rounded-l-lg px-3 py-2 font-semibold">
                  Procedencia
                </th>
                <th className="px-3 py-2 text-right font-semibold">Pacientes</th>
                <th className="rounded-r-lg px-3 py-2 text-right font-semibold">
                  Cobrado
                </th>
              </tr>
            </thead>
            <tbody>
              {procedencia.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={3}>
                    Sin datos en el rango.
                  </td>
                </tr>
              ) : (
                procedencia.map((p) => (
                  <tr key={p.procedencia} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-700">
                      {p.procedencia}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {p.pacientes}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">
                      {money(p.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            DENTAL STUDIO · Reporte generado desde el sistema
          </p>
        </div>
      )}
    </AppShell>
  );
}
