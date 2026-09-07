/**
 * Shared TypeScript types for the dental CRM, mirroring the DRF serializers.
 * UUID primary keys are represented as strings.
 */

/** DRF PageNumberPagination response. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Fields shared by all models (shared.BaseModel). */
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Auth / users
// ---------------------------------------------------------------------------
export interface TokenPair {
  access: string;
  refresh: string;
}

export type UserRol = "ADMIN" | "MANAGER" | "ASSISTANT" | "MEDICO";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  fullname: string;
  rol: UserRol;
  is_active: boolean;
  is_staff: boolean;
}

export interface UserInput {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  rol: UserRol;
  is_active?: boolean;
  password?: string;
}

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------
export type Sexo = "M" | "F";
export type TipoDocumento = "DNI" | "CE" | "PAS" | "PART";
export type GrupoSanguineo =
  "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Procedencia =
  | "TIKTOK"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "GOOGLE"
  | "RECOMENDADO"
  | "FERIA"
  | "PASO"
  | "OTRO"
  | "";

export interface Acompanante extends BaseModel {
  paciente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  parentesco: string;
  telefono: string;
}

export interface Paciente extends BaseModel {
  // Heredados de Cliente
  nombre: string;
  apellido: string;
  segundo_apellido: string;
  correo: string;
  numero: string;
  // Propios de Paciente
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  sexo: Sexo | "";
  edad: number | null;
  fecha_nacimiento: string | null;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  grupo_sanguineo: GrupoSanguineo | "";
  procedencia: Procedencia;
  centro_educativo: string;
  nombre_padre: string;
  nombre_madre: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  acompanantes: Acompanante[];
}

/** Campos aceptados al crear/editar un paciente. */
export type PacienteInput = Partial<
  Omit<Paciente, keyof BaseModel | "acompanantes">
>;

// ---------------------------------------------------------------------------
// Citas
// ---------------------------------------------------------------------------
export type EstadoCita =
  | "PROGRAMADA"
  | "CONFIRMADA"
  | "EN_ATENCION"
  | "ATENDIDA"
  | "CANCELADA"
  | "NO_ASISTIO";

export type MetodoPago =
  "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "YAPE" | "PLIN" | "OTRO";

export interface Medico extends BaseModel {
  usuario: number | null;
  nombres: string;
  apellidos: string;
  especialidad: string;
  colegiatura: string;
  telefono: string;
  correo: string;
  activo: boolean;
}

export type MedicoInput = {
  nombres: string;
  apellidos: string;
  especialidad?: string;
  colegiatura?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
};

export interface ServicioDental extends BaseModel {
  padre: string | null;
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_minutos: number;
  activo: boolean;
}

export type EstadoAtencion = "ATENDIDO" | "FALTO" | "NO_PAGO";

export interface AtencionCita extends BaseModel {
  cita: string;
  fecha_cita: string;
  estado: EstadoAtencion;
  descripcion: string;
  evolucion: string;
  medico_atendio: string;
  firma: string;
}

export type AtencionInput = Partial<
  Omit<AtencionCita, keyof BaseModel | "cita">
>;

export interface Cita extends BaseModel {
  paciente: string;
  medico: string;
  servicio: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string | null;
  estado: EstadoCita;
  motivo: string;
  observaciones: string;
  atencion: AtencionCita | null;
  /** Id de la orden de venta autogenerada (solo lectura). */
  venta: string | null;
}

export type CitaInput = Partial<
  Omit<Cita, keyof BaseModel | "atencion" | "venta">
>;

export interface NotaAgenda extends BaseModel {
  fecha: string;
  hora: string; // "HH:MM:SS"
  texto: string;
  autor: number | null;
}

// ---------------------------------------------------------------------------
// Ventas y cobranza
// ---------------------------------------------------------------------------
export type TipoPago = "CONTADO" | "CUOTAS";
export type EstadoVenta = "PENDIENTE" | "PAGADO" | "ANULADO";
export type EstadoCuota = "PENDIENTE" | "PAGADO";

