import type { ReactNode } from "react";

export function Card({
  title,
  actions,
  children,
  className = "",
  compact = false,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/70 bg-white shadow-sm ${
        compact ? "p-4" : "p-5"
      } ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
              {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
