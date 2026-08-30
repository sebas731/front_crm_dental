import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/citas", label: "Citas", icon: CalendarDays },
  { href: "/agenda", label: "Agenda", icon: CalendarClock },
  { href: "/ventas", label: "Ventas", icon: ReceiptText },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/servicios", label: "Servicios", icon: Briefcase },
];

/** ¿La ruta actual corresponde a este ítem de navegación? */
export function isActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Título de sección para el topbar según la ruta activa. */
export function sectionTitle(pathname: string): string {
  const match = NAV_ITEMS.filter((i) => isActive(i.href, pathname)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return match?.label ?? "DENTAL SAC";
}
