"use client";

// Paleta armónica con la marca (teal → cyan → verde → ámbar → índigo…).
export const PALETA = [
  "#0d9488",
  "#0891b2",
  "#22c55e",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
  "#ef4444",
];

export interface Punto {
  label: string;
  value: number;
  color?: string;
}

/** Barras horizontales simples (sin librerías). */
export function BarChart({
  data,
  format = (n) => String(n),
}: {
  data: Punto[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0)
    return <p className="text-sm text-slate-400">Sin datos.</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="mb-0.5 flex justify-between text-xs">
            <span className="text-slate-600">{d.label}</span>
            <span className="font-medium text-slate-700">
              {format(d.value)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color ?? PALETA[i % PALETA.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Gráfica de dona (SVG) con leyenda. */
export function DonutChart({
  data,
  format = (n) => String(n),
  centro,
}: {
  data: Punto[];
  format?: (n: number) => string;
  centro?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const R = 60;
  const SW = 22;
  const C = 2 * Math.PI * R;

  if (total === 0)
    return <p className="text-sm text-slate-400">Sin datos.</p>;

  // Segmentos con su offset acumulado precalculado (sin mutar en el render).
  const segmentos = data.map((d, i) => ({
    label: d.label,
    color: d.color ?? PALETA[i % PALETA.length],
    dash: (d.value / total) * C,
    offset: data
      .slice(0, i)
      .reduce((a, x) => a + (x.value / total) * C, 0),
  }));

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={150} height={150} viewBox="0 0 150 150" className="shrink-0">
        <g transform="rotate(-90 75 75)">
          <circle
            cx={75}
            cy={75}
            r={R}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={SW}
          />
          {segmentos.map((s) => (
            <circle
              key={s.label}
              cx={75}
              cy={75}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={SW}
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
        {centro && (
          <text
            x={75}
            y={80}
            textAnchor="middle"
            className="fill-slate-700 text-lg font-semibold"
          >
            {centro}
          </text>
        )}
      </svg>

      <ul className="flex-1 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.color ?? PALETA[i % PALETA.length] }}
              />
              {d.label}
            </span>
            <span className="font-medium text-slate-700">
              {format(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
