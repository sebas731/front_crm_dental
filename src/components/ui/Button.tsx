import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 " +
  "text-sm font-medium shadow-sm transition-all active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700",
  // Relleno blanco siempre (nunca transparente).
  secondary:
    "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
