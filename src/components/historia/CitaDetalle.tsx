import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { ESTADO_ATENCION, ESTADO_CITA } from "@/lib/estados";
import type { Cita } from "@/types";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}

export function CitaDetalle({
  cita,
  medicoName,
  servicioName,
  onBack,
}: {
  cita: Cita;
  medicoName: (id: string) => string;
  servicioName: (id: string | null) => string;
  onBack: () => void;
}) {
  const est = ESTADO_CITA[cita.estado];
  const a = cita.atencion;

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack}>Volver a atenciones</BackButton>

      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-800">
          Cita del {cita.fecha} · {cita.hora_inicio.slice(0, 5)}
        </h3>
        <Badge label={est.label} color={est.color} />
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 bg-white p-4">
        <Row label="Médico" value={medicoName(cita.medico)} />
        <Row label="Procedimiento" value={servicioName(cita.servicio)} />
        <Row label="Motivo" value={cita.motivo} />
      </div>

      {a ? (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 bg-white p-4">
          <p className="pb-2 text-sm font-semibold tracking-wide text-slate-400 uppercase">
            Atención
          </p>
          <Row label="Resultado" value={ESTADO_ATENCION[a.estado]} />
          <Row label="Atendió" value={medicoName(a.medico_atendio)} />
          <Row label="Descripción" value={a.descripcion} />
          <Row label="Evolución" value={a.evolucion} />
          <Row label="Firma" value={a.firma} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Esta cita no tiene atención registrada.
        </p>
      )}
    </div>
  );
}
