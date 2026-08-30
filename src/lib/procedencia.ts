import type { Procedencia } from "@/types";

export const PROCEDENCIA: Record<Exclude<Procedencia, "">, string> = {
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  GOOGLE: "Google / web",
  RECOMENDADO: "Recomendado",
  FERIA: "Feria / campaña",
  PASO: "Pasó por el local",
  OTRO: "Otro",
};

export function procedenciaLabel(value: Procedencia): string {
  return value ? PROCEDENCIA[value] : "—";
}
