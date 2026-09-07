"use client";

import { Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { LogoMark } from "@/components/ui/Logo";
import { ventasPorServicio } from "@/lib/analytics";
import { ESTADO_VENTA } from "@/lib/estados";
import { rangoDePeriodo } from "@/lib/filtros";
import { listServicios } from "@/services/citas";
import { listPacientes } from "@/services/pacientes";
import { listVentas } from "@/services/ventas";
import type { Paciente, ServicioDental, Venta } from "@/types";

const money = (v: number) => `S/ ${v.toFixed(2)}`;

export default function ReportesPage() {
  const rango = rangoDePeriodo("mes");
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [desde, setDesde] = useState(rango.desde);
  const [hasta, setHasta] = useState(rango.hasta);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listVentas(), listPacientes(), listServicios()])
      .then(([v, p, s]) => {
        if (!active) return;
        setVentas(v.results);
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
  }, []);

  const pacienteName = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : "—";
  };
  const servicioName = (id: string) =>
    servicios.find((x) => x.id === id)?.nombre ?? "Servicio";

  // Ventas del rango (por fecha de registro), sin anuladas.
  const filtradas = useMemo(
    () =>
      ventas.filter((v) => {
        if (v.estado === "ANULADO") return false;
        const f = v.created_at.slice(0, 10);
        return (!desde || f >= desde) && (!hasta || f <= hasta);
      }),
    [ventas, desde, hasta],
  );

  const totalVendido = filtradas.reduce((a, v) => a + Number(v.total), 0);
  const totalPagado = filtradas.reduce(
    (a, v) => a + Number(v.total_pagado),
    0,
  );
  const porServicio = useMemo(
    () => ventasPorServicio(filtradas),
    [filtradas],
  );

  const generado = new Date().toLocaleString("es", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const fmt = (d: string) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("es") : "—";

  return (
    <AppShell>
      {/* Controles (no salen en el PDF) */}
      <div className="no-print mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Reporte de ventas
          </h1>
          <p className="text-sm text-slate-500">
            Ventas y servicios por rango de fechas
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
        /* Área imprimible */
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
                <p className="text-xs text-white/80">Reporte de ventas</p>
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
              { l: "Ventas", v: String(filtradas.length), c: "text-slate-800" },
              { l: "Total vendido", v: money(totalVendido), c: "text-teal-700" },
              {
                l: "Total cobrado",
                v: money(totalPagado),
                c: "text-emerald-600",
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

          {/* Desglose por servicio */}
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Servicios vendidos
          </h2>
          <table className="mb-6 w-full text-left text-sm">
            <thead>
              <tr className="bg-teal-50 text-xs text-teal-700">
                <th className="rounded-l-lg px-3 py-2 font-semibold">
                  Servicio
                </th>
                <th className="px-3 py-2 text-right font-semibold">Cant.</th>
                <th className="px-3 py-2 text-right font-semibold">Vendido</th>
                <th className="rounded-r-lg px-3 py-2 text-right font-semibold">
                  Cobrado
                </th>
              </tr>
            </thead>
            <tbody>
              {porServicio.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={4}>
                    Sin servicios en el rango.
                  </td>
                </tr>
              ) : (
                porServicio.map((s) => (
                  <tr key={s.servicio} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-700">
                      {servicioName(s.servicio)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {s.cantidad}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">
                      {money(s.vendido)}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-600">
                      {money(s.pagado)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Detalle de ventas */}
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Ventas del período
          </h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-teal-50 text-xs text-teal-700">
                <th className="rounded-l-lg px-3 py-2 font-semibold">Fecha</th>
                <th className="px-3 py-2 font-semibold">N.º</th>
                <th className="px-3 py-2 font-semibold">Paciente</th>
                <th className="px-3 py-2 font-semibold">Estado</th>
                <th className="rounded-r-lg px-3 py-2 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={5}>
                    No hay ventas en el rango seleccionado.
                  </td>
                </tr>
              ) : (
                filtradas
                  .slice()
                  .sort((a, b) => b.created_at.localeCompare(a.created_at))
                  .map((v) => (
                    <tr key={v.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-600">
                        {v.created_at.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{v.numero}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {pacienteName(v.paciente)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {ESTADO_VENTA[v.estado].label}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-slate-800">
                        {money(Number(v.total))}
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
