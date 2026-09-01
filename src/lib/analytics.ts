import type { User, Venta } from "@/types";
import { hoyLocal, mesLocal } from "@/lib/fechas";

const n = (v: string) => Number(v) || 0;
const hoyStr = () => hoyLocal();
const mesStr = () => mesLocal();

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
