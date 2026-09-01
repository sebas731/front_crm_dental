/**
 * Marca DENTAL STUDIO: anillo "D" + diente, en degradé teal→cyan.
 * `tone="white"` para fondos oscuros (panel de marca).
 */
export function LogoMark({
  size = 40,
  tone = "color",
}: {
  size?: number;
  tone?: "color" | "white";
}) {
  const gid = tone === "white" ? "logo-w" : "logo-c";
  const fill = tone === "white" ? "#ffffff" : `url(#${gid})`;
  const stroke = tone === "white" ? "#ffffff" : `url(#${gid})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {tone !== "white" && (
        <defs>
          <linearGradient id={gid} x1="4" y1="4" x2="44" y2="44">
            <stop offset="0" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      )}
      {/* Anillo abierto (la "D") */}
      <path
        d="M23 6 A17 17 0 1 0 23 42"
        fill="none"
        stroke={stroke}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Diente */}
      <path
        d="M30 8c5 0 9 3.6 9 8.6 0 5.8-2.8 9.8-3.9 15.6-.7 3.4-4 3.4-4.8.3l-1.1-6.6c-.3-1.9-2.1-1.9-2.4 0l-1.1 6.6c-.8 3.1-4.1 3.1-4.8-.3-1.1-5.8-3.9-9.8-3.9-15.6 0-5 4-8.6 9-8.6z"
        fill={fill}
      />
    </svg>
  );
}

export function Logo({
  tone = "color",
  size = 40,
}: {
  tone?: "color" | "white";
  size?: number;
}) {
  const text = tone === "white" ? "text-white" : "text-slate-800";
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size} tone={tone} />
      <div className="leading-none">
        <p className={`text-lg font-bold tracking-tight ${text}`}>DENTAL</p>
        <p
          className={`text-[10px] font-medium tracking-[0.35em] ${
            tone === "white" ? "text-teal-100" : "text-slate-400"
          }`}
        >
          STUDIO
        </p>
      </div>
    </div>
  );
}
