"use client";

import { useState, useRef } from "react";
import { Box, Drawer, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PublicIcon from "@mui/icons-material/Public";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StarIcon from "@mui/icons-material/Star";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import WcIcon from "@mui/icons-material/Wc";
import CloseIcon from "@mui/icons-material/Close";
import type { SvgIconComponent } from "@mui/icons-material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { COLORS } from "@/app/constants/designTokens";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";

// ── types ──────────────────────────────────────────────────────────────────────

type AreaType = "stage" | "stage2" | "bar" | "games" | "food" | "restroom" | "merch" | "vip";

interface MapArea {
  id: string;
  label: string;
  description: string;
  type: AreaType;
  svgX: number;
  svgY: number;
  svgW: number;
  svgH: number;
  details: string[];
}

// ── data ───────────────────────────────────────────────────────────────────────

const AREAS: MapArea[] = [
  { id: "palco-hexa",     label: "Palco Hexa",    description: "Palco principal com telão 4K",            type: "stage",    svgX: 200, svgY: 150,  svgW: 380, svgH: 280, details: ["Shows ao vivo durante os jogos", "Telão 4K com som imersivo", "Capacidade 5.000 pessoas"] },
  { id: "palco-mundo",    label: "Palco Mundo",   description: "Transmissão Copa do Mundo ao vivo",       type: "stage2",   svgX: 680, svgY: 200,  svgW: 300, svgH: 250, details: ["Todos os jogos da Copa", "Comentaristas ao vivo", "Área VIP ao redor"] },
  { id: "area-games",     label: "Área Games",    description: "Zona de jogos e ativações",               type: "games",    svgX: 80,  svgY: 700,  svgW: 280, svgH: 300, details: ["Fliperamas e jogos retrô", "Simuladores de futebol", "Torneios com prêmios"] },
  { id: "bar-central",    label: "Bar Central",   description: "Principal ponto de bebidas",              type: "bar",      svgX: 430, svgY: 850,  svgW: 280, svgH: 220, details: ["Chopp e cervejas artesanais", "Drinks exclusivos Copa 2026", "Aberto 12h–23h"] },
  { id: "food-park",      label: "Food Park",     description: "Praça de alimentação",                    type: "food",     svgX: 150, svgY: 1200, svgW: 380, svgH: 260, details: ["Food trucks variados", "Opções veganas", "Mesas cobertas"] },
  { id: "area-vip",       label: "Área VIP",      description: "Espaço exclusivo com vista privilegiada", type: "vip",      svgX: 700, svgY: 900,  svgW: 300, svgH: 240, details: ["Acesso por pulseira VIP", "Open bar premium", "Vista frontal dos palcos"] },
  { id: "quiosque-merch", label: "Quiosque Cazé", description: "Produtos oficiais Casa CazéTV",           type: "merch",    svgX: 450, svgY: 1400, svgW: 240, svgH: 200, details: ["Camisetas exclusivas", "Bonés e acessórios", "Produtos autografados"] },
  { id: "banheiros",      label: "Banheiros",     description: "Sanitários — múltiplos pontos",           type: "restroom", svgX: 820, svgY: 1450, svgW: 200, svgH: 180, details: ["Masculino e feminino", "Acessível para PCD", "Fraldário disponível"] },
];

// ── area config ────────────────────────────────────────────────────────────────

interface AreaConfig {
  color: string;
  bg: string;
  Icon: SvgIconComponent;
}

const AREA_CONFIG: Record<AreaType, AreaConfig> = {
  stage:    { color: "#008542", bg: "rgba(0,133,66,0.18)",   Icon: SportsSoccerIcon  },
  stage2:   { color: "#1B3DE8", bg: "rgba(27,61,232,0.15)",  Icon: PublicIcon        },
  games:    { color: "#9C27B0", bg: "rgba(156,39,176,0.15)", Icon: SportsEsportsIcon },
  bar:      { color: "#E8175D", bg: "rgba(232,23,93,0.15)",  Icon: LocalBarIcon      },
  food:     { color: "#FF8C00", bg: "rgba(255,140,0,0.15)",  Icon: RestaurantIcon    },
  vip:      { color: "#FFD100", bg: "rgba(255,209,0,0.15)",  Icon: StarIcon          },
  merch:    { color: "#F7B521", bg: "rgba(247,181,33,0.15)", Icon: CheckroomIcon     },
  restroom: { color: "#607D8B", bg: "rgba(96,125,139,0.12)", Icon: WcIcon            },
};

// ── helpers ────────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── HotspotLabel ───────────────────────────────────────────────────────────────

function HotspotLabel({
  area,
  isActive,
  isDimmed,
  onClick,
}: {
  area: MapArea;
  isActive: boolean;
  isDimmed: boolean;
  onClick: () => void;
}) {
  const cfg = AREA_CONFIG[area.type];
  const cx = area.svgX + area.svgW / 2;
  const cy = area.svgY + area.svgH / 2;

  const pillW = 196;
  const pillH = 44;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }} opacity={isDimmed ? 0.28 : 1}>
      {/* Invisible enlarged hit target for easy touch */}
      <rect
        x={cx - pillW / 2 - 20}
        y={cy - pillH / 2 - 20}
        width={pillW + 40}
        height={pillH + 40}
        fill="transparent"
      />

      {/* Pill background */}
      <rect
        x={cx - pillW / 2}
        y={cy - pillH / 2}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        fill={isActive ? cfg.bg.replace(/0\.\d+\)/, "0.42)") : "rgba(10,17,40,0.82)"}
        stroke={isActive ? cfg.color : hexToRgba(cfg.color, 0.45)}
        strokeWidth={isActive ? 2.5 : 1.5}
        filter={isActive ? "url(#im-glow)" : "none"}
      />

      {/* Colored accent dot */}
      <circle
        cx={cx - pillW / 2 + 22}
        cy={cy}
        r={7}
        fill={cfg.color}
        opacity={isActive ? 1 : 0.75}
      />

      {/* Label text */}
      <text
        x={cx - pillW / 2 + 36}
        y={cy}
        dominantBaseline="middle"
        fontSize={20}
        fontWeight="700"
        fontFamily="Montserrat, sans-serif"
        fill={isActive ? cfg.color : "#FFFFFF"}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {area.label}
      </text>
    </g>
  );
}

