import type { LucideIcon } from "lucide-react";

type Tono = "teal" | "cyan" | "emerald" | "amber" | "rose" | "orange";

const TONOS: Record<Tono, string> = {
  teal: "bg-teal-50 text-teal-600",
  cyan: "bg-cyan-100 text-cyan-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-500",
  orange: "bg-orange-100 text-orange-500",
};

export function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  tono = "teal",
}: {
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
  sub?: string;
  tono?: Tono;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONOS[tono]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
