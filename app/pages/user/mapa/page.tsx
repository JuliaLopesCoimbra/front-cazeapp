"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Drawer, IconButton } from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PublicIcon from "@mui/icons-material/Public";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import WcIcon from "@mui/icons-material/Wc";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CloseIcon from "@mui/icons-material/Close";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { COLORS, LAYOUT } from "@/app/constants/designTokens";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import type { SvgIconComponent } from "@mui/icons-material";

// ── types ──────────────────────────────────────────────────────────────────────

type PoiType = "stage" | "stage2" | "bar" | "restroom" | "merch" | "games";

interface Poi {
  id: string;
  label: string;
  description: string;
  type: PoiType;
  x: number; // % from left of map container
  y: number; // % from top of map container
  details: string[];
}

// ── config ─────────────────────────────────────────────────────────────────────

const POI_CONFIG: Record<PoiType, { color: string; bg: string; Icon: SvgIconComponent }> = {
  stage:    { color: "#009440", bg: "rgba(0,148,64,0.12)",   Icon: SportsSoccerIcon   },
  stage2:   { color: "#0055B8", bg: "rgba(0,85,184,0.12)",   Icon: PublicIcon         },
  bar:      { color: "#D84315", bg: "rgba(216,67,21,0.10)",  Icon: LocalBarIcon       },
  restroom: { color: "#455A64", bg: "rgba(69,90,100,0.10)",  Icon: WcIcon             },
  merch:    { color: "#B8960A", bg: "rgba(184,150,10,0.12)", Icon: CheckroomIcon      },
  games:    { color: "#6A1B9A", bg: "rgba(106,27,154,0.10)", Icon: SportsEsportsIcon  },
};

const LEGEND_LABELS: Record<PoiType, string> = {
  stage:    "Palco Hexa",
  stage2:   "Palco Mundo",
  bar:      "Bar",
  restroom: "Banheiro",
  merch:    "Quiosque",
  games:    "Área Games",
};

const POIS: Poi[] = [
  {
    id: "palco-hexa",
    label: "Palco Hexa",
    description: "Palco principal da Casa CazéTV",
    type: "stage",
    x: 36, y: 18,
    details: ["Shows ao vivo durante os jogos", "Telão 4K com som imersivo", "Capacidade para 5.000 pessoas"],
  },
  {
    id: "palco-mundo",
    label: "Palco Mundo",
    description: "Palco Copa do Mundo ao vivo",
    type: "stage2",
    x: 72, y: 26,
    details: ["Transmissão de todos os jogos da Copa", "Área VIP ao redor", "Comentaristas ao vivo"],
  },
  {
    id: "games",
    label: "Área Games",
    description: "Zona de jogos e ativações interativas",
    type: "games",
    x: 16, y: 44,
    details: ["Fliperamas e jogos retrô", "Simuladores de futebol", "Torneios com prêmios diários"],
  },
  {
    id: "bar-central",
    label: "Bar Central",
    description: "Principal ponto de alimentação e bebidas",
    type: "bar",
    x: 52, y: 50,
    details: ["Chopp e cervejas artesanais", "Petiscos e lanches", "Aberto das 12h às 23h"],
  },
  {
    id: "bar-lateral",
    label: "Bar Lateral",
    description: "Bar temático Copa do Mundo",
    type: "bar",
    x: 20, y: 68,
    details: ["Drinks exclusivos Copa 2026", "Opções sem álcool", "Food trucks ao lado"],
  },
  {
    id: "bar-sunset",
    label: "Bar Sunset",
    description: "Bar com vista para os palcos",
    type: "bar",
    x: 80, y: 60,
    details: ["Vista privilegiada dos palcos", "Cocktails especiais", "Espaço lounge"],
  },
  {
    id: "camisetas",
    label: "Quiosque Cazé",
    description: "Produtos oficiais Casa CazéTV",
    type: "merch",
    x: 51, y: 72,
    details: ["Camisetas exclusivas do evento", "Bonés e acessórios", "Produtos autografados"],
  },
  {
    id: "banheiro-esq",
    label: "Banheiros",
    description: "Sanitários — área esquerda",
    type: "restroom",
    x: 13, y: 84,
    details: ["Masculino e feminino", "Acessível para PCD", "Fraldário disponível"],
  },
  {
    id: "banheiro-dir",
    label: "Banheiros",
    description: "Sanitários — área direita",
    type: "restroom",
    x: 84, y: 84,
    details: ["Masculino e feminino", "Acessível para PCD", "Limpos de hora em hora"],
  },
];

