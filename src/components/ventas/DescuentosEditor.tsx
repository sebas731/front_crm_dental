"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { addDescuento, deleteDescuento } from "@/services/ventas";
import type { Descuento, Venta } from "@/types";

export function DescuentosEditor({
  venta,
  onChanged,
}: {
  venta: Venta;
  onChanged: () => void | Promise<void>;
}) {
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<Descuento["tipo"]>("MONTO");
  const [valor, setValor] = useState("");
  const [busy, setBusy] = useState(false);

  async function agregar() {
    if (!valor) return;
    setBusy(true);
    try {
      await addDescuento({
        venta: venta.id,
        descripcion: descripcion.trim(),
        tipo,
        valor: Number(valor).toFixed(2),
      });
      setDescripcion("");
      setValor("");
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {venta.descuentos.map((d) => (
        <div
          key={d.id}
          className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm"
        >
          <span>{d.descripcion || "Descuento"}</span>
          <span className="flex items-center gap-2">
            <span className="font-medium text-rose-500">
              {d.tipo === "PORCENTAJE" ? `${d.valor}%` : `S/ ${d.valor}`}
            </span>
            <button
              onClick={async () => {
                await deleteDescuento(d.id);
                await onChanged();
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </span>
        </div>
      ))}
      {venta.descuentos.length === 0 && (
        <p className="text-sm text-slate-400">Sin descuentos.</p>
      )}

      <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
        <Input
          label="Descripción / promoción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Promo verano"
        />
        <div className="flex items-end gap-2">
          <Select
            label="Tipo"
            className="w-28"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Descuento["tipo"])}
          >
            <option value="MONTO">Monto</option>
            <option value="PORCENTAJE">%</option>
          </Select>
          <Input
            label={tipo === "PORCENTAJE" ? "Porcentaje" : "Monto (S/)"}
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className="w-32"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <Button
            variant="secondary"
            className="ml-auto px-3 py-2 text-xs"
            disabled={!valor || busy}
            onClick={agregar}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
