"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { FileInput } from "@/components/ui/FileInput";
import { eliminarDocumento, subirDocumento } from "@/services/historia";
import type { DocumentoHC, DocumentoTipo } from "@/types";

const TIPOS: Record<DocumentoTipo, string> = {
  DNI: "DNI / Identidad",
  RADIOGRAFIA: "Radiografía",
  CONSENTIMIENTO: "Consentimiento",
  RECETA: "Receta",
  RESULTADO: "Resultado lab.",
  FOTOGRAFIA: "Fotografía",
  OTRO: "Otro",
};

export function DocumentosPanel({
  historiaId,
  documentos,
  onChange,
}: {
  historiaId: string;
  documentos: DocumentoHC[];
  onChange: () => void | Promise<void>;
}) {
  const [tipo, setTipo] = useState<DocumentoTipo>("RADIOGRAFIA");
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!archivo) return;
    setError(null);
    setSaving(true);
    try {
      await subirDocumento(historiaId, {
        tipo,
        titulo,
        descripcion: "",
        archivo,
      });
      setTitulo("");
      setArchivo(null);
      setFileKey((k) => k + 1);
      await onChange();
    } catch {
      setError("No se pudo subir el documento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await eliminarDocumento(id);
    await onChange();
  }

  return (
    <div className="space-y-3">
      {documentos.length === 0 ? (
        <p className="text-muted text-sm">Sin documentos.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {documentos.map((d) => (
            <li
              key={d.id}
              className="border-border flex items-center justify-between rounded-md border px-3 py-2"
            >
              <a
                href={d.archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {TIPOS[d.tipo]} · {d.titulo || "archivo"}
              </a>
              <Button
                variant="danger"
                className="px-3 py-1.5 text-xs"
                onClick={() => handleDelete(d.id)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleUpload}
        className="border-border grid grid-cols-2 items-end gap-2 border-t pt-3"
      >
        <Select
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as DocumentoTipo)}
        >
          {Object.entries(TIPOS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Input
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <div className="col-span-2">
          <FileInput key={fileKey} label="Archivo" onChange={setArchivo} />
        </div>
        {error && <p className="text-danger col-span-2 text-sm">{error}</p>}
        <div className="col-span-2">
          <Button type="submit" disabled={saving || !archivo}>
            {saving ? "Subiendo…" : "Subir documento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
