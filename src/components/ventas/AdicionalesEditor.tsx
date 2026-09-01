"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { addAdicional, deleteAdicional } from "@/services/ventas";
import type { Venta } from "@/types";

export function AdicionalesEditor({
  venta,
  onChanged,
}: {
  venta: Venta;
  onChanged: () => void | Promise<void>;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Material");
  const [valor, setValor] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [busy, setBusy] = useState(false);

  async function agregar() {
    if (!nombre.trim()) return;
    setBusy(true);
    try {
      await addAdicional({
        venta: venta.id,
        nombre: nombre.trim(),
        tipo,
        valor: Number(valor || 0).toFixed(2),
        cantidad,
      });
      setNombre("");
      setValor("");
      setCantidad(1);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {venta.adicionales.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm"
        >
          <span>
            {a.nombre} <span className="text-slate-400">({a.tipo})</span> ×
            {a.cantidad}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-medium">S/ {a.subtotal}</span>
            <button
              onClick={async () => {
                await deleteAdicional(a.id);
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
      {venta.adicionales.length === 0 && (
        <p className="text-sm text-slate-400">Sin adicionales.</p>
      )}

      <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Corona porcelana"
          />
          <Input
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Material, Insumo…"
          />
        </div>
        <div className="flex items-end gap-2">
          <Input
            label="Valor (S/)"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className="w-32"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <Input
            label="Cant."
            type="number"
            min="1"
            className="w-20"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
          <Button
            variant="secondary"
            className="ml-auto px-3 py-2 text-xs"
            disabled={!nombre.trim() || busy}
            onClick={agregar}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
