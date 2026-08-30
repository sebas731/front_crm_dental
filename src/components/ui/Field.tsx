import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm " +
  "text-slate-800 outline-none transition-colors placeholder:text-slate-400 " +
  "focus:border-teal-400 focus:ring-2 focus:ring-teal-200";

const labelClass = "text-sm font-medium text-slate-700";

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className={labelClass}>{label}</span>}
      <input className={`${inputClass} ${className}`} {...props} />
    </label>
  );
}

export function Select({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      {label && <span className={labelClass}>{label}</span>}
      <select className={`${inputClass} ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1">
      {label && <span className={labelClass}>{label}</span>}
      <textarea className={`${inputClass} ${className}`} {...props} />
    </label>
  );
}
