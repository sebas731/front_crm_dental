"use client";

/**
 * Selector de hora en formato 12h con AM/PM (para evitar confundir la mañana
 * con la tarde al registrar). Trabaja con un valor "HH:MM" en formato 24h,
 * que es lo que espera el backend.
 */
export function HoraAmPm({
  label,
  value,
  onChange,
  required,
  className,
}: {
  label?: string;
  value: string; // "HH:MM" (24h) o ""
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  const [hhRaw, mmRaw] = value ? value.split(":") : ["", ""];
  const H = hhRaw === "" ? null : parseInt(hhRaw, 10);
  const meridiano = H === null ? "AM" : H < 12 ? "AM" : "PM";
  const hora12 = H === null ? "" : H % 12 === 0 ? 12 : H % 12;
  const minuto = mmRaw || "00";

  function emitir(h12: string, min: string, ampm: string) {
    if (h12 === "") {
      onChange("");
      return;
    }
    let h24 = Number(h12) % 12;
    if (ampm === "PM") h24 += 12;
    onChange(`${String(h24).padStart(2, "0")}:${min}`);
  }

  const selCls =
    "rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-200";

  return (
    <label className={`block space-y-1 ${className ?? ""}`}>
      {label && (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      )}
      <div className="flex items-center gap-1.5">
        <select
          className={selCls}
          value={hora12}
          required={required}
          onChange={(e) => emitir(e.target.value, minuto, meridiano)}
        >
          <option value="">--</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-slate-400">:</span>
        <select
          className={selCls}
          value={minuto}
          onChange={(e) =>
            emitir(String(hora12 || ""), e.target.value, meridiano)
          }
        >
          {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")).map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ),
          )}
        </select>
        <select
          className={selCls}
          value={meridiano}
          onChange={(e) =>
            emitir(String(hora12 || ""), minuto, e.target.value)
          }
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </label>
  );
}
