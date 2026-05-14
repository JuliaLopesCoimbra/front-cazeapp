"use client";

import { useId } from "react";

export interface MedidasCamiseta {
  ombro: number;
  manga: number;
  torax: number;
  comprimento: number;
}

/** Medidas em cm — XG e EXG são o mesmo corte (rótulos diferentes). */
export const medidasPorTamanho: Record<string, MedidasCamiseta> = {
  PP: { ombro: 38, manga: 17, torax: 86, comprimento: 63 },
  P: { ombro: 40, manga: 18, torax: 90, comprimento: 65 },
  M: { ombro: 42, manga: 20, torax: 94, comprimento: 68 },
  G: { ombro: 44, manga: 21, torax: 98, comprimento: 70 },
  GG: { ombro: 46, manga: 22, torax: 102, comprimento: 73 },
  XG: { ombro: 48, manga: 23, torax: 106, comprimento: 75 },
  EXG: { ombro: 48, manga: 23, torax: 106, comprimento: 75 },
};

export const COR_MEDIDAS = {
  ombro: "#1565c0",
  manga: "#e65100",
  torax: "#6a1b9a",
  comprimento: "#009739",
};

export function CamisetaSVG({ medidas }: { medidas: MedidasCamiseta }) {
  const uid = useId().replace(/:/g, "");
  const gid = `greenGrad-${uid}`;
  const yid = `yellowGrad-${uid}`;
  const sid = `shadow-${uid}`;
  const svgW = 320;
  const svgH = 330;
  const svgTopPad = 22;

  const collarL = { x: 116, y: 26 };
  const collarR = { x: 204, y: 26 };
  const shoulderL = { x: 76, y: 56 };
  const shoulderR = { x: 244, y: 56 };
  const sleeveOutL = { x: 22, y: 102 };
  const sleeveOutR = { x: 298, y: 102 };
  const sleeveInL = { x: 50, y: 130 };
  const sleeveInR = { x: 270, y: 130 };
  const bodyTL = { x: 76, y: 80 };
  const bodyTR = { x: 244, y: 80 };
  const bodyBL = { x: 76, y: 286 };
  const bodyBR = { x: 244, y: 286 };

  const shirtPath = [
    `M ${collarL.x} ${collarL.y}`,
    `Q 160 54 ${collarR.x} ${collarR.y}`,
    `L ${shoulderR.x} ${shoulderR.y}`,
    `L ${sleeveOutR.x} ${sleeveOutR.y}`,
    `L ${sleeveInR.x} ${sleeveInR.y}`,
    `L ${bodyTR.x} ${bodyTR.y}`,
    `L ${bodyBR.x} ${bodyBR.y}`,
    `L ${bodyBL.x} ${bodyBL.y}`,
    `L ${bodyTL.x} ${bodyTL.y}`,
    `L ${sleeveInL.x} ${sleeveInL.y}`,
    `L ${sleeveOutL.x} ${sleeveOutL.y}`,
    `L ${shoulderL.x} ${shoulderL.y}`,
    "Z",
  ].join(" ");

  const collarPath = [
    `M ${collarL.x} ${collarL.y}`,
    `L ${shoulderL.x} ${shoulderL.y}`,
    `Q 116 32 116 26`,
    `Q 160 0 204 26`,
    `Q 204 32 ${shoulderR.x} ${shoulderR.y}`,
    `L ${collarR.x} ${collarR.y}`,
    `Q 160 54 ${collarL.x} ${collarL.y}`,
    "Z",
  ].join(" ");

  const stripeY = 140;
  const ombroY = 42;
  const ombroX1 = shoulderL.x;
  const ombroX2 = shoulderR.x;
  const mangaX1 = shoulderL.x;
  const mangaY1 = shoulderL.y;
  const mangaX2 = sleeveOutL.x;
  const mangaY2 = sleeveOutL.y;
  const toraxY = 178;
  const toraxX1 = bodyTL.x;
  const toraxX2 = bodyTR.x;
  const compX = 268;
  const compY1 = collarR.y;
  const compY2 = bodyBR.y;

  function ArrowH({ x1, x2, y, cor }: { x1: number; x2: number; y: number; cor: string }) {
    return (
      <g>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={cor} strokeWidth={1.5} strokeDasharray="5,3" />
        <path
          d={`M ${x1 + 6} ${y - 4} L ${x1} ${y} L ${x1 + 6} ${y + 4}`}
          fill="none"
          stroke={cor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d={`M ${x2 - 6} ${y - 4} L ${x2} ${y} L ${x2 - 6} ${y + 4}`}
          fill="none"
          stroke={cor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  function ArrowDiag({ x1, y1, x2, y2, cor }: { x1: number; y1: number; x2: number; y2: number; cor: string }) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ax1x = x1 + 6 * Math.cos(ang + 0.5);
    const ax1y = y1 + 6 * Math.sin(ang + 0.5);
    const ax2x = x2 - 6 * Math.cos(ang - 0.5);
    const ax2y = y2 - 6 * Math.sin(ang - 0.5);
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={1.5} strokeDasharray="5,3" />
        <path
          d={`M ${ax1x} ${ax1y} L ${x1} ${y1} L ${x1 + 6 * Math.cos(ang - 0.5)} ${y1 + 6 * Math.sin(ang - 0.5)}`}
          fill="none"
          stroke={cor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d={`M ${ax2x} ${ax2y} L ${x2} ${y2} L ${x2 - 6 * Math.cos(ang + 0.5)} ${y2 - 6 * Math.sin(ang + 0.5)}`}
          fill="none"
          stroke={cor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  function ArrowV({ x, y1, y2, cor }: { x: number; y1: number; y2: number; cor: string }) {
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={cor} strokeWidth={1.5} strokeDasharray="5,3" />
        <path
          d={`M ${x - 4} ${y1 + 6} L ${x} ${y1} L ${x + 4} ${y1 + 6}`}
          fill="none"
          stroke={cor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d={`M ${x - 4} ${y2 - 6} L ${x} ${y2} L ${x + 4} ${y2 - 6}`}
          fill="none"
          stroke={cor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  function Label({
    x,
    y,
    valor,
    unidade,
    cor,
    align = "center",
  }: {
    x: number;
    y: number;
    valor: number;
    unidade: string;
    cor: string;
    align?: "center" | "left" | "right";
  }) {
    const text = `${valor} ${unidade}`;
    const tw = text.length * 7 + 10;
    const tx = align === "left" ? x : align === "right" ? x - tw : x - tw / 2;
    return (
      <g>
        <rect x={tx} y={y - 10} width={tw} height={18} rx={4} fill={cor} opacity={0.92} />
        <text
          x={tx + tw / 2}
          y={y + 3}
          textAnchor="middle"
          fill="white"
          fontSize={11}
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          {text}
        </text>
      </g>
    );
  }

  const mangaMidX = (mangaX1 + mangaX2) / 2 - 24;
  const mangaMidY = (mangaY1 + mangaY2) / 2 - 4;

  return (
    <svg
      viewBox={`0 -${svgTopPad} ${svgW} ${svgH + svgTopPad}`}
      overflow="visible"
      style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}
    >
      <defs>
        <filter id={sid} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.15)" />
        </filter>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#009739" />
          <stop offset="100%" stopColor="#006728" />
        </linearGradient>
        <linearGradient id={yid} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEDF00" />
          <stop offset="100%" stopColor="#ffc107" />
        </linearGradient>
      </defs>

      <path d={shirtPath} fill={`url(#${gid})`} filter={`url(#${sid})`} />
      <rect x={76} y={stripeY} width={168} height={6} fill="#FEDF00" opacity={0.85} rx={1} />
      <rect x={76} y={stripeY + 9} width={168} height={2} fill="#002776" opacity={0.6} rx={1} />
      <path d={collarPath} fill={`url(#${yid})`} />
      <circle cx={160} cy={110} r={18} fill="#002776" opacity={0.9} />
      <text x={160} y={107} textAnchor="middle" fill="#FEDF00" fontSize={8} fontWeight="bold" fontFamily="Inter, sans-serif">
        CBF
      </text>
      <text x={160} y={118} textAnchor="middle" fill="#fff" fontSize={6} fontFamily="Inter, sans-serif">
        BRASIL
      </text>
      <text x={160} y={238} textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize={68} fontWeight="900" fontFamily="Inter, sans-serif">
        10
      </text>

      <ArrowH x1={ombroX1} x2={ombroX2} y={ombroY} cor={COR_MEDIDAS.ombro} />
      <Label x={(ombroX1 + ombroX2) / 2} y={ombroY - 14} valor={medidas.ombro} unidade="cm" cor={COR_MEDIDAS.ombro} />
      <ArrowDiag x1={mangaX1} y1={mangaY1} x2={mangaX2} y2={mangaY2} cor={COR_MEDIDAS.manga} />
      <Label x={mangaMidX - 2} y={mangaMidY} valor={medidas.manga} unidade="cm" cor={COR_MEDIDAS.manga} align="right" />
      <ArrowH x1={toraxX1} x2={toraxX2} y={toraxY} cor={COR_MEDIDAS.torax} />
      <Label x={(toraxX1 + toraxX2) / 2} y={toraxY + 16} valor={medidas.torax} unidade="cm" cor={COR_MEDIDAS.torax} />
      <ArrowV x={compX} y1={compY1} y2={compY2} cor={COR_MEDIDAS.comprimento} />
      <Label
        x={compX + 6}
        y={(compY1 + compY2) / 2}
        valor={medidas.comprimento}
        unidade="cm"
        cor={COR_MEDIDAS.comprimento}
        align="left"
      />
    </svg>
  );
}

export function QRCodeImg({ data }: { data: string }) {
  const encoded = encodeURIComponent(data);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=002776&data=${encoded}`}
      alt="QR Code de reserva"
      width={220}
      height={220}
      style={{
        display: "block",
        borderRadius: 12,
        border: "6px solid #fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    />
  );
}
