import { ApiError } from "@/services/api";

// Traducción de nombres de campo del backend a etiquetas legibles.
const CAMPOS: Record<string, string> = {
  numero_documento: "N.º de documento",
  fecha_nacimiento: "Fecha de nacimiento",
  correo: "Correo",
  telefono: "Teléfono",
  nombres: "Nombres",
  apellido_paterno: "Apellido paterno",
  monto: "Monto",
  fecha: "Fecha",
  hora_inicio: "Hora",
  non_field_errors: "",
  detail: "",
};

// Mensajes típicos de DRF (en inglés) → español.
function traducir(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already exists") || m.includes("must make a unique set"))
    return "Ya existe un registro con ese valor.";
  if (m.includes("this field may not be blank"))
    return "Este campo no puede quedar vacío.";
  if (m.includes("this field is required")) return "Este campo es obligatorio.";
  if (m.includes("valid date")) return "La fecha no es válida.";
  if (m.includes("valid email")) return "El correo no es válido.";
  return msg;
}

function aplanar(data: unknown): string[] {
  if (data == null) return [];
  if (typeof data === "string") return [traducir(data)];
  if (Array.isArray(data)) return data.flatMap(aplanar);
  if (typeof data === "object") {
    return Object.entries(data as Record<string, unknown>).flatMap(
      ([campo, valor]) => {
        const etiqueta = CAMPOS[campo] ?? campo;
        return aplanar(valor).map((m) => (etiqueta ? `${etiqueta}: ${m}` : m));
      },
    );
  }
  return [String(data)];
}

/**
 * Convierte un error de la API en un mensaje legible en español.
 * Aplana los errores de validación de DRF en vez de mostrar el JSON crudo.
 */
export function mensajeError(err: unknown, fallback = "Ocurrió un error."): string {
  if (err instanceof ApiError) {
    const partes = aplanar(err.data);
    if (partes.length) return partes.join(" ");
    if (err.status >= 500) return "Error del servidor. Intentá de nuevo.";
    if (err.status === 403) return "No tenés permiso para esta acción.";
  }
  return fallback;
}
