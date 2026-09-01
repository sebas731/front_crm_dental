import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@/types";
import { esAdministrativo } from "@/lib/roles";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  soloAdmin?: boolean; // solo visible para roles administrativos
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/citas", label: "Citas", icon: CalendarDays },
  { href: "/agenda", label: "Agenda", icon: CalendarClock },
  { href: "/ventas", label: "Ventas", icon: ReceiptText, soloAdmin: true },
  { href: "/pagos", label: "Pagos", icon: CreditCard, soloAdmin: true },
  {
    href: "/cronograma",
    label: "Cronograma",
    icon: CalendarRange,
    soloAdmin: true,
  },
  { href: "/servicios", label: "Servicios", icon: Briefcase, soloAdmin: true },
  {
    href: "/medicos",
    label: "Médicos",
    icon: Stethoscope,
    soloAdmin: true,
  },
];

/** Ítems de navegación visibles para el usuario según su rol. */
export function navItemsFor(user: User | null): NavItem[] {
  const admin = esAdministrativo(user);
  return NAV_ITEMS.filter((i) => !i.soloAdmin || admin);
}

/** ¿El usuario tiene permiso para ver esta ruta? */
export function puedeVerRuta(pathname: string, user: User | null): boolean {
  if (esAdministrativo(user)) return true;
  const item = NAV_ITEMS.filter((i) => isActive(i.href, pathname)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return !item?.soloAdmin;
}

/** ¿La ruta actual corresponde a este ítem de navegación? */
export function isActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Título de sección para el topbar según la ruta activa. */
export function sectionTitle(pathname: string): string {
  const match = NAV_ITEMS.filter((i) => isActive(i.href, pathname)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return match?.label ?? "DENTAL STUDIO";
}
