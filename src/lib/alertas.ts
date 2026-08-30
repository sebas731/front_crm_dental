import type { Cuota, Venta } from "@/types";

export interface AlertaCuota {
  venta: Venta;
  cuota: Cuota;
  dias: number; // días hasta el vencimiento (negativo = vencida)
}

function diasHasta(fechaISO: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(`${fechaISO}T00:00:00`);
  return Math.round((f.getTime() - hoy.getTime()) / 86_400_000);
}

/**
 * Cuotas pendientes cuya fecha límite ya venció o vence dentro de
 * `ventanaDias`. Se recorre cada venta con sus cuotas.
 */
export function alertasCuotas(ventas: Venta[], ventanaDias = 7): AlertaCuota[] {
  const out: AlertaCuota[] = [];
  for (const venta of ventas) {
    if (venta.estado === "ANULADO") continue;
    for (const cuota of venta.cuotas) {
      if (cuota.estado !== "PENDIENTE" || !cuota.fecha_limite) continue;
      const dias = diasHasta(cuota.fecha_limite);
      if (dias <= ventanaDias) out.push({ venta, cuota, dias });
    }
  }
  return out.sort((a, b) => a.dias - b.dias);
}
