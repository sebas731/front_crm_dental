import type {
  EstadoAtencion,
  EstadoCita,
  EstadoCuota,
  EstadoVenta,
  TipoPago,
} from "@/types";

export const ESTADO_CITA: Record<EstadoCita, { label: string; color: string }> =
  {
    PROGRAMADA: { label: "Programada", color: "#0891b2" },
    CONFIRMADA: { label: "Confirmada", color: "#0d9488" },
    EN_ATENCION: { label: "En atención", color: "#f59e0b" },
    ATENDIDA: { label: "Atendida", color: "#10b981" },
    CANCELADA: { label: "Cancelada", color: "#f43f5e" },
    NO_ASISTIO: { label: "No asistió", color: "#64748b" },
  };

export const ESTADO_ATENCION: Record<EstadoAtencion, string> = {
  ATENDIDO: "Atendido",
  FALTO: "Faltó",
  NO_PAGO: "No pagó (no se atendió)",
};

export const ESTADO_VENTA: Record<
  EstadoVenta,
  { label: string; color: string }
> = {
  PENDIENTE: { label: "Pendiente", color: "#f59e0b" },
  PAGADO: { label: "Pagado", color: "#10b981" },
  ANULADO: { label: "Anulado", color: "#64748b" },
};

export const ESTADO_CUOTA: Record<
  EstadoCuota,
  { label: string; color: string }
> = {
  PENDIENTE: { label: "Pendiente", color: "#f59e0b" },
  PAGADO: { label: "Pagado", color: "#10b981" },
};

export const TIPO_PAGO: Record<TipoPago, string> = {
  CONTADO: "Contado",
  CUOTAS: "Cuotas",
};

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
