"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ServicioSelect } from "@/components/servicios/ServicioSelect";
import {
  addVentaServicio,
  deleteVentaServicio,
  updateVentaServicio,
} from "@/services/ventas";
import type { ServicioDental, Venta, VentaServicio } from "@/types";

function RowEdit({
  item,
  nombre,
  onChanged,
}: {
  item: VentaServicio;
  nombre: string;
  onChanged: () => void | Promise<void>;
}) {
  const [precio, setPrecio] = useState(item.precio_unitario);
  const [cantidad, setCantidad] = useState(item.cantidad);
  const [busy, setBusy] = useState(false);
  const dirty = precio !== item.precio_unitario || cantidad !== item.cantidad;

  return (
    <div className="rounded-xl border border-slate-200/70 p-3">
      <p className="mb-2 line-clamp-1 text-sm font-medium text-slate-700">
        {nombre}
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          label="Precio (S/)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          className="w-32"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
        <Input
          label="Cantidad"
          type="number"
          min="1"
          className="w-24"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />
        <div className="ml-auto flex gap-1">
          <Button
            variant="secondary"
            className="px-2.5 py-2"
            disabled={!dirty || busy}
            title="Guardar"
            onClick={async () => {
              setBusy(true);
              try {
                await updateVentaServicio(item.id, {
                  precio_unitario: Number(precio).toFixed(2),
                  cantidad,
                });
                await onChanged();
              } finally {
                setBusy(false);
              }
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            className="px-2.5 py-2"
            disabled={busy}
            title="Eliminar"
            onClick={async () => {
              setBusy(true);
              try {
                await deleteVentaServicio(item.id);
                await onChanged();
              } finally {
                setBusy(false);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ServiciosEditor({
  venta,
  servicios,
  servicioName,
  onChanged,
}: {
  venta: Venta;
  servicios: ServicioDental[];
  servicioName: (id: string) => string;
  onChanged: () => void | Promise<void>;
}) {
  const [nuevo, setNuevo] = useState("");
  const [precio, setPrecio] = useState("");
  const [busy, setBusy] = useState(false);

  async function agregar() {
    if (!nuevo) return;
    setBusy(true);
    try {
      await addVentaServicio({
        venta: venta.id,
        servicio: nuevo,
        cantidad: 1,
        precio_unitario: Number(precio || 0).toFixed(2),
      });
      setNuevo("");
      setPrecio("");
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {venta.servicios.map((s) => (
        <RowEdit
          key={s.id}
          item={s}
          nombre={servicioName(s.servicio)}
          onChanged={onChanged}
        />
      ))}
      {venta.servicios.length === 0 && (
        <p className="text-sm text-slate-400">Sin servicios.</p>
      )}

      <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
        <ServicioSelect
          label="Agregar servicio"
          servicios={servicios}
          value={nuevo}
          onChange={(v) => {
            setNuevo(v);
            const s = servicios.find((x) => x.id === v);
            if (s) setPrecio(s.precio);
          }}
        />
        <div className="flex items-end gap-2">
          <Input
            label="Precio (S/)"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className="w-32"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <Button
            variant="secondary"
            className="ml-auto px-3 py-2 text-xs"
            disabled={!nuevo || busy}
            onClick={agregar}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