// ── SVG do venue ───────────────────────────────────────────────────────────────

function VenueMapSVG() {
  return (
    <svg
      viewBox="0 0 360 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block", position: "absolute", inset: 0 }}
    >
      {/* Fundo geral */}
      <rect x="0" y="0" width="360" height="500" fill="#EDF7ED" rx="16" />

      {/* Borda do venue */}
      <rect x="4" y="4" width="352" height="492" fill="none" stroke="rgba(0,148,64,0.2)" strokeWidth="2" rx="14" />

      {/* Caminhos principais */}
      <rect x="148" y="0"   width="64"  height="500" fill="#F5F0E8" opacity="0.65" />
      <rect x="0"   y="228" width="360" height="44"  fill="#F5F0E8" opacity="0.65" />

      {/* Zona Palco Hexa */}
      <rect x="55" y="22" width="182" height="118" fill="rgba(0,148,64,0.10)" rx="12"
        stroke="rgba(0,148,64,0.30)" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="146" y="38" textAnchor="middle" fontSize="8" fill="#007a33"
        fontFamily="'Montserrat', sans-serif" fontWeight="700" letterSpacing="0.8">ZONA PALCO HEXA</text>

      {/* Zona Palco Mundo */}
      <rect x="246" y="52" width="104" height="108" fill="rgba(0,85,184,0.08)" rx="10"
        stroke="rgba(0,85,184,0.25)" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="298" y="67" textAnchor="middle" fontSize="7.5" fill="#004fad"
        fontFamily="'Montserrat', sans-serif" fontWeight="700" letterSpacing="0.5">ZONA MUNDO</text>

      {/* Zona Games */}
      <rect x="8" y="168" width="108" height="136" fill="rgba(106,27,154,0.06)" rx="10"
        stroke="rgba(106,27,154,0.20)" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="62" y="183" textAnchor="middle" fontSize="7.5" fill="#6A1B9A"
        fontFamily="'Montserrat', sans-serif" fontWeight="700" letterSpacing="0.5">ZONA GAMES</text>

      {/* Entrada principal */}
      <rect x="110" y="452" width="140" height="40" fill="rgba(0,148,64,0.12)" rx="8"
        stroke="rgba(0,148,64,0.25)" strokeWidth="1" />
      <text x="180" y="477" textAnchor="middle" fontSize="8.5" fill="#007a33"
        fontFamily="'Montserrat', sans-serif" fontWeight="800" letterSpacing="1">ENTRADA</text>

      {/* Elementos decorativos (árvores/arbustos) */}
      <circle cx="22"  cy="22"  r="11" fill="rgba(34,139,34,0.18)" />
      <circle cx="338" cy="22"  r="11" fill="rgba(34,139,34,0.18)" />
      <circle cx="22"  cy="430" r="9"  fill="rgba(34,139,34,0.15)" />
      <circle cx="338" cy="430" r="9"  fill="rgba(34,139,34,0.15)" />
      <circle cx="236" cy="390" r="7"  fill="rgba(34,139,34,0.13)" />
      <circle cx="124" cy="400" r="6"  fill="rgba(34,139,34,0.13)" />
      <circle cx="338" cy="185" r="7"  fill="rgba(34,139,34,0.13)" />
    </svg>
  );
}

// ── marcador de POI ────────────────────────────────────────────────────────────

