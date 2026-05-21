import { RAINBOW_ICON_GRADIENT_ID } from "@/app/constants/rainbowGradient";

/** Defs SVG para ícones com fill em gradiente arco-íris (sidebar / bottom nav). */
export default function RainbowGradientDefs() {
  return (
    <svg width={0} height={0} aria-hidden style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={RAINBOW_ICON_GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E52554" />
          <stop offset="38%" stopColor="#F7B521" />
          <stop offset="58%" stopColor="#31E46A" />
          <stop offset="63%" stopColor="#29BAEB" />
          <stop offset="100%" stopColor="#432B9D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
