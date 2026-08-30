import Link from "next/link";
import { Circle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { AlertaCuota } from "@/lib/alertas";

function prioridad(dias: number): { label: string; color: string } {
  if (dias <= 0) return { label: "Vencida", color: "#f43f5e" };
  if (dias <= 2) return { label: "Urgente", color: "#f59e0b" };
  return { label: "Próxima", color: "#0891b2" };
}

export function TareasCard({
  alertas,
  nombre,
}: {
  alertas: AlertaCuota[];
  nombre: (id: string) => string;
}) {
  return (
    <Card title="Cuotas por cobrar">
      {alertas.length === 0 ? (
        <p className="text-sm text-slate-500">No hay pendientes 🎉</p>
      ) : (
        <ul className="space-y-2">
          {alertas.map(({ venta, cuota, dias }) => {
            const p = prioridad(dias);
            return (
              <li key={cuota.id}>
                <Link
                  href="/pagos"
                  className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-3 transition-colors hover:bg-slate-50"
                >
                  <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      Cobrar a {nombre(venta.paciente)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Cuota {cuota.numero} · S/ {cuota.monto} · vence{" "}
                      {cuota.fecha_limite}
                    </p>
                  </div>
                  <Badge label={p.label} color={p.color} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
