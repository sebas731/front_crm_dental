"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ESTADO_VENTA, TIPO_PAGO } from "@/lib/estados";
import { Pagination } from "@/components/ui/Pagination";
import { listVentas } from "@/services/ventas";
import { listAllPacientes } from "@/services/pacientes";
import type { Paciente, Venta } from "@/types";

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Los pacientes se traen completos (solo para resolver el nombre en la
  // tabla); las ventas van paginadas de a 15.
  useEffect(() => {
    let active = true;
    listAllPacientes()
      .then((p) => {
        if (active) setPacientes(p);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    listVentas({ page })
      .then((v) => {
        if (!active) return;
        setVentas(v.results);
        setCount(v.count);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page]);

  function goPage(p: number) {
    setLoading(true);
    setPage(p);
  }

  const pacienteName = (id: string) => {
    const p = pacientes.find((x) => x.id === id);
    return p ? `${p.nombres} ${p.apellido_paterno}` : id;
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
          Ventas ({count})
        </h1>
        <Link href="/ventas/nueva">
          <Button>Nueva venta</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">N.º</th>
              <th className="px-4 py-2 font-medium">Paciente</th>
              <th className="px-4 py-2 font-medium">Tipo</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Saldo</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  Cargando…
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  Sin ventas.
                </td>
              </tr>
            ) : (
              ventas.map((v) => {
                const est = ESTADO_VENTA[v.estado];
                return (
                  <tr key={v.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{v.numero || "—"}</td>
                    <td className="px-4 py-2">{pacienteName(v.paciente)}</td>
                    <td className="px-4 py-2">{TIPO_PAGO[v.tipo_pago]}</td>
                    <td className="px-4 py-2">S/ {v.total}</td>
                    <td className="px-4 py-2">S/ {v.saldo}</td>
                    <td className="px-4 py-2">
                      <Badge label={est.label} color={est.color} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/ventas/${v.id}`}
                        className="text-sm font-medium text-teal-600 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && <Pagination page={page} count={count} onPage={goPage} />}
    </AppShell>
  );
}
