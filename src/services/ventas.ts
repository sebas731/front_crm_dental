import { api, apiFetch } from "./api";
import type {
  Adicional,
  Cuota,
  Descuento,
  Pago,
  Paginated,
  Venta,
  VentaServicio,
} from "@/types";

// --- Ventas ---
export function listVentas(params?: {
  paciente?: string;
  estado?: string;
}): Promise<Paginated<Venta>> {
  const qs = new URLSearchParams();
  if (params?.paciente) qs.set("paciente", params.paciente);
  if (params?.estado) qs.set("estado", params.estado);
  qs.set("page_size", "300");
  return api.get<Paginated<Venta>>(`/ventas/?${qs.toString()}`);
}

export function getVenta(id: string): Promise<Venta> {
  return api.get<Venta>(`/ventas/${id}/`);
}

export function createVenta(data: Partial<Venta>): Promise<Venta> {
  return api.post<Venta>("/ventas/", data);
}

/** Anula una venta (devoluciones / errores). Conserva el historial. */
export function anularVenta(id: string, motivo?: string): Promise<Venta> {
  return api.post<Venta>(`/ventas/${id}/anular/`, { motivo: motivo ?? "" });
}

/** Duplica una venta como copia editable (nueva venta sin pagos). */
export function duplicarVenta(id: string): Promise<Venta> {
  return api.post<Venta>(`/ventas/${id}/duplicar/`, {});
}

// --- Líneas de la venta ---
export function addVentaServicio(
  data: Partial<VentaServicio>,
): Promise<VentaServicio> {
  return api.post<VentaServicio>("/venta-servicios/", data);
}

export function updateVentaServicio(
  id: string,
  data: Partial<VentaServicio>,
): Promise<VentaServicio> {
  return api.patch<VentaServicio>(`/venta-servicios/${id}/`, data);
}

export function deleteVentaServicio(id: string): Promise<void> {
  return api.delete<void>(`/venta-servicios/${id}/`);
}

export function addDescuento(data: Partial<Descuento>): Promise<Descuento> {
  return api.post<Descuento>("/descuentos/", data);
}

export function deleteDescuento(id: string): Promise<void> {
  return api.delete<void>(`/descuentos/${id}/`);
}

export function addAdicional(data: Partial<Adicional>): Promise<Adicional> {
  return api.post<Adicional>("/adicionales/", data);
}

export function deleteAdicional(id: string): Promise<void> {
  return api.delete<void>(`/adicionales/${id}/`);
}

// --- Cuotas ---
export function createCuota(data: Partial<Cuota>): Promise<Cuota> {
  return api.post<Cuota>("/cuotas/", data);
}

export function updateCuota(id: string, data: Partial<Cuota>): Promise<Cuota> {
  return api.patch<Cuota>(`/cuotas/${id}/`, data);
}

// --- Pagos ---
export function registrarPago(
  data: {
    cuota: string;
    monto: string;
    metodo: string;
    fecha_pago?: string;
    referencia?: string;
  },
  comprobante?: File,
): Promise<Pago> {
  if (!comprobante) return api.post<Pago>("/pagos/", data);
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  fd.append("comprobante", comprobante);
  return apiFetch<Pago>("/pagos/", { method: "POST", formData: fd });
}

export function validarPago(id: string): Promise<Pago> {
  return api.post<Pago>(`/pagos/${id}/validar/`);
}