function PoiMarker({ poi, onClick }: { poi: Poi; onClick: () => void }) {
  const cfg = POI_CONFIG[poi.type];
  const isMain = poi.type === "stage" || poi.type === "stage2";
  const size = isMain ? 46 : 38;

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "absolute",
        left: `${poi.x}%`,
        top:  `${poi.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.4,
        cursor: "pointer",
        zIndex: 10,
        transition: "transform 0.15s",
        "&:active": { transform: "translate(-50%, -50%) scale(0.90)" },
      }}
    >
      <Box sx={{
        width: size, height: size,
        borderRadius: CAZE_RADIUS.md,
        bgcolor: cfg.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 14px ${cfg.color}50`,
        border: "2.5px solid #fff",
        flexShrink: 0,
      }}>
        <cfg.Icon sx={{ color: "#fff", fontSize: isMain ? "1.3rem" : "1.05rem" }} />
      </Box>

      <Box sx={{
        bgcolor: "rgba(255,255,255,0.96)",
        borderRadius: CAZE_RADIUS.pill,
        px: 0.8, py: 0.15,
        boxShadow: "0 1px 6px rgba(0,0,0,0.14)",
        maxWidth: 72,
      }}>
        <Typography sx={{
          fontSize: "0.52rem",
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 800,
          color: cfg.color,
          lineHeight: 1.3,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {poi.label}
        </Typography>
      </Box>
    </Box>
  );
}

// ── drawer de detalhes ─────────────────────────────────────────────────────────

function PoiDrawer({ poi, onClose }: { poi: Poi | null; onClose: () => void }) {
  if (!poi) return null;
  const cfg = POI_CONFIG[poi.type];

  return (
    <Drawer
      anchor="bottom"
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: `${CAZE_RADIUS.lg} ${CAZE_RADIUS.lg} 0 0`,
          bgcolor: COLORS.surface,
          boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
          maxHeight: "55vh",
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ pt: 1.5, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: 36, height: 4, bgcolor: "rgba(0,0,0,0.10)", borderRadius: "2px" }} />
      </Box>

      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 0, display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: CAZE_RADIUS.md,
          bgcolor: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <cfg.Icon sx={{ color: cfg.color, fontSize: "1.5rem" }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 800, fontSize: "1.05rem",
            color: COLORS.text, lineHeight: 1.2,
          }}>
            {poi.label}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, mt: 0.3, lineHeight: 1.4 }}>
            {poi.description}
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={{ color: COLORS.muted, p: 0.5, mt: -0.25 }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Detalhes */}
      {poi.details.length > 0 && (
        <Box sx={{ px: 3, pt: 2, pb: 3 }}>
          <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.07)", mb: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {poi.details.map((d, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: cfg.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.875rem", color: COLORS.text, lineHeight: 1.4 }}>
                  {d}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

// ── página ─────────────────────────────────────────────────────────────────────

export default function MapaPage() {
  const router = useRouter();
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: COLORS.surface }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar light title="Mapa do Evento" showBack onBack={() => router.back()} />

          {/* Mapa */}
          <Box sx={{ flex: 1, px: 2, pt: 1.5, pb: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: 480,
                mx: "auto",
                aspectRatio: "360 / 500",
                borderRadius: CAZE_RADIUS.md,
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              }}
            >
              <VenueMapSVG />

              {POIS.map((poi) => (
                <PoiMarker
                  key={poi.id}
                  poi={poi}
                  onClick={() => setSelectedPoi(poi)}
                />
              ))}
            </Box>

            {/* Legenda */}
            <Box
              sx={{
                maxWidth: 480, mx: "auto", width: "100%",
                bgcolor: "#FAFAFA",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: CAZE_RADIUS.md,
                px: 2, py: 1.5,
              }}
            >
              <Typography sx={{
                fontSize: "0.6rem", fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700, color: COLORS.muted,
                textTransform: "uppercase", letterSpacing: "0.1em", mb: 1,
              }}>
                Legenda
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                {(Object.entries(POI_CONFIG) as [PoiType, typeof POI_CONFIG[PoiType]][]).map(([type, cfg]) => (
                  <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Box sx={{
                      width: 20, height: 20, borderRadius: "6px",
                      bgcolor: cfg.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <cfg.Icon sx={{ color: "#fff", fontSize: "0.72rem" }} />
                    </Box>
                    <Typography sx={{
                      fontSize: "0.68rem", color: COLORS.muted,
                      fontFamily: '"Montserrat", sans-serif', fontWeight: 600,
                    }}>
                      {LEGEND_LABELS[type]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {selectedPoi && <PoiDrawer poi={selectedPoi} onClose={() => setSelectedPoi(null)} />}

      {!selectedPoi && <BottomNav />}
    </>
  );
}
