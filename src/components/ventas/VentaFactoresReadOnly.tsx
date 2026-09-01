"use client";

import { Card } from "@/components/ui/Card";
import type { Venta } from "@/types";

/** Vista solo-lectura de los factores de una venta congelada. */
export function VentaFactoresReadOnly({
  venta,
  servicioName,
}: {
  venta: Venta;
  servicioName: (id: string) => string;
}) {
  return (
    <>
      <Card title="Servicios ofrecidos">
        {venta.servicios.length === 0 ? (
          <p className="text-sm text-slate-400">Sin servicios.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {venta.servicios.map((s) => (
              <li key={s.id} className="flex justify-between gap-3 py-2">
                <span className="text-slate-700">
                  {servicioName(s.servicio)}
                  {s.cantidad > 1 && ` ×${s.cantidad}`}
                </span>
                <span className="text-slate-500">S/ {s.subtotal}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Adicionales / materiales">
        {venta.adicionales.length === 0 ? (
          <p className="text-sm text-slate-400">Sin adicionales.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {venta.adicionales.map((a) => (
              <li key={a.id} className="flex justify-between gap-3 py-2">
                <span className="text-slate-700">
                  {a.nombre}
                  {a.tipo && (
                    <span className="text-slate-400"> · {a.tipo}</span>
                  )}
                  {a.cantidad > 1 && ` ×${a.cantidad}`}
                </span>
                <span className="text-slate-500">S/ {a.subtotal}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Descuentos / promociones">
        {venta.descuentos.length === 0 ? (
          <p className="text-sm text-slate-400">Sin descuentos.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {venta.descuentos.map((d) => (
              <li key={d.id} className="flex justify-between gap-3 py-2">
                <span className="text-slate-700">
                  {d.descripcion || "Descuento"}
                </span>
                <span className="text-slate-500">
                  {d.tipo === "PORCENTAJE" ? `${d.valor}%` : `S/ ${d.valor}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
