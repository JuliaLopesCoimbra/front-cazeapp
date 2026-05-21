import { RAINBOW_GRADIENT_CSS } from "@/app/constants/rainbowGradient";

/**
 * RainbowDivider — separador decorativo 2px com gradiente arco-íris.
 */
export default function RainbowDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-0.5 w-full"
      style={{ backgroundImage: RAINBOW_GRADIENT_CSS }}
    />
  );
}
