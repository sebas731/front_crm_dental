"use client";

import { CheckCircle2, Receipt } from "lucide-react";
import { useState } from "react";
import { ReciboPago } from "@/components/historia/ReciboPago";
import type { Pago, ServicioDental, Venta } from "@/types";

type Fila = {
  key: string;
  pago: Pago;
  venta: Venta;
  cuotaNumero: number;
};

/** Aplana todos los pagos de las ventas del paciente en filas ordenables. */
function filasDePagos(ventas: Venta[]): Fila[] {
  const filas: Fila[] = [];
  for (const v of ventas) {
    for (const c of v.cuotas) {
      for (const p of c.pagos) {
        filas.push({ key: p.id, pago: p, venta: v, cuotaNumero: c.numero });
      }
    }
  }
  return filas.sort((a, b) =>
    (b.pago.fecha_pago ?? "").localeCompare(a.pago.fecha_pago ?? ""),
  );
}

export function HistorialPagos({
  ventas,
  servicios,
  pacienteNombre,
}: {
  ventas: Venta[];
  servicios: ServicioDental[];
  pacienteNombre: string;
}) {
  const filas = filasDePagos(ventas);
  const totalPagado = filas.reduce((s, f) => s + Number(f.pago.monto || 0), 0);
  const [recibo, setRecibo] = useState<Fila | null>(null);

  const servicioName = (id: string) =>
    servicios.find((s) => s.id === id)?.nombre ?? "Servicio";
  const conceptoDe = (v: Venta) =>
    v.servicios.map((vs) => servicioName(vs.servicio)).join(", ");

  if (filas.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Este paciente todavía no registra pagos.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
        <p className="text-xs text-slate-400">Total pagado</p>
        <p className="text-lg font-semibold text-emerald-600">
          S/ {totalPagado.toFixed(2)}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Concepto</th>
              <th className="px-3 py-2">Método</th>
              <th className="px-3 py-2 text-right">Monto</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr
                key={f.key}
                onClick={() => setRecibo(f)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-3 py-2 text-slate-600">
                  {f.pago.fecha_pago
                    ? f.pago.fecha_pago.slice(0, 10)
                    : "—"}
                </td>
                <td className="max-w-[14rem] truncate px-3 py-2 text-slate-700">
                  {conceptoDe(f.venta) || f.venta.numero}
                </td>
                <td className="px-3 py-2 text-slate-600">{f.pago.metodo}</td>
                <td className="px-3 py-2 text-right font-medium text-slate-800">
                  S/ {f.pago.monto}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Pagado
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600">
                    <Receipt className="h-3.5 w-3.5" />
                    Recibo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recibo && (
        <ReciboPago
          pago={recibo.pago}
          paciente={pacienteNombre}
          concepto={conceptoDe(recibo.venta)}
          ventaNumero={recibo.venta.numero}
          cuotaNumero={recibo.cuotaNumero}
          onClose={() => setRecibo(null)}
        />
      )}
    </div>
  );
}
