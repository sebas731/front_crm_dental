"use client";

import { X } from "lucide-react";
import { useState } from "react";

/**
 * Campo de etiquetas tipo Facebook: se escribe y con Enter (o coma) se agrega
 * un chip; se quita con la X o con Backspace. El valor se guarda como texto
 * separado por comas.
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Escribí y Enter para agregar…",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const tags = value
    ? value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const clean = raw.trim();
    if (!clean || tags.includes(clean)) {
      setInput("");
      return;
    }
    onChange([...tags, clean].join(", "));
    setInput("");
  };
  const remove = (t: string) =>
    onChange(tags.filter((x) => x !== t).join(", "));

  return (
    <label className="block space-y-1">
      {label && (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      )}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition-colors focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-200">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-full bg-teal-50 py-0.5 pr-1 pl-2 text-xs font-medium text-teal-700"
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="rounded-full p-0.5 text-teal-500 hover:bg-teal-100 hover:text-teal-800"
              aria-label={`Quitar ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-[7rem] flex-1 border-0 bg-transparent p-0.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          value={input}
          placeholder={tags.length ? "" : placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            } else if (e.key === "Backspace" && !input && tags.length) {
              remove(tags[tags.length - 1]);
            }
          }}
          onBlur={() => input && add(input)}
        />
      </div>
    </label>
  );
}
