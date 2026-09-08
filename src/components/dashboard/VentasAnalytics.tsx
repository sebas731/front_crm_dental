import { Banknote, CalendarRange, ReceiptText, TrendingUp } from "lucide-react";
import { BarChart, DonutChart } from "@/components/dashboard/Charts";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  cobrosPorProcedencia,
  pagosPorMetodo,
  rankingVendedores,
  resumenVentas,
  ventasPorServicio,
} from "@/lib/analytics";
import type { Paciente, ServicioDental, User, Venta } from "@/types";

const money = (v: number) => `S/ ${v.toFixed(0)}`;

export function VentasAnalytics({
  ventas,
  servicios,
  users,
  pacientes,
}: {
  ventas: Venta[];
  servicios: ServicioDental[];
  users: User[];
  pacientes: Paciente[];
}) {
  const r = resumenVentas(ventas);
  const porServicio = ventasPorServicio(ventas).slice(0, 8);
  const vendedores = rankingVendedores(ventas, users);
  const metodos = pagosPorMetodo(ventas);
  const procedencia = cobrosPorProcedencia(ventas, pacientes);
  const cobradoTotal = metodos.reduce((a, m) => a + m.monto, 0);
  const maxVendido = Math.max(1, ...porServicio.map((s) => s.vendido));
  const servicioName = (id: string) =>
    servicios.find((s) => s.id === id)?.nombre ?? "Servicio";
  const maxVentas = Math.max(1, ...vendedores.map((v) => v.cantidad));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={CalendarRange}
          value={`S/ ${r.ventasMesTotal.toFixed(0)}`}
          label="Ventas del mes"
          sub={`${r.ventasMesCount} ventas`}
          tono="teal"
        />
        <StatCard
          icon={Banknote}
          value={`S/ ${r.pagadoMes.toFixed(0)}`}
          label="Pagado del mes"
          tono="emerald"
        />
        <StatCard
          icon={TrendingUp}
          value={`S/ ${r.ventasHoyTotal.toFixed(0)}`}
          label="Avance del día"
          sub={`${r.ventasHoyCount} ventas hoy`}
          tono="cyan"
        />
        <StatCard
          icon={ReceiptText}
          value={`S/ ${r.pagadoHoy.toFixed(0)}`}
          label="Cobrado hoy"
          tono="amber"
        />
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card title="Acumulado por servicio">
          {porServicio.length === 0 ? (
            <p className="text-sm text-slate-500">Sin ventas.</p>
          ) : (
            <div className="space-y-3">
              {porServicio.map((s) => (
                <div key={s.servicio}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="line-clamp-1 text-slate-600">
                      {servicioName(s.servicio)}{" "}
                      <span className="text-xs text-slate-400">
                        ×{s.cantidad}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-slate-800">
                      S/ {s.vendido.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${(s.vendido / maxVendido) * 100}%` }}
                    />
                    <div
                      className="-mt-2.5 h-2.5 rounded-full bg-emerald-500/70"
                      style={{ width: `${(s.pagado / maxVendido) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Pagado: S/ {s.pagado.toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Ranking de vendedores">
          {vendedores.length === 0 ? (
            <p className="text-sm text-slate-500">Sin ventas.</p>
          ) : (
            <ul className="space-y-3">
              {vendedores.map((v, i) => (
                <li key={String(v.usuario)}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-600">
                        {i + 1}
                      </span>
                      {v.nombre}
                    </span>
                    <span className="text-sm text-slate-500">
                      {v.cantidad} ventas · S/ {v.total.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${(v.cantidad / maxVentas) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card title="Cobros por método">
          <DonutChart
            data={metodos.map((m) => ({ label: m.metodo, value: m.monto }))}
            format={money}
            centro={money(cobradoTotal)}
          />
        </Card>

        <Card title="¿De dónde vienen los pacientes?">
          <BarChart
            data={procedencia.map((p) => ({
              label: `${p.procedencia} (${p.pacientes})`,
              value: p.monto,
            }))}
            format={money}
          />
        </Card>
      </div>
    </div>
  );
}
