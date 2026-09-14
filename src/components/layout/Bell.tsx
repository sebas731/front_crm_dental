"use client";

import Link from "next/link";
import { Bell as BellIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { alertasCuotas, type AlertaCuota } from "@/lib/alertas";
import { listAllVentas } from "@/services/ventas";
import { listAllPacientes } from "@/services/pacientes";
import type { Paciente } from "@/types";

export function Bell() {
  const [alertas, setAlertas] = useState<AlertaCuota[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listAllVentas(), listAllPacientes()])
      .then(([v, p]) => {
        if (!active) return;
        setAlertas(alertasCuotas(v));
        setPacientes(p);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const nombre = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : "Paciente";
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
        aria-label="Alertas"
      >
        <BellIcon className="h-5 w-5" />
        {alertas.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {alertas.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-slate-200/70 bg-white p-2 shadow-xl">
          <p className="px-2 py-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Cuotas por vencer
          </p>
          {alertas.length === 0 ? (
            <p className="px-2 py-3 text-sm text-slate-500">Sin alertas 🎉</p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {alertas.map(({ venta, cuota, dias }) => (
                <li key={cuota.id}>
                  <Link
                    href="/pagos"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-2 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-800">
                      {nombre(venta.paciente)}
                    </span>
                    <span className="block text-xs text-slate-400">
                      Cuota {cuota.numero} · S/ {cuota.monto} ·{" "}
                      {dias < 0
                        ? "vencida"
                        : dias === 0
                          ? "vence hoy"
                          : `en ${dias} día${dias > 1 ? "s" : ""}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
