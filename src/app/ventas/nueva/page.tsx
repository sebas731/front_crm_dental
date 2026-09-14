"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { PacientePicker } from "@/components/ui/PacientePicker";
import { ServicioSelect } from "@/components/servicios/ServicioSelect";
import { generarCuotas, type Frecuencia } from "@/lib/cuotas";
import { listAllServicios } from "@/services/citas";
import { listAllPacientes } from "@/services/pacientes";
import {
  addAdicional,
  addDescuento,
  addVentaServicio,
  createCuota,
  createVenta,
  deleteVenta,
} from "@/services/ventas";
import { mensajeError } from "@/lib/apiError";
import type { Paciente, ServicioDental, TipoPago } from "@/types";

interface ServRow {
  servicio: string;
  cantidad: number;
  precio: string;
}
interface AdicRow {
  nombre: string;
  tipo: string;
  valor: string;
  cantidad: number;
}
interface DescRow {
  descripcion: string;
  tipo: "MONTO" | "PORCENTAJE";
  valor: string;
}

const hoy = new Date().toISOString().slice(0, 10);

export default function NuevaVentaPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [paciente, setPaciente] = useState("");
  const [servRows, setServRows] = useState<ServRow[]>([]);
  const [adicRows, setAdicRows] = useState<AdicRow[]>([]);
  const [descRows, setDescRows] = useState<DescRow[]>([]);
  const [tipoPago, setTipoPago] = useState<TipoPago>("CONTADO");
  const [nCuotas, setNCuotas] = useState(2);
  const [primeraFecha, setPrimeraFecha] = useState(hoy);
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("MENSUAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listAllPacientes(), listAllServicios()])
      .then(([p, s]) => {
        if (!active) return;
        setPacientes(p);
        setServicios(s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const num = (v: string) => Number(v) || 0;
  const subServicios = servRows.reduce(
    (a, r) => a + num(r.precio) * r.cantidad,
    0,
  );
  const subAdicionales = adicRows.reduce(
    (a, r) => a + num(r.valor) * r.cantidad,
    0,
  );
  const base = subServicios + subAdicionales;
  const totalDesc = descRows.reduce(
    (a, r) =>
      a +
      (r.tipo === "PORCENTAJE" ? (base * num(r.valor)) / 100 : num(r.valor)),
    0,
  );
  const total = Math.max(0, base - totalDesc);

  const puedeGuardar =
    !!paciente &&
    (servRows.some((r) => r.servicio) || adicRows.some((r) => r.nombre)) &&
    total > 0;

  const cuotasPreview = useMemo(
    () =>
      generarCuotas(total, {
        n: tipoPago === "CONTADO" ? 1 : nCuotas,
        primeraFecha,
        frecuencia,
      }),
    [total, tipoPago, nCuotas, primeraFecha, frecuencia],
  );

  async function handleSubmit() {
    setError(null);
    if (!paciente) return setError("Elegí un paciente.");
    if (servRows.length === 0 && adicRows.length === 0)
      return setError("Agregá al menos un servicio o adicional.");
    setSaving(true);
    // Si algo falla después de crear la venta, la borramos (rollback) para no
    // dejar una venta parcial/huérfana. El número lo genera el backend.
    let ventaId: string | null = null;
    try {
      const venta = await createVenta({
        paciente,
        tipo_pago: tipoPago,
        total: total.toFixed(2),
      });
      ventaId = venta.id;
      for (const r of servRows.filter((x) => x.servicio)) {
        await addVentaServicio({
          venta: venta.id,
          servicio: r.servicio,
          cantidad: r.cantidad,
          precio_unitario: num(r.precio).toFixed(2),
        });
      }
      for (const r of adicRows.filter((x) => x.nombre)) {
        await addAdicional({
          venta: venta.id,
          nombre: r.nombre,
          tipo: r.tipo,
          valor: num(r.valor).toFixed(2),
          cantidad: r.cantidad,
        });
      }
      for (const r of descRows) {
        await addDescuento({
          venta: venta.id,
          descripcion: r.descripcion,
          tipo: r.tipo,
          valor: num(r.valor).toFixed(2),
        });
      }
      for (const c of cuotasPreview) {
        await createCuota({
          venta: venta.id,
          numero: c.numero,
          monto: c.monto,
          fecha_limite: c.fecha_limite,
        });
      }
      router.push(`/ventas/${venta.id}`);
    } catch (err) {
      if (ventaId) await deleteVenta(ventaId).catch(() => {});
      setError(mensajeError(err, "No se pudo registrar la venta."));
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/ventas">Ventas</BackButton>
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Nueva venta
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Paciente">
            <PacientePicker
              label=""
              pacientes={pacientes}
              value={paciente}
              onChange={setPaciente}
              allowTodos={false}
              placeholder="Buscar paciente por nombre o DNI…"
            />
          </Card>

          <Card
            title="Servicios"
            actions={
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() =>
                  setServRows((r) => [
                    ...r,
                    { servicio: "", cantidad: 1, precio: "" },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            }
          >
            <div className="space-y-2">
              {servRows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-6">
                    <ServicioSelect
                      label=""
                      servicios={servicios}
                      value={r.servicio}
                      onChange={(v) => {
                        const s = servicios.find((x) => x.id === v);
                        setServRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  servicio: v,
                                  precio: s?.precio ?? x.precio,
                                }
                              : x,
                          ),
                        );
                      }}
                    />
                  </div>
                  <Input
                    label="Cant."
                    type="number"
                    min="1"
                    className="col-span-2"
                    value={r.cantidad}
                    onChange={(e) =>
                      setServRows((rows) =>
                        rows.map((x, j) =>
                          j === i
                            ? { ...x, cantidad: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    label="Precio"
                    type="number"
                    step="0.01"
                    min="0"
                    className="col-span-3"
                    value={r.precio}
                    onChange={(e) =>
                      setServRows((rows) =>
                        rows.map((x, j) =>
                          j === i ? { ...x, precio: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      setServRows((rows) => rows.filter((_, j) => j !== i))
                    }
                    className="col-span-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {servRows.length === 0 && (
                <p className="text-sm text-slate-400">Sin servicios.</p>
              )}
            </div>
          </Card>

          <Card
            title="Adicionales"
            actions={
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() =>
                  setAdicRows((r) => [
                    ...r,
                    { nombre: "", tipo: "Material", valor: "", cantidad: 1 },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            }
          >
            <div className="space-y-2">
              {adicRows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 items-end gap-2">
                  <Input
                    label="Nombre"
                    className="col-span-4"
                    value={r.nombre}
                    onChange={(e) =>
                      setAdicRows((rows) =>
                        rows.map((x, j) =>
                          j === i ? { ...x, nombre: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    label="Tipo"
                    className="col-span-3"
                    value={r.tipo}
                    onChange={(e) =>
                      setAdicRows((rows) =>
                        rows.map((x, j) =>
                          j === i ? { ...x, tipo: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    label="Cant."
                    type="number"
                    min="1"
                    className="col-span-2"
                    value={r.cantidad}
                    onChange={(e) =>
                      setAdicRows((rows) =>
                        rows.map((x, j) =>
                          j === i
                            ? { ...x, cantidad: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    label="Valor"
                    type="number"
                    step="0.01"
                    min="0"
                    className="col-span-2"
                    value={r.valor}
                    onChange={(e) =>
                      setAdicRows((rows) =>
                        rows.map((x, j) =>
                          j === i ? { ...x, valor: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      setAdicRows((rows) => rows.filter((_, j) => j !== i))
                    }
                    className="col-span-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {adicRows.length === 0 && (
                <p className="text-sm text-slate-400">Sin adicionales.</p>
              )}
            </div>
          </Card>

          <Card
            title="Descuentos"
            actions={
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() =>
                  setDescRows((r) => [
                    ...r,
                    { descripcion: "", tipo: "MONTO", valor: "" },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            }
          >
            <div className="space-y-2">
              {descRows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 items-end gap-2">
                  <Input
                    label="Descripción"
                    className="col-span-6"
                    value={r.descripcion}
                    onChange={(e) =>
                      setDescRows((rows) =>
                        rows.map((x, j) =>
                          j === i ? { ...x, descripcion: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Select
                    label="Tipo"
                    className="col-span-3"
                    value={r.tipo}
                    onChange={(e) =>
                      setDescRows((rows) =>
                        rows.map((x, j) =>
                          j === i
                            ? { ...x, tipo: e.target.value as DescRow["tipo"] }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="MONTO">Monto</option>
                    <option value="PORCENTAJE">%</option>
                  </Select>
                  <Input
                    label="Valor"
                    type="number"
                    step="0.01"
                    min="0"
                    className="col-span-2"
                    value={r.valor}
                    onChange={(e) =>
                      setDescRows((rows) =>
                        rows.map((x, j) =>
                          j === i ? { ...x, valor: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      setDescRows((rows) => rows.filter((_, j) => j !== i))
                    }
                    className="col-span-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {descRows.length === 0 && (
                <p className="text-sm text-slate-400">Sin descuentos.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Resumen + cuotas */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card title="Resumen">
            <div className="space-y-1 text-sm">
              <Fila label="Servicios" valor={subServicios} />
              <Fila label="Adicionales" valor={subAdicionales} />
              <Fila label="Descuentos" valor={-totalDesc} />
              <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-800">
                <span>Total</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card title="Forma de pago">
            <div className="space-y-3">
              <Select
                label="Tipo de pago"
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value as TipoPago)}
              >
                <option value="CONTADO">Contado</option>
                <option value="CUOTAS">Cuotas</option>
              </Select>
              {tipoPago === "CUOTAS" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="N.º cuotas"
                    type="number"
                    min="1"
                    value={nCuotas}
                    onChange={(e) => setNCuotas(Number(e.target.value))}
                  />
                  <Select
                    label="Frecuencia"
                    value={frecuencia}
                    onChange={(e) =>
                      setFrecuencia(e.target.value as Frecuencia)
                    }
                  >
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINCENAL">Quincenal</option>
                    <option value="MENSUAL">Mensual</option>
                  </Select>
                </div>
              )}
              <Input
                label={tipoPago === "CONTADO" ? "Fecha" : "Primera cuota"}
                type="date"
                value={primeraFecha}
                onChange={(e) => setPrimeraFecha(e.target.value)}
              />
              <div className="rounded-xl border border-slate-200/70 p-2">
                <p className="mb-1 text-xs font-medium text-slate-400">
                  Cronograma
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {cuotasPreview.map((c) => (
                    <li key={c.numero} className="flex justify-between">
                      <span>
                        Cuota {c.numero} · {c.fecha_limite}
                      </span>
                      <span className="font-medium">S/ {c.monto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={saving || !puedeGuardar}
          >
            {saving ? "Registrando…" : "Registrar venta"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Fila({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>S/ {valor.toFixed(2)}</span>
    </div>
  );
}
