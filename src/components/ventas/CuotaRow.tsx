"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Field";
import { FileInput } from "@/components/ui/FileInput";
import { ESTADO_CUOTA } from "@/lib/estados";
import { registrarPago, updateCuota, validarPago } from "@/services/ventas";
import type { Cuota, MetodoPago } from "@/types";

const METODOS: MetodoPago[] = [
  "EFECTIVO",
  "TARJETA",
  "TRANSFERENCIA",
  "YAPE",
  "PLIN",
  "OTRO",
];

export function CuotaRow({
  cuota,
  onChanged,
}: {
  cuota: Cuota;
  onChanged: () => void | Promise<void>;
}) {
  const est = ESTADO_CUOTA[cuota.estado];
  const pendiente = cuota.estado === "PENDIENTE";

  const [nuevaFecha, setNuevaFecha] = useState(cuota.fecha_limite ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [pagando, setPagando] = useState(false);
  const [monto, setMonto] = useState(cuota.saldo);
  const [metodo, setMetodo] = useState<MetodoPago>("EFECTIVO");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  async function confirmarReprograma() {
    setBusy(true);
    try {
      await updateCuota(cuota.id, { fecha_limite: nuevaFecha });
      setConfirmOpen(false);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handlePago(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await registrarPago(
        {
          cuota: cuota.id,
          monto,
          metodo,
          fecha_pago: new Date().toISOString(),
        },
        archivo ?? undefined,
      );
      setPagando(false);
      setArchivo(null);
      setFileKey((k) => k + 1);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200/70 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium text-slate-800">
            Cuota {cuota.numero} · S/ {cuota.monto}
          </span>
          <span className="ml-2 text-xs text-slate-400">
            vence {cuota.fecha_limite ?? "—"} · pagado S/ {cuota.total_pagado}
          </span>
        </div>
        <Badge label={est.label} color={est.color} />
      </div>

      {/* Pagos registrados */}
      {cuota.pagos.map((p) => (
        <div
          key={p.id}
          className="mt-2 flex items-center justify-between text-sm"
        >
          <span className="text-slate-600">
            S/ {p.monto} · {p.metodo}
            {p.comprobante && (
              <a
                href={p.comprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-teal-600 hover:underline"
              >
                comprobante
              </a>
            )}
          </span>
          {p.validado ? (
            <Badge label="Validado" color="#10b981" />
          ) : (
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={async () => {
                await validarPago(p.id);
                await onChanged();
              }}
            >
              Validar
            </Button>
          )}
        </div>
      ))}

      {/* Acciones para cuota pendiente */}
      {pendiente && (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
          <Input
            label="Reprogramar a"
            type="date"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            className="w-40"
          />
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            disabled={!nuevaFecha || nuevaFecha === cuota.fecha_limite}
            onClick={() => setConfirmOpen(true)}
          >
            Reprogramar
          </Button>
          <span className="flex-1" />
          {!pagando && (
            <Button
              className="px-3 py-1.5 text-xs"
              onClick={() => setPagando(true)}
            >
              Registrar pago
            </Button>
          )}
        </div>
      )}

      {pagando && (
        <form
          onSubmit={handlePago}
          className="mt-3 grid grid-cols-2 items-end gap-2 border-t border-slate-100 pt-3"
        >
          <Input
            label="Monto (S/)"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
          <Select
            label="Método"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as MetodoPago)}
          >
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <div className="col-span-2">
            <FileInput
              key={fileKey}
              label="Comprobante"
              onChange={setArchivo}
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Guardando…" : "Confirmar pago"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPagando(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Reprogramar pago"
        loading={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmarReprograma}
      >
        ¿Reprogramar el pago de la cuota {cuota.numero} del{" "}
        <span className="font-medium">{cuota.fecha_limite ?? "—"}</span> al{" "}
        <span className="rounded bg-teal-50 px-1.5 py-0.5 font-semibold text-teal-700">
          {nuevaFecha}
        </span>
        ?
      </ConfirmDialog>
    </div>
  );
}
