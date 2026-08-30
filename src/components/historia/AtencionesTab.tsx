"use client";

import { useState } from "react";
import { CitaDetalle } from "@/components/historia/CitaDetalle";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_CITA } from "@/lib/estados";
import type { Cita, Medico, ServicioDental } from "@/types";

export function AtencionesTab({
  citas,
  medicos,
  servicios,
}: {
  citas: Cita[];
  medicos: Medico[];
  servicios: ServicioDental[];
}) {
  const [selected, setSelected] = useState<Cita | null>(null);

  const medicoName = (id: string) => {
    const m = medicos.find((x) => x.id === id);
    return m ? `${m.nombres} ${m.apellidos}` : "—";
  };
  const servicioName = (id: string | null) => {
    const s = servicios.find((x) => x.id === id);
    return s ? s.nombre : "—";
  };

  // Citas atendidas (o con atención registrada), más recientes primero.
  const atendidas = citas
    .filter((c) => c.estado === "ATENDIDA" || c.atencion)
    .sort((a, b) =>
      (b.fecha + b.hora_inicio).localeCompare(a.fecha + a.hora_inicio),
    );

  if (selected) {
    return (
      <CitaDetalle
        cita={selected}
        medicoName={medicoName}
        servicioName={servicioName}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (atendidas.length === 0) {
    return (
      <p className="text-sm text-slate-500">Sin citas atendidas todavía.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/70">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-400">
          <tr>
            <th className="px-4 py-2 font-medium">Fecha</th>
            <th className="px-4 py-2 font-medium">Médico</th>
            <th className="px-4 py-2 font-medium">Procedimiento</th>
            <th className="px-4 py-2 font-medium">Estado</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {atendidas.map((c) => {
            const est = ESTADO_CITA[c.estado];
            return (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-2">
                  {c.fecha} {c.hora_inicio.slice(0, 5)}
                </td>
                <td className="px-4 py-2">{medicoName(c.medico)}</td>
                <td className="px-4 py-2">{servicioName(c.servicio)}</td>
                <td className="px-4 py-2">
                  <Badge label={est.label} color={est.color} />
                </td>
                <td className="px-4 py-2 text-right text-teal-600">Ver →</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
