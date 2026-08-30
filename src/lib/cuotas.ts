export type Frecuencia = "SEMANAL" | "QUINCENAL" | "MENSUAL";

export interface CuotaPreview {
  numero: number;
  monto: string;
  fecha_limite: string;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function avanzar(d: Date, f: Frecuencia): Date {
  const next = new Date(d);
  if (f === "SEMANAL") next.setDate(next.getDate() + 7);
  else if (f === "QUINCENAL") next.setDate(next.getDate() + 15);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * Divide `total` en `n` cuotas (la última absorbe el redondeo) a partir de
 * `primeraFecha`, espaciadas según `frecuencia`.
 */
export function generarCuotas(
  total: number,
  opts: { n: number; primeraFecha: string; frecuencia: Frecuencia },
): CuotaPreview[] {
  const n = Math.max(1, Math.floor(opts.n));
  const base = Math.floor((total / n) * 100) / 100;
  const cuotas: CuotaPreview[] = [];
  let acumulado = 0;
  let fecha = new Date(`${opts.primeraFecha}T00:00:00`);

  for (let i = 1; i <= n; i++) {
    const monto = i < n ? base : Math.round((total - acumulado) * 100) / 100;
    acumulado += base;
    cuotas.push({
      numero: i,
      monto: monto.toFixed(2),
      fecha_limite: ymd(fecha),
    });
    fecha = avanzar(fecha, opts.frecuencia);
  }
  return cuotas;
}
