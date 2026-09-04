"use client";

import { CheckCircle2, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import type { Pago } from "@/types";

function esImagen(url: string): boolean {
  return /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(url.split("?")[0]);
}

/** Recibo de un pago, en modal, solo para ver (no edita). */
export function ReciboPago({
  pago,
  paciente,
  concepto,
  ventaNumero,
  cuotaNumero,
  onClose,
}: {
  pago: Pago;
  paciente: string;
  concepto: string;
  ventaNumero: string;
  cuotaNumero: number;
  onClose: () => void;
}) {
  const fecha = pago.fecha_pago
    ? new Date(pago.fecha_pago).toLocaleString("es", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />

      <div
        className="relative my-8 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ animation: "reciboIn 0.28s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Cabecera con la marca */}
        <div
          className="relative px-6 py-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-dark, #0f766e))",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <LogoMark size={32} tone="white" />
            <div>
              <p className="text-sm font-semibold tracking-wide">
                DENTAL STUDIO
              </p>
              <p className="text-xs text-white/80">Recibo de pago</p>
            </div>
          </div>
        </div>

        {/* Monto destacado + sello Pagado */}
        <div className="relative border-b border-dashed border-slate-200 px-6 py-6 text-center">
          <p className="text-xs tracking-wide text-slate-400 uppercase">
            Monto pagado
          </p>
          <p className="mt-1 text-4xl font-bold text-slate-800">
            S/ {Number(pago.monto).toFixed(2)}
          </p>
          <span
            className="absolute top-4 right-5 flex items-center gap-1 rounded-full border-2 border-emerald-500 px-2 py-0.5 text-xs font-bold text-emerald-600"
            style={{ animation: "reciboSello 0.5s 0.2s backwards ease-out" }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            PAGADO
          </span>
        </div>

        {/* Detalles */}
        <dl className="space-y-2.5 px-6 py-5 text-sm">
          <Fila k="Paciente" v={paciente} />
          <Fila k="Concepto" v={concepto || "—"} />
          <Fila k="Método" v={pago.metodo} />
          {pago.referencia && <Fila k="Referencia" v={pago.referencia} />}
          <Fila k="Fecha" v={fecha} />
          <Fila
            k="Venta / cuota"
            v={`${ventaNumero} · cuota ${cuotaNumero}`}
          />
          <Fila k="Registrado por" v={pago.registrado_por_nombre || "—"} />
        </dl>

        {/* Comprobante */}
        {pago.comprobante && (
          <div className="border-t border-slate-100 px-6 py-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              Comprobante
            </p>
            {esImagen(pago.comprobante) ? (
              <a href={pago.comprobante} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pago.comprobante}
                  alt="Comprobante de pago"
                  className="max-h-56 w-full rounded-xl border border-slate-200 object-contain"
                />
              </a>
            ) : (
              <a
                href={pago.comprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                Ver comprobante adjunto
              </a>
            )}
          </div>
        )}

        <p className="px-6 pb-5 text-center text-[11px] text-slate-400">
          Gracias por su pago · DENTAL STUDIO
        </p>
      </div>
    </div>
  );
}

function Fila({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-400">{k}</dt>
      <dd className="text-right font-medium text-slate-700">{v}</dd>
    </div>
  );
}
