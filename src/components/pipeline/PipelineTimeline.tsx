import { CreditCard, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_CUOTA, ESTADO_VENTA, TIPO_PAGO } from "@/lib/estados";
import type { Venta } from "@/types";

function CuotaCard({ cuota }: { cuota: Venta["cuotas"][number] }) {
  const est = ESTADO_CUOTA[cuota.estado];
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-700">
          Cuota {cuota.numero} · S/ {cuota.monto}
        </span>
        <Badge label={est.label} color={est.color} />
      </div>
      <p className="text-xs text-slate-400">
        Vence: {cuota.fecha_limite ?? "—"} · Pagado: S/ {cuota.total_pagado}
      </p>
      {cuota.pagos.map((p) => (
        <p
          key={p.id}
          className="mt-1 flex items-center gap-1 text-xs text-slate-500"
        >
          <CreditCard className="h-3.5 w-3.5 text-teal-600" />
          S/ {p.monto} · {p.metodo}
          {p.validado ? (
            <span className="text-emerald-600">· validado ✓</span>
          ) : (
            <span className="text-amber-600">· sin validar</span>
          )}
        </p>
      ))}
    </div>
  );
}

export function PipelineTimeline({
  ventas,
  pacienteName,
}: {
  ventas: Venta[];
  pacienteName: (id: string) => string;
}) {
  const ordenadas = [...ventas].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

  if (ordenadas.length === 0) {
    return <p className="text-sm text-slate-500">Sin ventas para mostrar.</p>;
  }

  return (
    <ol className="relative">
      {ordenadas.map((venta, i) => {
        const est = ESTADO_VENTA[venta.estado];
        const last = i === ordenadas.length - 1;
        return (
          <li key={venta.id} className="flex gap-4 pb-6">
            <div className="flex flex-col items-center pt-4">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white"
                style={{ backgroundColor: est.color }}
              />
              {!last && <span className="w-px flex-1 bg-slate-200" />}
            </div>

            <div className="flex flex-1 flex-col items-stretch gap-2 md:flex-row md:items-start">
              {/* Venta */}
              <div className="flex-1 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <ReceiptText className="h-4 w-4 text-teal-600" />
                    {venta.numero || "Venta"}
                  </span>
                  <Badge label={est.label} color={est.color} />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {pacienteName(venta.paciente)}
                </p>
                <p className="text-xs text-slate-400">
                  {TIPO_PAGO[venta.tipo_pago]} · Total S/ {venta.total} · Saldo
                  S/ {venta.saldo}
                </p>
              </div>

              <span className="mx-auto h-6 w-px shrink-0 bg-slate-300 md:mt-6 md:h-px md:w-10" />

              {/* Cuotas */}
              <div className="flex-1 space-y-2">
                {venta.cuotas.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">
                    Sin cuotas generadas
                  </div>
                ) : (
                  venta.cuotas.map((c) => <CuotaCard key={c.id} cuota={c} />)
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