// ── ZoomControls ───────────────────────────────────────────────────────────────

function ZoomControls({ transformRef }: { transformRef: React.RefObject<ReactZoomPanPinchRef | null> }) {
  const btnSx = {
    width: 36,
    height: 36,
    bgcolor: "rgba(21,28,46,0.92)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.85)",
    "&:hover": { bgcolor: "rgba(21,28,46,1)", borderColor: "rgba(255,255,255,0.30)" },
  };

  return (
    <Box sx={{
      position: "absolute",
      bottom: 14,
      right: 14,
      display: "flex",
      flexDirection: "column",
      gap: 0.75,
      zIndex: 10,
    }}>
      <IconButton
        size="small"
        aria-label="Aproximar"
        sx={btnSx}
        onClick={() => transformRef.current?.zoomIn(0.5)}
      >
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Afastar"
        sx={btnSx}
        onClick={() => transformRef.current?.zoomOut(0.5)}
      >
        <RemoveIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Resetar zoom"
        sx={btnSx}
        onClick={() => transformRef.current?.resetTransform()}
      >
        <CenterFocusStrongIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

// ── AreaDrawer ─────────────────────────────────────────────────────────────────

function AreaDrawer({ area, onClose }: { area: MapArea | null; onClose: () => void }) {
  if (!area) return null;
  const cfg = AREA_CONFIG[area.type];

  return (
    <Drawer
      anchor="bottom"
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: "#151c2e",
          borderRadius: "20px 20px 0 0",
          maxHeight: "55vh",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.4)",
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ pt: 1.5, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: 36, height: 4, bgcolor: "rgba(255,255,255,0.12)", borderRadius: "2px" }} />
      </Box>

      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 0, display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{
          width: 52, height: 52,
          borderRadius: CAZE_RADIUS.md,
          bgcolor: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <cfg.Icon sx={{ color: cfg.color, fontSize: "1.5rem" }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 800,
            fontSize: "1rem",
            color: COLORS.text,
            lineHeight: 1.2,
          }}>
            {area.label}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, mt: 0.3, lineHeight: 1.4 }}>
            {area.description}
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={{ color: COLORS.muted, p: 0.5, mt: -0.25 }} aria-label="Fechar">
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Divider */}
      <Box sx={{ height: "1px", bgcolor: "rgba(255,255,255,0.08)", mx: 3, mt: 2 }} />

      {/* Detail bullets */}
      {area.details.length > 0 && (
        <Box sx={{ px: 3, pt: 2, pb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {area.details.map((detail, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: cfg.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.875rem", color: COLORS.text, lineHeight: 1.4 }}>
                  {detail}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

// ── InteractiveMap ─────────────────────────────────────────────────────────────

interface InteractiveMapProps {
  onAreaSelect?: (areaId: string | null) => void;
}

export default function InteractiveMap({ onAreaSelect }: InteractiveMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  function handleSelect(id: string) {
    const next = activeId === id ? null : id;
    setActiveId(next);
    onAreaSelect?.(next);
  }

  const activeArea = AREAS.find((a) => a.id === activeId) ?? null;

  return (
    <>
      <Box sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "1143 / 2048",
        borderRadius: CAZE_RADIUS.md,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <TransformWrapper
          ref={transformRef}
          minScale={1}
          maxScale={5}
          initialScale={1}
          centerOnInit={false}
          wheel={{ step: 0.15 }}
          pinch={{ step: 6 }}
          doubleClick={{ mode: "zoomIn", step: 0.8 }}
          panning={{ excluded: [] }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%", position: "relative" }}
          >
            {/* Illustrated background */}
            <Box
              component="img"
              src="/assets/casa-cazetv/mapa%20interativo.svg"
              alt="Mapa do evento"
              sx={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
            />

            {/* Overlay SVG with clickable labels */}
            <svg
              viewBox="0 0 1143 2048"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <filter id="im-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {AREAS.map((area) => (
                <HotspotLabel
                  key={area.id}
                  area={area}
                  isActive={activeId === area.id}
                  isDimmed={activeId !== null && activeId !== area.id}
                  onClick={() => handleSelect(area.id)}
                />
              ))}
            </svg>
          </TransformComponent>
        </TransformWrapper>

        {/* Zoom controls */}
        <ZoomControls transformRef={transformRef} />

        {/* Hint: double-tap to zoom */}
        <Box sx={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: "rgba(10,17,40,0.72)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "100px",
          px: 1.5, py: 0.4,
          pointerEvents: "none",
        }}>
          <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
            Pinça para zoom · Duplo toque para aproximar
          </Typography>
        </Box>
      </Box>

      <AreaDrawer
        area={activeArea}
        onClose={() => {
          setActiveId(null);
          onAreaSelect?.(null);
        }}
      />
    </>
  );
}
