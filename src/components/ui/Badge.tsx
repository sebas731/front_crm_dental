export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        color,
        backgroundColor: `${color}1f`, // pastel ~12%
        borderColor: `${color}59`,
      }}
    >
      {label}
    </span>
  );
}
