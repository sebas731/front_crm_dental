import type { MetodoPago, Paciente, User, Venta } from "@/types";
import { hoyLocal, mesLocal } from "@/lib/fechas";
import { procedenciaLabel } from "@/lib/procedencia";

const n = (v: string) => Number(v) || 0;
const hoyStr = () => hoyLocal();
const mesStr = () => mesLocal();

const METODO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta",
  TRANSFERENCIA: "Transferencia",
  YAPE: "Yape",
  PLIN: "Plin",
  OTRO: "Otro",
};

/** ¿La fecha (YYYY-MM-DD) cae dentro del rango [desde, hasta]? */
function enRango(fecha: string, desde?: string, hasta?: string): boolean {
  return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
}

export interface MetodoAgg {
  metodo: string;
  monto: number;
  cantidad: number;
}

/** Pagos agrupados por método (Yape, Transferencia…), filtrados por fecha. */
export function pagosPorMetodo(
  ventas: Venta[],
  desde?: string,
  hasta?: string,
): MetodoAgg[] {
  const map = new Map<string, MetodoAgg>();
  for (const v of ventas) {
    if (v.estado === "ANULADO") continue;
    for (const c of v.cuotas) {
      for (const p of c.pagos) {
        if (!p.fecha_pago) continue;
        if (!enRango(p.fecha_pago.slice(0, 10), desde, hasta)) continue;
        const label = METODO_LABEL[p.metodo] ?? p.metodo;
        const cur = map.get(label) ?? { metodo: label, monto: 0, cantidad: 0 };
        cur.monto += n(p.monto);
        cur.cantidad += 1;
        map.set(label, cur);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.monto - a.monto);
}

export interface ProcedenciaAgg {
  procedencia: string;
  pacientes: number;
  monto: number;
}

/**
 * De dónde vienen los pacientes (Facebook, TikTok…): cantidad de pacientes y
 * monto cobrado en el rango, según la procedencia del paciente de cada pago.
 */
export function cobrosPorProcedencia(
  ventas: Venta[],
  pacientes: Paciente[],
  desde?: string,
  hasta?: string,
): ProcedenciaAgg[] {
  const proc = new Map<string, string>(); // pacienteId -> etiqueta procedencia
  for (const p of pacientes) {
    proc.set(p.id, procedenciaLabel(p.procedencia) || "Sin especificar");
  }
  const map = new Map<string, { monto: number; pacientes: Set<string> }>();
  for (const v of ventas) {
    if (v.estado === "ANULADO") continue;
    const etiqueta = proc.get(v.paciente) ?? "Sin especificar";
    for (const c of v.cuotas) {
      for (const p of c.pagos) {
        if (!p.fecha_pago) continue;
        if (!enRango(p.fecha_pago.slice(0, 10), desde, hasta)) continue;
        const cur = map.get(etiqueta) ?? { monto: 0, pacientes: new Set() };
        cur.monto += n(p.monto);
        cur.pacientes.add(v.paciente);
        map.set(etiqueta, cur);
      }
    }
  }
  return [...map.entries()]
    .map(([procedencia, x]) => ({
      procedencia,
      monto: x.monto,
      pacientes: x.pacientes.size,
    }))
    .sort((a, b) => b.monto - a.monto);
}

/** Cantidad de pacientes por procedencia (para el dashboard). */
export function pacientesPorProcedencia(
  pacientes: Paciente[],
): { procedencia: string; cantidad: number }[] {
  const map = new Map<string, number>();
  for (const p of pacientes) {
    const label = procedenciaLabel(p.procedencia) || "Sin especificar";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([procedencia, cantidad]) => ({ procedencia, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export interface ServicioAgg {
  servicio: string;
  vendido: number;
  pagado: number;
  cantidad: number;
}

/** Acumulado vendido y pagado por servicio (pagado prorrateado por venta). */
export function ventasPorServicio(ventas: Venta[]): ServicioAgg[] {
  const map = new Map<string, ServicioAgg>();
  for (const v of ventas) {
    if (v.estado === "ANULADO") continue;
    const total = n(v.total);
    const fraccionPagada = total > 0 ? n(v.total_pagado) / total : 0;
    for (const s of v.servicios) {
      const cur = map.get(s.servicio) ?? {
        servicio: s.servicio,
        vendido: 0,
        pagado: 0,
        cantidad: 0,
      };
      const sub = n(s.subtotal);
      cur.vendido += sub;
      cur.pagado += sub * fraccionPagada;
      cur.cantidad += s.cantidad;
      map.set(s.servicio, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.vendido - a.vendido);
}

export interface VendedorAgg {
  usuario: number | null;
  nombre: string;
  cantidad: number;
  total: number;
}

/** Ranking de usuarios por cantidad de ventas registradas (comisiones). */
export function rankingVendedores(
  ventas: Venta[],
  users: User[],
): VendedorAgg[] {
  const map = new Map<number | null, VendedorAgg>();
  for (const v of ventas) {
    if (v.estado === "ANULADO") continue;
    const key = v.registrado_por;
    const u = users.find((x) => x.id === key);
    const cur = map.get(key) ?? {
      usuario: key,
      nombre: u ? u.fullname || u.username : "Sin asignar",
      cantidad: 0,
      total: 0,
    };
    cur.cantidad += 1;
    cur.total += n(v.total);
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.cantidad - a.cantidad);
}

function pagosDe(ventas: Venta[]): { fecha: string; monto: number }[] {
  const out: { fecha: string; monto: number }[] = [];
  for (const v of ventas)
    for (const c of v.cuotas)
      for (const p of c.pagos)
        if (p.fecha_pago)
          out.push({ fecha: p.fecha_pago.slice(0, 10), monto: n(p.monto) });
  return out;
}

export interface Resumen {
  ventasMesTotal: number;
  ventasMesCount: number;
  pagadoMes: number;
  ventasHoyTotal: number;
  ventasHoyCount: number;
  pagadoHoy: number;
}

export function resumenVentas(ventas: Venta[]): Resumen {
  const hoy = hoyStr();
  const mes = mesStr();
  const activas = ventas.filter((v) => v.estado !== "ANULADO");
  const delMes = activas.filter((v) => v.created_at.slice(0, 7) === mes);
  const delDia = activas.filter((v) => v.created_at.slice(0, 10) === hoy);
  const pagos = pagosDe(activas);
  return {
    ventasMesTotal: delMes.reduce((a, v) => a + n(v.total), 0),
    ventasMesCount: delMes.length,
    pagadoMes: pagos
      .filter((p) => p.fecha.slice(0, 7) === mes)
      .reduce((a, p) => a + p.monto, 0),
    ventasHoyTotal: delDia.reduce((a, v) => a + n(v.total), 0),
    ventasHoyCount: delDia.length,
    pagadoHoy: pagos
      .filter((p) => p.fecha === hoy)
      .reduce((a, p) => a + p.monto, 0),
  };
}
