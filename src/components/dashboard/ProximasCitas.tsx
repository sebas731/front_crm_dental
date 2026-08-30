import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ESTADO_CITA } from "@/lib/estados";
import type { Cita } from "@/types";

export function ProximasCitas({
  citas,
  nombre,
}: {
  citas: Cita[];
  nombre: (id: string) => string;
}) {
  return (
    <Card title="Próximas citas">
      {citas.length === 0 ? (
        <p className="text-sm text-slate-500">Sin citas próximas.</p>
      ) : (
        <ul className="space-y-2">
          {citas.map((c) => {
            const est = ESTADO_CITA[c.estado];
            return (
              <li key={c.id}>
                <Link
                  href={`/citas/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <CalendarClock className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {nombre(c.paciente)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {c.fecha} · {c.hora_inicio.slice(0, 5)}
                    </p>
                  </div>
                  <Badge label={est.label} color={est.color} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
