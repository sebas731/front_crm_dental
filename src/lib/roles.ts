import type { User, UserRol } from "@/types";

/** Roles con acceso administrativo total (incluye finanzas/pagos). */
const ADMINISTRATIVOS: UserRol[] = ["ADMIN", "MANAGER"];

export function esAdministrativo(user: User | null): boolean {
  return !!user && ADMINISTRATIVOS.includes(user.rol);
}

export function esMedico(user: User | null): boolean {
  return user?.rol === "MEDICO";
}

/** ¿El usuario puede registrar/validar pagos? Solo administrativos. */
export function puedeGestionarPagos(user: User | null): boolean {
  return esAdministrativo(user);
}

/** ¿Puede crear/editar/eliminar pacientes? Administrativos y asistentes
 *  (el médico solo consulta la historia clínica). */
export function puedeRegistrarPacientes(user: User | null): boolean {
  return esAdministrativo(user) || user?.rol === "ASSISTANT";
}

/** ¿Puede agendar/crear citas? El médico solo ve y atiende las suyas. */
export function puedeCrearCitas(user: User | null): boolean {
  return esAdministrativo(user) || user?.rol === "ASSISTANT";
}

export const ROL_LABEL: Record<UserRol, string> = {
  ADMIN: "Soporte",
  MANAGER: "Administrador",
  ASSISTANT: "Asistente",
  MEDICO: "Médico",
};

/** Qué habilita cada rol (los "permisos" del sistema se otorgan por rol). */
export const ROL_DESCRIPCION: Record<UserRol, string> = {
  ADMIN: "Acceso total, incluida la gestión de usuarios y la configuración.",
  MANAGER: "Acceso total al negocio: pacientes, citas, ventas, pagos y reportes.",
  ASSISTANT:
    "Pacientes, citas, historias y agenda. No registra ni valida pagos, ni gestiona usuarios.",
  MEDICO:
    "Solo consulta: sus citas, atender, ver horario e historias. Sin acceso administrativo ni a pagos.",
};
