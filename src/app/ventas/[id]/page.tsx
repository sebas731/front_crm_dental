"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CuotaRow } from "@/components/ventas/CuotaRow";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { Card } from "@/components/ui/Card";
import { ESTADO_VENTA, TIPO_PAGO } from "@/lib/estados";
import { getVenta } from "@/services/ventas";
import { listPacientes } from "@/services/pacientes";
import { listServicios } from "@/services/citas";
import type { Paciente, ServicioDental, Venta } from "@/types";

export default function VentaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [venta, setVenta] = useState<Venta | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getVenta(id), listPacientes(), listServicios()])
      .then(([v, p, s]) => {
        if (!active) return;
        setVenta(v);
        setPacientes(p.results);
        setServicios(s.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function reload() {
    setVenta(await getVenta(id));
  }

  const pacienteName = (pid: string) => {
    const p = pacientes.find((x) => x.id === pid);
    return p ? `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno}` : pid;
  };
  const servicioName = (sid: string) =>
    servicios.find((x) => x.id === sid)?.nombre ?? sid;

  if (loading) {
    return (
      <AppShell>
        <p className="text-slate-500">Cargando…</p>
      </AppShell>
    );
  }
  if (!venta) {
    return (
      <AppShell>
        <p className="text-slate-500">Venta no encontrada.</p>
      </AppShell>
    );
  }

  const est = ESTADO_VENTA[venta.estado];

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/ventas">Ventas</BackButton>
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          {venta.numero || "Venta"}
        </h1>
        <Badge label={est.label} color={est.color} />
      </div>

      <div className="mb-6 grid gap-2 rounded-2xl border border-slate-200/70 bg-white p-4 text-sm shadow-sm sm:grid-cols-4">
        <div>
          <span className="text-slate-400">Paciente</span>
          <p className="font-medium text-slate-700">
            {pacienteName(venta.paciente)}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Tipo</span>
          <p className="font-medium text-slate-700">
            {TIPO_PAGO[venta.tipo_pago]}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Total</span>
          <p className="font-medium text-slate-700">S/ {venta.total}</p>
        </div>
        <div>
          <span className="text-slate-400">Saldo</span>
          <p className="font-medium text-amber-600">S/ {venta.saldo}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card title="Servicios">
            {venta.servicios.length === 0 ? (
              <p className="text-sm text-slate-500">Sin servicios.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {venta.servicios.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>
                      {servicioName(s.servicio)} ×{s.cantidad}
                    </span>
                    <span className="font-medium">S/ {s.subtotal}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {venta.adicionales.length > 0 && (
            <Card title="Adicionales">
              <ul className="space-y-1 text-sm">
                {venta.adicionales.map((a) => (
                  <li key={a.id} className="flex justify-between">
                    <span>
                      {a.nombre}{" "}
                      <span className="text-slate-400">({a.tipo})</span> ×
                      {a.cantidad}
                    </span>
                    <span className="font-medium">S/ {a.subtotal}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {venta.descuentos.length > 0 && (
            <Card title="Descuentos">
              <ul className="space-y-1 text-sm">
                {venta.descuentos.map((d) => (
                  <li key={d.id} className="flex justify-between">
                    <span>{d.descripcion || "Descuento"}</span>
                    <span className="font-medium text-rose-500">
                      {d.tipo === "PORCENTAJE"
                        ? `${d.valor}%`
                        : `S/ ${d.valor}`}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card title="Cronograma de cuotas">
          <div className="space-y-3">
            {venta.cuotas.length === 0 ? (
              <p className="text-sm text-slate-500">Sin cuotas.</p>
            ) : (
              venta.cuotas.map((c) => (
                <CuotaRow key={c.id} cuota={c} onChanged={reload} />
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
