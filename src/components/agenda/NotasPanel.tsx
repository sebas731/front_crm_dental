"use client";

import { StickyNote, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import type { NotaAgenda } from "@/types";

export function NotasPanel({
  fecha,
  hora,
  notas,
  onClose,
  onCreate,
  onDelete,
}: {
  fecha: string;
  hora: string; // "HH:MM"
  notas: NotaAgenda[];
  onClose: () => void;
  onCreate: (texto: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);

  async function agregar() {
    if (!texto.trim()) return;
    setBusy(true);
    try {
      await onCreate(texto.trim());
      setTexto("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-semibold text-slate-800">Anotaciones</p>
              <p className="text-xs text-slate-400">
                {fecha} · {hora}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {notas.length === 0 ? (
            <p className="text-sm text-slate-400">Sin notas en esta franja.</p>
          ) : (
            notas.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-slate-200/70 bg-amber-50/40 p-3"
              >
                <p className="text-sm whitespace-pre-wrap text-slate-700">
                  {n.texto}
                </p>
                <button
                  onClick={() => onDelete(n.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
                  aria-label="Eliminar nota"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 border-t border-slate-200/70 p-4">
          <Textarea
            label="Nueva nota"
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí una anotación para esta franja…"
          />
          <Button
            className="w-full"
            onClick={agregar}
            disabled={busy || !texto.trim()}
          >
            {busy ? "Guardando…" : "Agregar nota"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
