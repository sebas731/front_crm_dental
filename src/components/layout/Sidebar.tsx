"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Stethoscope, X } from "lucide-react";
import { isActive, NAV_ITEMS } from "@/lib/nav";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200/70 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
          <Stethoscope className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold text-slate-800">DENTAL SAC</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {active && (
                <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-600" />
              )}
              <Icon
                className={`h-5 w-5 ${active ? "text-teal-600" : "text-slate-400"}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="m-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-400">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Historia clínica conforme · v1.0</span>
      </div>
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop: fijo */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/70 bg-white md:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile: drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <aside className="absolute top-0 left-0 h-full w-64 bg-white shadow-xl">
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="absolute top-4 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
