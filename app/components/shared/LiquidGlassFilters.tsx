/**
 * Filtros SVG globais para o efeito Liquid Glass (feTurbulence + feDisplacementMap).
 *
 * Renderizar uma única vez no `app/layout.tsx`, antes do `<ScrollRestorer />`.
 * Os filtros são referenciados via `backdrop-filter: ... url(#lg-displace-soft|medium|strong)`.
 *
 * Calibração conforme §3 do `docs/liquid-glass-spec.md`:
 * - soft   (scale 20): caption, header — uso opt-in via flag NEXT_PUBLIC_LG_DISPLACEMENT
 * - medium (scale 40): modais e bottom sheets — uso intencional, sempre ativo no preset
 * - strong (scale 80): hero/welcome — uso pontual
 */
export default function LiquidGlassFilters() {
  return (
    <svg
      aria-hidden
      focusable={false}
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="lg-displace-soft" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.008"
            numOctaves={2}
            seed={4}
            result="turb"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turb"
            scale={20}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="lg-displace-medium" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.008"
            numOctaves={2}
            seed={7}
            result="turb"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turb"
            scale={40}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="lg-displace-strong" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.012"
            numOctaves={2}
            seed={11}
            result="turb"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turb"
            scale={80}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
