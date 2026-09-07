"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { puedeCrearCitas } from "@/lib/roles";
import type { Cita, Paciente } from "@/types";

/** Normaliza el teléfono a dígitos (asume Perú si no tiene código país). */
function toWa(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length <= 9 ? `51${digits}` : digits;
}

const CLINICA = "DENTAL STUDIO";

// Plantillas rápidas: reciben nombre, fecha y hora ya formateados.
const PLANTILLAS: {
  label: string;
  texto: (n: string, f: string, h: string) => string;
}[] = [
  {
    label: "Recordatorio",
    texto: (n, f, h) =>
      `Hola ${n}, le recordamos su cita en ${CLINICA} el ${f} a las ${h}. ¡Le esperamos!`,
  },
  {
    label: "Confirmación",
    texto: (n, f, h) =>
      `Hola ${n}, ¿nos confirma su cita del ${f} a las ${h} en ${CLINICA}? Responda SÍ para confirmar.`,
  },
  {
    label: "Reprogramar",
    texto: (n, f, h) =>
      `Hola ${n}, necesitamos reprogramar su cita del ${f} (${h}). ¿Qué día le queda cómodo?`,
  },
  {
    label: "Agradecimiento",
    texto: (n) =>
      `Hola ${n}, gracias por su visita a ${CLINICA}. Ante cualquier consulta, quedamos a su disposición.`,
  },
];

function fechaBonita(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function WhatsAppButton({
  cita,
  paciente,
}: {
  cita: Cita;
  paciente?: Paciente;
}) {
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");

  // Solo administrativos y asistentes envían WhatsApp; el médico no.
  if (!puedeCrearCitas(user)) return null;

  const wa = paciente
    ? toWa(paciente.whatsapp || paciente.telefono || paciente.numero)
    : "";
  const nombre = paciente
    ? `${paciente.nombres} ${paciente.apellido_paterno}`.trim()
    : "";
  const fecha = fechaBonita(cita.fecha);
  const hora = cita.hora_inicio.slice(0, 5);

  function abrir() {
    // Precarga la plantilla de recordatorio al abrir la ventana.
    setTexto(PLANTILLAS[0].texto(nombre, fecha, hora));
    setAbierto(true);
  }

  if (!paciente) return null;

  if (!wa) {
    return (
      <span className="text-muted text-xs" title="Paciente sin teléfono">
        sin tel.
      </span>
    );
  }

  function enviar() {
    const href = `https://wa.me/${wa}?text=${encodeURIComponent(texto)}`;
    window.open(href, "_blank", "noopener,noreferrer");
    setAbierto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        title="Enviar mensaje por WhatsApp"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Mensaje de WhatsApp
                </h3>
                <p className="text-xs text-slate-500">
                  Para {nombre} · +{wa}
                </p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setTexto(p.texto(nombre, fecha, hora))}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
              placeholder="Escribí el mensaje…"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button
                onClick={enviar}
                disabled={!texto.trim()}
                className="gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                Abrir WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
