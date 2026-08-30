import Link from "next/link";
import { CalendarClock, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppButton } from "@/components/citas/WhatsAppButton";
import { ESTADO_CITA } from "@/lib/estados";
import type { Cita, Paciente } from "@/types";

export function CitaCardList({
  citas,
  pacientes,
  medicoName,
  servicioName,
}: {
  citas: Cita[];
  pacientes: Paciente[];
  medicoName: (id: string) => string;
  servicioName: (id: string | null) => string;
}) {
  if (citas.length === 0) {
    return <p className="text-sm text-slate-500">Sin citas.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {citas.map((c) => {
        const est = ESTADO_CITA[c.estado];
        const paciente = pacientes.find((p) => p.id === c.paciente);
        return (
          <div
            key={c.id}
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <CalendarClock className="h-4 w-4 text-teal-600" />
                {c.fecha} · {c.hora_inicio.slice(0, 5)}
              </span>
              <Badge label={est.label} color={est.color} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {paciente
                ? `${paciente.nombres} ${paciente.apellido_paterno}`
                : c.paciente}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Stethoscope className="h-3.5 w-3.5" />
              {medicoName(c.medico)} · {servicioName(c.servicio)}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <WhatsAppButton cita={c} paciente={paciente} />
              <Link
                href={`/citas/${c.id}`}
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                Ver / Atender →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
