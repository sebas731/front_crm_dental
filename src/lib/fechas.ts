/**
 * Fechas en hora LOCAL (no UTC). Usar estas en vez de toISOString() para
 * "hoy"/"este mes": toISOString() devuelve UTC y, de noche, corre el día —
 * ventas de la noche podían desaparecer de "cobrado hoy" y duplicarse al día
 * siguiente.
 */
export function hoyLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function mesLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Edad en años a partir de una fecha de nacimiento "YYYY-MM-DD". */
export function edadDesde(fechaNacimiento: string | null | undefined): number | null {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento + "T00:00:00");
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad >= 0 && edad < 130 ? edad : null;
}
