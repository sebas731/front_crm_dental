"use client";

import { Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function FileInput({
  label = "Archivo",
  accept,
  onChange,
}: {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
}) {
  const [name, setName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className="block space-y-1">
      {label && (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 active:scale-[0.98]"
        >
          <Upload className="h-4 w-4" />
          Elegir archivo
        </button>
        <span className="flex min-w-0 items-center gap-1 text-sm text-slate-500">
          {name ? (
            <>
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-teal-600" />
              <span className="truncate">{name}</span>
            </>
          ) : (
            "Ningún archivo elegido"
          )}
        </span>
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setName(f?.name ?? null);
          onChange(f);
        }}
      />
    </label>
  );
}
