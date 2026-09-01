"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Fragment, useState } from "react";
import { TIPO_PAGO } from "@/lib/estados";
import type { ServicioDental, Venta } from "@/types";

type Fila = {
  key: string;
  venta: Venta;
  cuotaNumero: number;
  cuotaFechaLimite: string | null;
  fecha: string | null;
  monto: string;
  metodo: string;
  referencia: string;
  comprobante: string | null;
  validado: boolean;
  fechaValidacion: string | null;
};

/** Aplana todos los pagos de las ventas del paciente en filas ordenables. */
function filasDePagos(ventas: Venta[]): Fila[] {
  const filas: Fila[] = [];
  for (const v of ventas) {
    for (const c of v.cuotas) {
      for (const p of c.pagos) {
        filas.push({
          key: p.id,
          venta: v,
          cuotaNumero: c.numero,
          cuotaFechaLimite: c.fecha_limite,
          fecha: p.fecha_pago,
          monto: p.monto,
          metodo: p.metodo,
          referencia: p.referencia,
          comprobante: p.comprobante,
          validado: p.validado,
          fechaValidacion: p.fecha_validacion,
        });
      }
    }
  }
  return filas.sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
}

export function HistorialPagos({
  ventas,
  servicios,
}: {
  ventas: Venta[];
  servicios: ServicioDental[];
}) {
  const filas = filasDePagos(ventas);
  const totalPagado = filas.reduce((s, f) => s + Number(f.monto || 0), 0);
  const saldo = ventas.reduce((s, v) => s + Number(v.saldo || 0), 0);
  const [abierto, setAbierto] = useState<string | null>(null);

  const servicioName = (id: string) =>
    servicios.find((s) => s.id === id)?.nombre ?? "Servicio";

  if (filas.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Este paciente todavía no registra pagos.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Total pagado</p>
          <p className="text-lg font-semibold text-emerald-600">
            S/ {totalPagado.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Saldo por cobrar</p>
          <p className="text-lg font-semibold text-amber-600">
            S/ {saldo.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2"></th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Concepto</th>
              <th className="px-3 py-2">Método</th>
              <th className="px-3 py-2 text-right">Monto</th>
              <th className="px-3 py-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const open = abierto === f.key;
              const conceptos = f.venta.servicios
                .map((vs) => servicioName(vs.servicio))
                .join(", ");
              return (
                <Fragment key={f.key}>
                  <tr
                    onClick={() => setAbierto(open ? null : f.key)}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 text-slate-400">
                      {open ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {f.fecha ?? "—"}
                    </td>
                    <td className="max-w-[16rem] truncate px-3 py-2 text-slate-700">
                      {conceptos || f.venta.numero}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{f.metodo}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-800">
                      S/ {f.monto}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {f.validado ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <Clock className="h-3.5 w-3.5" />
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-t border-slate-100 bg-slate-50/60">
                      <td></td>
                      <td colSpan={5} className="px-3 py-3">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* A qué se debe el pago */}
                          <div>
                            <p className="mb-1 text-xs font-semibold text-slate-500">
                              A qué corresponde
                            </p>
                            <ul className="space-y-1 text-sm text-slate-700">
                              {f.venta.servicios.length === 0 ? (
                                <li className="text-slate-400">
                                  Sin servicios detallados.
                                </li>
                              ) : (
                                f.venta.servicios.map((vs) => (
                                  <li
                                    key={vs.id}
                                    className="flex justify-between gap-3"
                                  >
                                    <span>
                                      {servicioName(vs.servicio)}
                                      {vs.cantidad > 1 && ` ×${vs.cantidad}`}
                                    </span>
                                    <span className="text-slate-500">
                                      S/ {vs.subtotal}
                                    </span>
                                  </li>
                                ))
                              )}
                            </ul>
                            <p className="mt-2 text-xs text-slate-500">
                              Venta{" "}
                              <Link
                                href={`/ventas/${f.venta.id}`}
                                className="font-medium text-teal-600 hover:underline"
                              >
                                {f.venta.numero}
                              </Link>{" "}
                              · {TIPO_PAGO[f.venta.tipo_pago]} · total S/{" "}
                              {f.venta.total}
                            </p>
                          </div>

                          {/* Detalle del pago */}
                          <div>
                            <p className="mb-1 text-xs font-semibold text-slate-500">
                              Detalle del pago
                            </p>
                            <dl className="space-y-1 text-sm">
                              <Detalle
                                k="Cuota"
                                v={`N.º ${f.cuotaNumero}${
                                  f.cuotaFechaLimite
                                    ? ` · vence ${f.cuotaFechaLimite}`
                                    : ""
                                }`}
                              />
                              <Detalle k="Método" v={f.metodo} />
                              {f.referencia && (
                                <Detalle k="Referencia" v={f.referencia} />
                              )}
                              <Detalle
                                k="Validación"
                                v={
                                  f.validado
                                    ? `Validado${
                                        f.fechaValidacion
                                          ? ` el ${f.fechaValidacion.slice(0, 10)}`
                                          : ""
                                      }`
                                    : "Pendiente de validar"
                                }
                              />
                              {f.comprobante && (
                                <div className="flex gap-2 pt-1">
                                  <a
                                    href={f.comprobante}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Ver comprobante
                                  </a>
                                </div>
                              )}
                            </dl>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detalle({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400">{k}</dt>
      <dd className="text-right text-slate-700">{v}</dd>
    </div>
  );
}
