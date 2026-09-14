"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import {
  createServicio,
  deleteServicio,
  listAllServicios,
} from "@/services/citas";
import type { ServicioDental } from "@/types";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [padre, setPadre] = useState(""); // "" => categoría nueva
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listAllServicios()
      .then((r) => {
        if (!active) return;
        setServicios(r);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function reload() {
    setServicios(await listAllServicios());
  }

  const categorias = servicios.filter((s) => !s.padre);
  const hijosDe = (id: string) => servicios.filter((s) => s.padre === id);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createServicio({
        nombre,
        padre: padre || null,
        precio: precio || "0",
        duracion_minutos: Number(duracion),
      });
      setNombre("");
      setPrecio("");
      setDuracion("30");
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, esCategoria: boolean) {
    const msg = esCategoria
      ? "¿Eliminar la categoría y todos sus subservicios?"
      : "¿Eliminar este servicio?";
    if (!confirm(msg)) return;
    await deleteServicio(id);
    await reload();
  }

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Servicios
        </h1>
        <p className="text-sm text-slate-500">
          Categorías y subservicios / tratamientos
        </p>
      </div>

      <Card title="Nuevo servicio" className="mb-6">
        <form
          onSubmit={handleCreate}
          className="grid items-end gap-3 sm:grid-cols-4"
        >
          <Input
            label="Nombre"
            className="sm:col-span-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <Select
            label="Categoría"
            value={padre}
            onChange={(e) => setPadre(e.target.value)}
          >
            <option value="">— Es una categoría nueva —</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Input
            label="Precio (S/)"
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <Input
            label="Duración (min)"
            type="number"
            min="1"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
          />
          <div className="sm:col-span-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="space-y-4">
          {categorias.map((cat) => {
            const hijos = hijosDe(cat.id);
            return (
              <Card
                key={cat.id}
                title={cat.nombre}
                actions={
                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => handleDelete(cat.id, true)}
                  >
                    Eliminar categoría
                  </Button>
                }
              >
                {hijos.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Sin subservicios todavía.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200/70">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-400">
                        <tr>
                          <th className="px-4 py-2 font-medium">Subservicio</th>
                          <th className="px-4 py-2 font-medium">Precio</th>
                          <th className="px-4 py-2 font-medium">Duración</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {hijos.map((s) => (
                          <tr key={s.id} className="border-t border-slate-100">
                            <td className="px-4 py-2">{s.nombre}</td>
                            <td className="px-4 py-2">S/ {s.precio}</td>
                            <td className="px-4 py-2">
                              {s.duracion_minutos} min
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                variant="danger"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => handleDelete(s.id, false)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
