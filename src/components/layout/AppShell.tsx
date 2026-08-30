"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

/**
 * Layout de la app autenticada: sidebar + topbar + contenido.
 * Redirige a /login cuando no hay usuario.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar open={drawer} onClose={() => setDrawer(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setDrawer(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
