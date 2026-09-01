"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Copy, Lock, Ban } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AdicionalesEditor } from "@/components/ventas/AdicionalesEditor";
import { CuotaRow } from "@/components/ventas/CuotaRow";
import { DescuentosEditor } from "@/components/ventas/DescuentosEditor";
import { GenerarCuotas } from "@/components/ventas/GenerarCuotas";
import { ServiciosEditor } from "@/components/ventas/ServiciosEditor";
import { VentaFactoresReadOnly } from "@/components/ventas/VentaFactoresReadOnly";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { CargaEstado } from "@/components/ui/CargaEstado";
import { Card } from "@/components/ui/Card";
import { ESTADO_VENTA, TIPO_PAGO } from "@/lib/estados";
import { ApiError } from "@/services/api";
import { anularVenta, duplicarVenta, getVenta } from "@/services/ventas";
import { listPacientes } from "@/services/pacientes";
import { listServicios } from "@/services/citas";
import type { Paciente, ServicioDental, Venta } from "@/types";

export default function VentaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<ServicioDental[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<"notfound" | "server" | null>(
    null,
  );
  const [accion, setAccion] = useState(false);

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
      .catch((err) => {
        if (!active) return;
        setErrorCarga(
          err instanceof ApiError && err.status === 404 ? "notfound" : "server",
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function reload() {
    setVenta(await getVenta(id));
  }

  async function handleAnular() {
    if (!venta) return;
    const motivo = prompt(
      "Motivo de la anulación (opcional, p. ej. devolución):",
      "",
    );
    if (motivo === null) return; // canceló el diálogo
    setAccion(true);
    try {
      const v = await anularVenta(venta.id, motivo);
      setVenta(v);
    } finally {
      setAccion(false);
    }
  }

  async function handleDuplicar() {
    if (!venta) return;
    setAccion(true);
    try {
      const copia = await duplicarVenta(venta.id);
      router.push(`/ventas/${copia.id}`);
    } finally {
      setAccion(false);
    }
  }

  const pacienteName = (pid: string) => {
    const p = pacientes.find((x) => x.id === pid);
    return p ? `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno}` : pid;
  };
  const servicioName = (sid: string) =>
    servicios.find((x) => x.id === sid)?.nombre ?? sid;

  if (loading || errorCarga || !venta) {
    return (
      <CargaEstado
        estado={
          loading ? "cargando" : errorCarga === "server" ? "server" : "notfound"
        }
        entidad="Venta"
        volverHref="/ventas"
        volverLabel="Volver a ventas"
      />
    );
  }

  const est = ESTADO_VENTA[venta.estado];
  const anulada = venta.estado === "ANULADO";
  const bloqueada = !venta.editable;

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <BackButton href="/ventas">Ventas</BackButton>
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          {venta.numero || "Venta"}
        </h1>
        <Badge label={est.label} color={est.color} />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            disabled={accion}
            onClick={handleDuplicar}
            title="Crear una copia editable para corregir esta venta"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicar
          </Button>
          {!anulada && (
            <Button
              variant="danger"
              className="px-3 py-1.5 text-xs"
              disabled={accion}
              onClick={handleAnular}
              title="Anular la venta (devoluciones / errores)"
            >
              <Ban className="h-3.5 w-3.5" /> Anular
            </Button>
          )}
        </div>
      </div>

      {bloqueada && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {anulada
              ? "Esta venta está anulada. Sus factores no se pueden modificar; queda solo como registro histórico."
              : "Esta venta tiene pagos validados, por lo que sus servicios, adicionales y descuentos quedaron congelados. Para corregirla, usá “Duplicar” y luego anulá esta. Podés seguir cobrando las cuotas pendientes."}
          </p>
        </div>
      )}

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
          {bloqueada ? (
            <VentaFactoresReadOnly
              venta={venta}
              servicioName={servicioName}
            />
          ) : (
            <>
              <Card title="Servicios ofrecidos">
                <ServiciosEditor
                  venta={venta}
                  servicios={servicios}
                  servicioName={servicioName}
                  onChanged={reload}
                />
              </Card>

              <Card title="Adicionales / materiales">
                <AdicionalesEditor venta={venta} onChanged={reload} />
              </Card>

              <Card title="Descuentos / promociones">
                <DescuentosEditor venta={venta} onChanged={reload} />
              </Card>
            </>
          )}
        </div>

        <Card title="Cronograma de cuotas">
          {venta.cuotas.length === 0 ? (
            anulada ? (
              <p className="text-sm text-slate-400">
                Venta anulada, sin cuotas.
              </p>
            ) : (
              <GenerarCuotas venta={venta} onChanged={reload} />
            )
          ) : (
            <div className="space-y-3">
              {venta.cuotas.map((c) => (
                <CuotaRow
                  key={c.id}
                  cuota={c}
                  onChanged={reload}
                  readOnly={anulada}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
