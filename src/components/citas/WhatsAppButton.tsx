import type { Cita, Paciente } from "@/types";

/** Normaliza el teléfono a dígitos (asume Perú si no tiene código país). */
function toWa(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length <= 9 ? `51${digits}` : digits;
}

export function WhatsAppButton({
  cita,
  paciente,
}: {
  cita: Cita;
  paciente?: Paciente;
}) {
  if (!paciente) return null;

  const wa = toWa(paciente.telefono || paciente.numero);
  const nombre = `${paciente.nombres} ${paciente.apellido_paterno}`.trim();
  const texto =
    `Hola ${nombre}, le recordamos su cita en DENTAL SAC el ` +
    `${cita.fecha} a las ${cita.hora_inicio.slice(0, 5)}.`;
  const href = `https://wa.me/${wa}?text=${encodeURIComponent(texto)}`;

  if (!wa) {
    return (
      <span className="text-muted text-xs" title="Paciente sin teléfono">
        sin tel.
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Enviar recordatorio por WhatsApp"
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: "#25D366" }}
    >
      WhatsApp
    </a>
  );
}
