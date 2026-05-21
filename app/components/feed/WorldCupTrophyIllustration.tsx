/**
 * Ilustração estilizada da taça da Copa — referência visual Figma node 1:2.
 */
export default function WorldCupTrophyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M100 18c-28 0-50 14-50 32 0 10 6 18 14 24l-8 42h88l-8-42c8-6 14-14 14-24 0-18-22-32-50-32z"
        fill="#FFCB00"
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse cx="100" cy="52" rx="42" ry="10" fill="#F7B521" stroke="#000" strokeWidth="2.5" />
      <path
        d="M62 96c-6 18-10 38-10 58h96c0-20-4-40-10-58"
        fill="#FFCB00"
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M72 154h56l10 48H62l10-48z"
        fill="#FFCB00"
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="58" y="198" width="84" height="22" rx="4" fill="#FFCB00" stroke="#000" strokeWidth="3" />
      <rect x="48" y="216" width="104" height="28" rx="6" fill="#FFCB00" stroke="#000" strokeWidth="3" />
      <path
        d="M78 120c-12-8-22-6-28 2M122 120c12-8 22-6 28 2"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
