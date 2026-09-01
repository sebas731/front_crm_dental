"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { generarCuotas, type Frecuencia } from "@/lib/cuotas";
import { createCuota } from "@/services/ventas";
import type { TipoPago, Venta } from "@/types";

const hoy = new Date().toISOString().slice(0, 10);

export function GenerarCuotas({
  venta,
  onChanged,
}: {
  venta: Venta;
  onChanged: () => void | Promise<void>;
}) {
  const [tipoPago, setTipoPago] = useState<TipoPago>(venta.tipo_pago);
  const [n, setN] = useState(2);
  const [primeraFecha, setPrimeraFecha] = useState(hoy);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("MENSUAL");
  const [busy, setBusy] = useState(false);

  const total = Number(venta.total) || 0;
  const preview = useMemo(
    () =>
      generarCuotas(total, {
        n: tipoPago === "CONTADO" ? 1 : n,
        primeraFecha,
        frecuencia,
      }),
    [total, tipoPago, n, primeraFecha, frecuencia],
  );

  async function generar() {
    setBusy(true);
    try {
      for (const c of preview) {
        await createCuota({
          venta: venta.id,
          numero: c.numero,
          monto: c.monto,
          fecha_limite: c.fecha_limite,
        });
      }
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {total <= 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Registrá primero el precio del servicio para generar las cuotas.
        </p>
      )}
      <Select
        label="Tipo de pago"
        value={tipoPago}
        onChange={(e) => setTipoPago(e.target.value as TipoPago)}
      >
        <option value="CONTADO">Contado</option>
        <option value="CUOTAS">Cuotas</option>
      </Select>
      {tipoPago === "CUOTAS" && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="N.º cuotas"
            type="number"
            min="1"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
          <Select
            label="Frecuencia"
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value as Frecuencia)}
          >
            <option value="SEMANAL">Semanal</option>
            <option value="QUINCENAL">Quincenal</option>
            <option value="MENSUAL">Mensual</option>
          </Select>
        </div>
      )}
      <Input
        label={tipoPago === "CONTADO" ? "Fecha" : "Primera cuota"}
        type="date"
        value={primeraFecha}
        onChange={(e) => setPrimeraFecha(e.target.value)}
      />
      <ul className="space-y-1 rounded-xl border border-slate-200/70 p-2 text-xs text-slate-600">
        {preview.map((c) => (
          <li key={c.numero} className="flex justify-between">
            <span>
              Cuota {c.numero} · {c.fecha_limite}
            </span>
            <span className="font-medium">S/ {c.monto}</span>
          </li>
        ))}
      </ul>
      <Button onClick={generar} disabled={busy || total <= 0}>
        {busy ? "Generando…" : "Generar cuotas"}
      </Button>
    </div>
  );
}
