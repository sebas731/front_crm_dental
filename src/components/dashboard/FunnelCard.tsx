import { Card } from "@/components/ui/Card";
import { ESTADO_CITA } from "@/lib/estados";
import type { Cita, EstadoCita } from "@/types";

const ETAPAS: EstadoCita[] = [
  "PROGRAMADA",
  "CONFIRMADA",
  "ATENDIDA",
  "NO_ASISTIO",
  "CANCELADA",
];

export function FunnelCard({ citas }: { citas: Cita[] }) {
  const total = citas.length || 1;

  return (
    <Card title="Embudo de citas">
      <div className="space-y-3">
        {ETAPAS.map((estado) => {
          const n = citas.filter((c) => c.estado === estado).length;
          const pct = Math.round((n / total) * 100);
          const { label, color } = ESTADO_CITA[estado];
          return (
            <div key={estado}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-800">{n}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
