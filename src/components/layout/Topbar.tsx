"use client";

import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "@/components/layout/Bell";
import { sectionTitle } from "@/lib/nav";
import { esAdministrativo, ROL_LABEL } from "@/lib/roles";
import type { User } from "@/types";

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-cyan-600",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-orange-500",
];

function initials(user: User): string {
  const base = user.fullname?.trim() || user.username;
  const parts = base.split(/\s+/).filter(Boolean);
  const chars =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return chars.toUpperCase();
}

function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const title = sectionTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenu}
        aria-label="Abrir menú"
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-slate-800 md:text-lg">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {esAdministrativo(user) && <Bell />}
        {user && (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                {user.fullname || user.username}
              </p>
              <p className="text-xs text-slate-400">
                {ROL_LABEL[user.rol] ?? user.rol}
              </p>
            </div>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white ${avatarColor(
                user.username,
              )}`}
            >
              {initials(user)}
            </span>
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
