"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Field";
import { FileInput } from "@/components/ui/FileInput";
import { useAuth } from "@/context/AuthContext";
import { puedeGestionarPagos } from "@/lib/roles";
import { registrarPago, updateCuota } from "@/services/ventas";
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
  readOnly = false,
}: {
  cuota: Cuota;
  onChanged: () => void | Promise<void>;
  readOnly?: boolean;
}) {
  const { user } = useAuth();
  const puedePagar = puedeGestionarPagos(user) && !readOnly;
  const pagada = cuota.estado === "PAGADO";

  const [nuevaFecha, setNuevaFecha] = useState(cuota.fecha_limite ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [pagando, setPagando] = useState(false);
  const [confirmarPago, setConfirmarPago] = useState(false);
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

  async function registrar() {
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
      setConfirmarPago(false);
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
        <span className="font-medium text-slate-800">
          Cuota {cuota.numero} · S/ {cuota.monto}
          {cuota.fecha_limite && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              vence {cuota.fecha_limite}
            </span>
          )}
        </span>
        {pagada && (
          <Badge label="Pagado" color="#10b981" />
        )}
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
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pagado
          </span>
        </div>
      ))}

      {/* Acciones para cuota no pagada */}
      {!pagada && !readOnly && (
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
          {puedePagar && !pagando && (
            <Button
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                setMonto(cuota.saldo);
                setPagando(true);
              }}
            >
              Registrar pago
            </Button>
          )}
        </div>
      )}

      {/* Formulario de pago (monto + método + comprobante) */}
      {pagando && (
        <div className="mt-3 grid grid-cols-2 items-end gap-2 border-t border-slate-100 pt-3">
          <Input
            label="Monto (S/)"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
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
            <FileInput key={fileKey} label="Comprobante" onChange={setArchivo} />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button
              onClick={() => setConfirmarPago(true)}
              disabled={!monto || Number(monto) <= 0}
            >
              Registrar pago
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPagando(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Confirmación del pago (cuadro con el monto) */}
      <ConfirmDialog
        open={confirmarPago}
        title="Confirmar pago"
        loading={busy}
        confirmLabel="Confirmar"
        onCancel={() => setConfirmarPago(false)}
        onConfirm={registrar}
      >
        ¿Registrar un pago de{" "}
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
          S/ {Number(monto || 0).toFixed(2)}
        </span>{" "}
        ({metodo}) para la cuota {cuota.numero}?
      </ConfirmDialog>

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
