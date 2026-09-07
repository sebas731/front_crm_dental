import {
  Cake,
  Droplet,
  MessageCircle,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { procedenciaLabel } from "@/lib/procedencia";
import type { Paciente } from "@/types";

const SEXO: Record<string, string> = { M: "Masculino", F: "Femenino" };
const TIPO_DOC: Record<string, string> = {
  DNI: "DNI",
  CE: "CE",
  PAS: "Pasaporte",
  PART: "Partida",
};

function Chip({
  icon: Icon,
  children,
}: {
  icon: typeof Phone;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
      <Icon className="h-3.5 w-3.5 opacity-90" />
      {children}
    </span>
  );
}

/** Cabecera de la ficha: avatar + nombre + datos clave (los que ya manejamos). */
export function FichaHeader({ paciente: p }: { paciente: Paciente }) {
  const iniciales =
    `${p.nombres[0] ?? ""}${p.apellido_paterno[0] ?? ""}`.toUpperCase();
  const procedencia = procedenciaLabel(p.procedencia);

  return (
    <div
      className="rounded-2xl p-5 text-white shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, var(--primary), var(--primary-dark, #0f766e))",
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-semibold ring-2 ring-white/40">
          {iniciales || <User className="h-7 w-7" />}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold md:text-2xl">
            {p.nombres} {p.apellido_paterno} {p.apellido_materno}
          </h1>
          <p className="text-sm text-white/80">
            {TIPO_DOC[p.tipo_documento] ?? p.tipo_documento}{" "}
            {p.numero_documento}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.edad != null && <Chip icon={Cake}>{p.edad} años</Chip>}
            {p.sexo && <Chip icon={User}>{SEXO[p.sexo] ?? p.sexo}</Chip>}
            {p.grupo_sanguineo && (
              <Chip icon={Droplet}>{p.grupo_sanguineo}</Chip>
            )}
            {p.telefono && <Chip icon={Phone}>{p.telefono}</Chip>}
            {p.whatsapp && (
              <Chip icon={MessageCircle}>WhatsApp {p.whatsapp}</Chip>
            )}
            {procedencia && <Chip icon={Sparkles}>{procedencia}</Chip>}
          </div>
        </div>
      </div>
    </div>
  );
}
