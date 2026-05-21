/**
 * Diamante com estrelas (referência bandeira BR) — canto inferior direito do post Copa.
 */
export default function BrazilDiamondBadge({ className = "" }: { className?: string }) {
  return (
    <div className={["relative", className].filter(Boolean).join(" ")} aria-hidden>
      <svg viewBox="0 0 72 72" className="h-[52px] w-[52px] drop-shadow-lg">
        <path
          d="M36 4 L68 36 L36 68 L4 36 Z"
          fill="#FFCB00"
          stroke="#000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="36" cy="36" r="14" fill="#0055B8" stroke="#000" strokeWidth="1.5" />
      </svg>
      {[0, 72, 144, 216, 288].map((deg) => (
        <span
          key={deg}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFCB00]"
          style={{
            transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-34px)`,
          }}
        />
      ))}
    </div>
  );
}
