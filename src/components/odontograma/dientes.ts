/** Filas de piezas dentales en numeración FDI (como en la ficha). */
export const FILAS_DIENTES: string[][] = [
  // Permanentes superiores
  [
    "18",
    "17",
    "16",
    "15",
    "14",
    "13",
    "12",
    "11",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
  ],
  // Temporales superiores
  ["55", "54", "53", "52", "51", "61", "62", "63", "64", "65"],
  // Temporales inferiores
  ["85", "84", "83", "82", "81", "71", "72", "73", "74", "75"],
  // Permanentes inferiores
  [
    "48",
    "47",
    "46",
    "45",
    "44",
    "43",
    "42",
    "41",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
  ],
];

export const ESTADOS_DIENTE: Record<string, { label: string; color: string }> =
  {
    "": { label: "Sano", color: "#ffffff" },
    CARIES: { label: "Caries", color: "#f43f5e" },
    OBTURADO: { label: "Obturado", color: "#0891b2" },
    CORONA: { label: "Corona", color: "#f59e0b" },
    AUSENTE: { label: "Ausente", color: "#64748b" },
    TRATAMIENTO: { label: "En tratamiento", color: "#10b981" },
  };
