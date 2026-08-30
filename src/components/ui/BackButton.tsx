import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CLS =
  "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 " +
  "bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm " +
  "transition-colors hover:bg-slate-50 active:scale-[0.98]";

export function BackButton({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <ArrowLeft className="h-4 w-4" />
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={CLS}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={CLS}>
      {content}
    </button>
  );
}