export interface VentaServicio extends BaseModel {
  venta: string;
  servicio: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

export interface Descuento extends BaseModel {
  venta: string;
  descripcion: string;
  tipo: "MONTO" | "PORCENTAJE";
  valor: string;
}

export interface Adicional extends BaseModel {
  venta: string;
  nombre: string;
  tipo: string;
  valor: string;
  cantidad: number;
  subtotal: string;
}

export interface Pago extends BaseModel {
  cuota: string;
  monto: string;
  metodo: MetodoPago;
  fecha_pago: string | null;
  referencia: string;
  comprobante: string | null;
  registrado_por: number | null;
  registrado_por_nombre: string;
  validado: boolean;
  validado_por: number | null;
  fecha_validacion: string | null;
  observacion_validacion: string;
}

export interface Cuota extends BaseModel {
  venta: string;
  numero: number;
  monto: string;
  fecha_limite: string | null;
  estado: EstadoCuota;
  cita: string | null;
  pagos: Pago[];
  total_pagado: string;
  saldo: string;
}

export interface Venta extends BaseModel {
  numero: string;
  paciente: string;
  tipo_pago: TipoPago;
  estado: EstadoVenta;
  total: string;
  observaciones: string;
  registrado_por: number | null;
  servicios: VentaServicio[];
  descuentos: Descuento[];
  adicionales: Adicional[];
  cuotas: Cuota[];
  total_pagado: string;
  saldo: string;
  total_calculado: string;
  editable: boolean;
  tiene_pagos_validados: boolean;
}

// ---------------------------------------------------------------------------
// Horarios de atención
// ---------------------------------------------------------------------------
export interface HorarioAtencion extends BaseModel {
  medico: string;
  dia_semana: number; // 0 = Lunes … 6 = Domingo
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export type HorarioInput = Partial<Omit<HorarioAtencion, keyof BaseModel>>;

// ---------------------------------------------------------------------------
// Historia clínica
// ---------------------------------------------------------------------------
export type DocumentoTipo =
  | "DNI"
  | "RADIOGRAFIA"
  | "CONSENTIMIENTO"
  | "RECETA"
  | "RESULTADO"
  | "FOTOGRAFIA"
  | "OTRO";

export interface DocumentoHC extends BaseModel {
  historia_clinica: string;
  tipo: DocumentoTipo;
  titulo: string;
  archivo: string;
  descripcion: string;
}

export interface DienteEstado {
  estado?: string;
  notas?: string;
}

export interface Odontograma extends BaseModel {
  historia_clinica: string;
  fecha: string;
  dientes: Record<string, DienteEstado>;
  especificaciones: string;
  informe_radiografico: string;
  higiene_bucal: string;
  ihos: string;
  diagnostico: string;
  cie: string;
  plan_tratamiento: string;
  observaciones: string;
}

export type OdontogramaInput = Partial<Omit<Odontograma, keyof BaseModel>>;

export interface AntecedentesPersonales extends BaseModel {
  historia_clinica: string;
  alergias: string | null;
  enfermedades_pulmonares: string | null;
  enfermedades_cardiacas: string | null;
  enfermedades_neurologicas: string | null;
  enfermedades_hepaticas: string | null;
  enfermedades_renales: string | null;
  sistema_endocrino: string | null;
  musculo_esqueletico: string | null;
  otras_enfermedades: string | null;
  enfermedad_cronica_y_tratamiento: string | null;
  cartilla_vacunacion_completa: boolean;
  problema_comportamiento: string | null;
  lactancia_materna: string | null;
  experiencia_dental_previa: string | null;
  revision_sistemica: string | null;
}

export type AntecedentesInput = Partial<
  Omit<AntecedentesPersonales, keyof BaseModel>
>;

export interface HistoriaClinica extends BaseModel {
  paciente: string;
  numero: string;
  fecha_apertura: string;
  observaciones: string;
  detalle: string | null;
  documentos: DocumentoHC[];
  odontogramas: Odontograma[];
  antecedentes: AntecedentesPersonales | null;
}
