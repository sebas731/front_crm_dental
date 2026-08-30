import { Card } from "@/components/ui/Card";
import { procedenciaLabel } from "@/lib/procedencia";
import type { Paciente } from "@/types";

const SEXO: Record<string, string> = { M: "Masculino", F: "Femenino" };
const TIPO_DOC: Record<string, string> = {
  DNI: "DNI",
  CE: "Carné de extranjería",
  PAS: "Pasaporte",
  PART: "Partida de nacimiento",
};

function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}

export function FichaPaciente({ paciente }: { paciente: Paciente }) {
  const p = paciente;
  const iniciales =
    `${p.nombres[0] ?? ""}${p.apellido_paterno[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-xl font-semibold text-white ring-2 ring-white">
            {iniciales}
          </span>
          <h2 className="mt-3 text-lg font-semibold text-slate-800">
            {p.nombres} {p.apellido_paterno} {p.apellido_materno}
          </h2>
          <p className="text-sm text-slate-500">
            {TIPO_DOC[p.tipo_documento]} {p.numero_documento}
          </p>
        </div>
      </Card>

      <Card title="Datos personales">
        <div className="divide-y divide-slate-100">
          <Row label="Sexo" value={SEXO[p.sexo]} />
          <Row label="Edad" value={p.edad} />
          <Row label="Fecha de nacimiento" value={p.fecha_nacimiento} />
          <Row label="Grupo sanguíneo" value={p.grupo_sanguineo} />
          <Row label="Procedencia" value={procedenciaLabel(p.procedencia)} />
          <Row label="Centro educativo" value={p.centro_educativo} />
        </div>
      </Card>

      <Card title="Contacto">
        <div className="divide-y divide-slate-100">
          <Row label="Teléfono" value={p.telefono} />
          <Row label="Correo" value={p.correo} />
          <Row label="Dirección" value={p.direccion} />
        </div>
      </Card>

      <Card title="Familiares">
        <div className="divide-y divide-slate-100">
          <Row label="Padre" value={p.nombre_padre} />
          <Row label="Madre" value={p.nombre_madre} />
        </div>
        {p.acompanantes.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-slate-400">Acompañantes</p>
            {p.acompanantes.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-slate-200/70 p-3 text-sm"
              >
                <p className="font-medium text-slate-700">
                  {a.nombre} {a.apellido_paterno} {a.apellido_materno}
                </p>
                <p className="text-xs text-slate-400">
                  {a.parentesco} · DNI {a.dni} · {a.telefono || "sin tel."}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
