"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Box, Typography, Avatar, IconButton, Badge, Drawer,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublicIcon from "@mui/icons-material/Public";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import CazeButton from "@/app/components/shared/CazeButton";

// ── tipos ──────────────────────────────────────────────────────────────────────

type Rarity = "common" | "rare" | "epic" | "legendary";
type CatalogStep = "category" | "team" | "player";
type CategoryKey = "selecao" | "tacas" | "escudos";
type ViewMode = "ofertas" | "meus";

interface TradeOffer {
  id: string;
  user: { name: string; avatar_url: string | null };
  player_name: string;
  team: string;
  rarity: Rarity;
  number: number;
  image_url?: string;
}

interface Announcement {
  id: string;
  player: string;
  team: string;
  image_url: string;
  createdAt: string;
}

// ── dados ──────────────────────────────────────────────────────────────────────

const COUNTRY_CODES: Record<string, string> = {
  "Brasil": "br", "Argentina": "ar", "França": "fr", "Alemanha": "de",
  "Inglaterra": "gb-eng", "Espanha": "es", "Portugal": "pt", "Holanda": "nl",
};

const PLAYER_IMAGES: Record<string, string> = {
  "Paquetá":      "/figurinhas/paqueta.jpeg",
  "Neymar":       "/figurinhas/neymar.jpeg",
  "Vinicius Jr.": "/figurinhas/vinicius.jpeg",
};

const MOCK_INTERESTED: Record<string, Array<{ name: string; avatar: string; postId: string }>> = {
  "Vinicius Jr.": [
    { name: "Carla M.", avatar: "https://i.pravatar.cc/80?img=47", postId: "c1" },
    { name: "João P.",  avatar: "https://i.pravatar.cc/80?img=67", postId: "c2" },
  ],
  "Neymar": [
    { name: "Felipe S.", avatar: "https://i.pravatar.cc/80?img=53", postId: "6" },
  ],
  "Paquetá": [
    { name: "Carla M.", avatar: "https://i.pravatar.cc/80?img=47", postId: "c1" },
    { name: "Bruno K.", avatar: "https://i.pravatar.cc/80?img=71", postId: "c3" },
    { name: "Isa C.",   avatar: "https://i.pravatar.cc/80?img=45", postId: "c4" },
  ],
};

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: "Comum",    color: "#94A3B8", bg: "linear-gradient(160deg,#1e293b,#0f172a)", glow: "#94A3B8" },
  rare:      { label: "Rara",     color: "#60A5FA", bg: "linear-gradient(160deg,#1e3a8a,#0f172a)", glow: "#3B82F6" },
  epic:      { label: "Épica",    color: "#C084FC", bg: "linear-gradient(160deg,#581c87,#1e1b4b)", glow: "#A855F7" },
  legendary: { label: "Lendária", color: "#FCD34D", bg: "linear-gradient(160deg,#92400e,#1c1917)", glow: "#F59E0B" },
};

const MOCK_OFFERS: TradeOffer[] = [
  { id: "1", user: { name: "Gabriel M.",  avatar_url: "https://i.pravatar.cc/80?img=3"  }, player_name: "Vinicius Jr.",      team: "Brasil",   rarity: "legendary", number: 42, image_url: "/figurinhas/vinicius.jpeg"  },
  { id: "2", user: { name: "Maria Silva", avatar_url: "https://i.pravatar.cc/80?img=5"  }, player_name: "Messi",             team: "Argentina",rarity: "legendary", number: 10, image_url: "/figurinhas/messi.jpeg"     },
  { id: "3", user: { name: "Lucas F.",    avatar_url: "https://i.pravatar.cc/80?img=11" }, player_name: "Cristiano Ronaldo", team: "Portugal", rarity: "epic",      number: 7,  image_url: "/figurinhas/cristiano.jpeg" },
  { id: "4", user: { name: "Ana Beatriz", avatar_url: "https://i.pravatar.cc/80?img=9"  }, player_name: "Neymar",            team: "Brasil",   rarity: "epic",      number: 10, image_url: "/figurinhas/neymar.jpeg"    },
  { id: "5", user: { name: "Pedro Alves", avatar_url: "https://i.pravatar.cc/80?img=15" }, player_name: "Lucas Paquetá",     team: "Brasil",   rarity: "rare",      number: 23, image_url: "/figurinhas/paqueta.jpeg"   },
];

const CATALOG: Record<CategoryKey, Array<{ name: string; players: string[] }>> = {
  selecao: [
    { name: "Brasil",     players: ["Vinicius Jr.", "Neymar", "Paquetá"] },
    { name: "Argentina",  players: ["Messi", "Lautaro Martínez", "Di María"] },
    { name: "França",     players: ["Mbappé", "Griezmann", "Dembélé"] },
    { name: "Alemanha",   players: ["Müller", "Havertz", "Wirtz"] },
    { name: "Espanha",    players: ["Yamal", "Morata", "Pedri"] },
    { name: "Portugal",   players: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão"] },
    { name: "Inglaterra", players: ["Bellingham", "Kane", "Saka"] },
  ],
  tacas:   [{ name: "Troféus", players: ["Taça Jules Rimet", "Taça FIFA", "Troféu Copa 2026"] }],
  escudos: [{ name: "Escudos", players: ["Escudo Brasil", "Escudo Argentina", "Escudo França"] }],
};

const CATEGORIES = [
  { key: "selecao" as CategoryKey, label: "Seleção",  Icon: PublicIcon              },
  { key: "tacas"   as CategoryKey, label: "Taças",    Icon: EmojiEventsOutlinedIcon },
  { key: "escudos" as CategoryKey, label: "Escudos",  Icon: ShieldOutlinedIcon      },
];

// ── helpers ────────────────────────────────────────────────────────────────────

function flagUrl(team: string) {
  const code = COUNTRY_CODES[team];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
}

// ── MatchOverlay ───────────────────────────────────────────────────────────────

function MatchOverlay({ offer, onChat, onContinue }: { offer: TradeOffer; onChat: () => void; onContinue: () => void }) {
  const content = (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,148,64,0.25) 0%, transparent 70%), linear-gradient(160deg,#060d1a,#0a1128)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3, textAlign: "center",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0, mb: 4 }}>
        <Avatar src="/assets/figma/logo-top.png" sx={{ width: 80, height: 80, border: "3px solid #FFD100", zIndex: 1, bgcolor: "#000" }} />
        <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#009440", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, mx: -1.5, border: "2px solid #060d1a" }}>
          <FavoriteIcon sx={{ fontSize: 16, color: "#fff" }} />
        </Box>
        <Avatar src={offer.user.avatar_url ?? undefined} sx={{ width: 80, height: 80, border: "3px solid #009440", zIndex: 1 }} />
      </Box>

      <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: "2rem", color: "#FFD100", lineHeight: 1.1, mb: 1 }}>
        É um Match!
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", mb: 4 }}>
        Você e <strong style={{ color: "#fff" }}>{offer.user.name}</strong> querem trocar a figurinha do <strong style={{ color: "#fff" }}>{offer.player_name}</strong>!
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box component="button" onClick={onChat} sx={{ py: 1.5, bgcolor: "#009440", border: 0, borderRadius: "12px", fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: "1rem", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, "&:hover": { bgcolor: "#007a35" }, transition: "background-color 0.15s" }}>
          <ForumOutlinedIcon sx={{ fontSize: 20 }} />
          Abrir Chat
        </Box>
        <Box component="button" onClick={onContinue} sx={{ py: 1.25, bgcolor: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontFamily: '"Montserrat",sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", cursor: "pointer", "&:hover": { borderColor: "#FFD100", color: "#FFD100" }, transition: "border-color 0.15s, color 0.15s" }}>
          Continuar vendo ofertas
        </Box>
      </Box>
    </Box>
  );
  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── TradeCard ──────────────────────────────────────────────────────────────────

const DRAG_THRESHOLD = 90;

function TradeCard({ offer, exiting, exitDir, onPass, onWant }: {
  offer: TradeOffer; exiting: boolean; exitDir: "left" | "right" | null;
  onPass: () => void; onWant: () => void;
}) {
  const cfg = RARITY_CONFIG[offer.rarity];
  const flag = flagUrl(offer.team);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    if (exiting) return;
    startX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || exiting) return;
    setDragX(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > DRAG_THRESHOLD) { onPass(); }
    else if (dragX < -DRAG_THRESHOLD) { onWant(); }
    else { setDragX(0); }
  }

  const rotation = dragX * 0.05;
  const progress = Math.min(Math.abs(dragX) / DRAG_THRESHOLD, 1);
  const showNao   = dragX >  24;
  const showQuero = dragX < -24;

  const transform = exiting
    ? exitDir === "left" ? "translateX(-130%) rotate(-12deg)" : "translateX(130%) rotate(12deg)"
    : `translateX(${dragX}px) rotate(${rotation}deg)`;

  return (
    <Box
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { setDragging(false); setDragX(0); }}
      sx={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius: "20px", boxShadow: `0 8px 64px ${cfg.glow}30`, transform, opacity: exiting ? 0 : 1, transition: dragging ? "none" : "transform 0.35s ease-out, opacity 0.35s ease-in", cursor: dragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}
    >
      <Box sx={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 3, pointerEvents: "none", opacity: showNao ? progress : 0, transition: dragging ? "none" : "opacity 0.2s" }}>
        <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: "2.5rem", color: "#EF4444", border: "4px solid #EF4444", px: 2, py: 0.5, borderRadius: "10px", transform: "rotate(-15deg)", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>NÃO</Typography>
      </Box>
      <Box sx={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 3, pointerEvents: "none", opacity: showQuero ? progress : 0, transition: dragging ? "none" : "opacity 0.2s" }}>
        <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: "2.5rem", color: "#009440", border: "4px solid #009440", px: 2, py: 0.5, borderRadius: "10px", transform: "rotate(15deg)", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>QUERO!</Typography>
      </Box>

      {offer.image_url
        ? <Box component="img" src={offer.image_url} alt={offer.player_name} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
        : <Box sx={{ position: "absolute", inset: 0, background: cfg.bg }} />
      }
      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.96) 100%)" }} />

      <Box sx={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>#{offer.number}</Typography>
        {flag && <Box component="img" src={flag} alt={offer.team} sx={{ width: 40, height: 27, objectFit: "cover", borderRadius: "5px", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }} />}
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: 3, pb: 2 }}>
        <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: "2.2rem", color: "#fff", lineHeight: 1.05, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{offer.player_name}</Typography>
        <Typography sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", mt: 0.5, mb: 2.5 }}>{offer.team}</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)", borderRadius: "14px", px: 2, py: 1.25, mb: 2.5, border: "1px solid rgba(255,255,255,0.1)" }}>
          <Avatar src={offer.user.avatar_url ?? undefined} sx={{ width: 40, height: 40, border: `2px solid ${cfg.color}50` }}>{!offer.user.avatar_url && offer.user.name[0]}</Avatar>
          <Box>
            <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>está oferecendo</Typography>
            <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{offer.user.name}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", pb: 1 }}>
          <Box component="button" onClick={onPass} disabled={exiting} sx={{ flex: 1, height: 52, borderRadius: "14px", bgcolor: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", transition: "background-color 0.15s", "&:hover": { bgcolor: "rgba(239,68,68,0.28)" }, "&:active": { transform: "scale(0.97)" } }}>
            <CloseIcon sx={{ color: "#EF4444", fontSize: 22 }} />
            <Typography sx={{ color: "#EF4444", fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "0.85rem" }}>Não</Typography>
          </Box>
          <Box component="button" onClick={onWant} disabled={exiting} sx={{ flex: 1, height: 52, borderRadius: "14px", bgcolor: "rgba(0,148,64,0.18)", border: "1.5px solid rgba(0,148,64,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer", transition: "background-color 0.15s", "&:hover": { bgcolor: "rgba(0,148,64,0.32)" }, "&:active": { transform: "scale(0.97)" } }}>
            <FavoriteIcon sx={{ color: "#009440", fontSize: 22 }} />
            <Typography sx={{ color: "#009440", fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "0.85rem" }}>Quero!</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── AnnounceDrawer ─────────────────────────────────────────────────────────────

function AnnounceDrawer({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (player: string, team: string) => void;
}) {
  const [catalogStep,      setCatalogStep]      = useState<CatalogStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedTeam,     setSelectedTeam]     = useState<string | null>(null);
  const [selectedPlayer,   setSelectedPlayer]   = useState<string | null>(null);

  function reset() {
    setCatalogStep("category"); setSelectedCategory(null); setSelectedTeam(null); setSelectedPlayer(null);
  }

  function handleClose() { reset(); onClose(); }

  function handleCategoryClick(cat: CategoryKey) {
    setSelectedCategory(cat); setSelectedPlayer(null); setSelectedTeam(null);
    if (cat === "selecao") { setCatalogStep("team"); }
    else { setSelectedTeam(CATALOG[cat][0].name); setCatalogStep("player"); }
  }

  function handleTeamClick(team: string) { setSelectedTeam(team); setSelectedPlayer(null); setCatalogStep("player"); }
  function handlePlayerClick(player: string) { setSelectedPlayer(player === selectedPlayer ? null : player); }

  function handleBack() {
    if (catalogStep === "player" && selectedCategory === "selecao") { setCatalogStep("team"); setSelectedPlayer(null); }
    else { setCatalogStep("category"); setSelectedCategory(null); setSelectedTeam(null); setSelectedPlayer(null); }
  }

  function handleConfirm() {
    if (selectedPlayer && selectedTeam) {
      onConfirm(selectedPlayer, selectedTeam);
      reset();
    }
  }

  const players = selectedCategory && selectedTeam
    ? CATALOG[selectedCategory].find((t) => t.name === selectedTeam)?.players ?? []
    : [];

  const breadcrumb = catalogStep === "team"
    ? CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? ""
    : [CATEGORIES.find((c) => c.key === selectedCategory)?.label, selectedTeam].filter(Boolean).join(" › ");

  return (
    <Drawer anchor="bottom" open={open} onClose={handleClose}
      PaperProps={{ sx: { backgroundColor: "#151c2e", borderRadius: `${CAZE_RADIUS.md} ${CAZE_RADIUS.md} 0 0`, maxHeight: "82vh", display: "flex", flexDirection: "column" } }}
    >
      <Box sx={{ pt: 2, pb: 0.5, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <Box sx={{ width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "2px" }} />
      </Box>
      <Box sx={{ px: 3, pt: 1.5, pb: 2, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {catalogStep !== "category" && (
            <IconButton onClick={handleBack} size="small" sx={{ color: "rgba(255,255,255,0.72)", p: 0.5 }}>
              <ArrowBackIosNewIcon sx={{ fontSize: "0.85rem" }} />
            </IconButton>
          )}
          <Typography sx={{ color: "#FFFFFF", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "0.95rem", flex: 1 }}>
            {catalogStep === "category" ? "Anunciar figurinha" : breadcrumb}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>

        {/* Banner sistema teste */}
        <Box sx={{ mb: 2, px: 1.5, py: 1, backgroundColor: "rgba(255,209,0,0.08)", border: "1px solid rgba(255,209,0,0.22)", borderRadius: CAZE_RADIUS.sm, display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,209,0,0.5)", fontWeight: 700, lineHeight: 1, mt: "2px", flexShrink: 0 }}>TESTE</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
            Sistema em versão teste. Apenas figurinhas da <strong style={{ color: "rgba(255,255,255,0.7)" }}>Seleção Brasil</strong> estão disponíveis: Paquetá, Neymar e Vini Jr.
          </Typography>
        </Box>

        {catalogStep === "category" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {CATEGORIES.map(({ key, label, Icon }) => {
              const disabled = key !== "selecao";
              return (
                <Box key={key} onClick={disabled ? undefined : () => handleCategoryClick(key)}
                  sx={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: CAZE_RADIUS.md, p: "14px 16px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.38 : 1, "&:hover": disabled ? {} : { borderColor: "#009440" }, transition: "border-color 0.15s" }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: CAZE_RADIUS.sm, backgroundColor: "rgba(0,133,66,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon sx={{ color: "#009440", fontSize: "1.2rem" }} />
                  </Box>
                  <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.875rem", flex: 1 }}>{label}</Typography>
                  <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.45)", fontSize: "1.1rem" }} />
                </Box>
              );
            })}
          </Box>
        )}

        {catalogStep === "team" && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {CATALOG.selecao.map((team, idx) => {
              const disabled = team.name !== "Brasil";
              return (
                <Box key={team.name}>
                  <Box onClick={disabled ? undefined : () => handleTeamClick(team.name)} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, px: 0.5, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.38 : 1, borderRadius: CAZE_RADIUS.sm, "&:hover": disabled ? {} : { backgroundColor: "rgba(0,133,66,0.08)" }, transition: "background-color 0.1s" }}>
                    {COUNTRY_CODES[team.name] && <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[team.name]}.png`} alt={team.name} width={24} height={16} style={{ borderRadius: 2, objectFit: "cover" }} />}
                    <Typography sx={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 500, flex: 1 }}>{team.name}</Typography>
                    <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }} />
                  </Box>
                  {idx < CATALOG.selecao.length - 1 && <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />}
                </Box>
              );
            })}
          </Box>
        )}

        {catalogStep === "player" && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {players.map((player, idx) => {
              const isSelected = player === selectedPlayer;
              const img = PLAYER_IMAGES[player];
              return (
                <Box key={player}>
                  <Box onClick={() => handlePlayerClick(player)} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.25, px: 0.5, cursor: "pointer", borderRadius: CAZE_RADIUS.sm, backgroundColor: isSelected ? "rgba(0,133,66,0.12)" : "transparent", "&:hover": { backgroundColor: isSelected ? "rgba(0,133,66,0.16)" : "rgba(255,255,255,0.04)" } }}>
                    {img
                      ? <Box component="img" src={img} alt={player} sx={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: isSelected ? "2px solid #009440" : "2px solid rgba(255,255,255,0.12)", flexShrink: 0 }} />
                      : <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    }
                    <Typography sx={{ color: isSelected ? "#009440" : "#FFFFFF", fontSize: "0.875rem", fontWeight: isSelected ? 700 : 400, flex: 1 }}>{player}</Typography>
                    {isSelected && <CheckCircleIcon sx={{ color: "#009440", fontSize: "1.1rem" }} />}
                  </Box>
                  {idx < players.length - 1 && <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {selectedPlayer && (
        <Box sx={{ px: 3, pt: 1.5, pb: 3, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <Box sx={{ backgroundColor: "rgba(0,133,66,0.10)", border: "1px solid rgba(0,133,66,0.30)", borderRadius: CAZE_RADIUS.sm, px: 2, py: 1, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            {PLAYER_IMAGES[selectedPlayer] && (
              <Box component="img" src={PLAYER_IMAGES[selectedPlayer]} alt={selectedPlayer} sx={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", objectPosition: "top" }} />
            )}
            <CheckCircleIcon sx={{ color: "#009440", fontSize: "1rem" }} />
            <Typography sx={{ color: "#009440", fontSize: "0.8rem", fontWeight: 600 }}>{selectedPlayer}</Typography>
          </Box>
          <CazeButton fullWidth onClick={handleConfirm}>Confirmar anúncio</CazeButton>
        </Box>
      )}
    </Drawer>
  );
}

// ── MeusAnunciosView ───────────────────────────────────────────────────────────

function MeusAnunciosView({ onAdd }: { onAdd: () => void }) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    try {
      setAnnouncements(JSON.parse(localStorage.getItem("figurinha_announcements") ?? "[]"));
    } catch { setAnnouncements([]); }
  }, []);

  if (announcements.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, px: 3, textAlign: "center", gap: 2 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FavoriteOutlinedIcon sx={{ color: "rgba(255,255,255,0.25)", fontSize: 32 }} />
        </Box>
        <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
          Nenhum anúncio ainda
        </Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
          Toque no + para anunciar uma figurinha que você tem para trocar.
        </Typography>
        <Box component="button" onClick={onAdd} sx={{ mt: 1, px: 3, py: 1.2, bgcolor: "#FFD100", border: 0, borderRadius: "12px", fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: "0.9rem", color: "#000", cursor: "pointer" }}>
          Anunciar figurinha
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {announcements.map((ann) => {
        const interested = MOCK_INTERESTED[ann.player] ?? [];
        return (
          <Box key={ann.id} sx={{ bgcolor: "#151c2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", display: "flex" }}>
            {/* Photo */}
            <Box sx={{ width: 90, flexShrink: 0, position: "relative" }}>
              {ann.image_url
                ? <Box component="img" src={ann.image_url} alt={ann.player} sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
                : <Box sx={{ width: "100%", height: "100%", bgcolor: "rgba(255,255,255,0.06)" }} />
              }
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, #151c2e 100%)" }} />
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, px: 2, py: 1.75, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: "1rem", color: "#fff", lineHeight: 1.2 }}>
                {ann.player}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", mt: 0.3, mb: 1.5 }}>
                {ann.team}
              </Typography>

              {interested.length > 0 ? (
                <Box
                  onClick={() => router.push(`/pages/user/figurinhas/chat/${interested[0].postId}`)}
                  sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:active": { opacity: 0.7 } }}
                >
                  {/* Avatar stack */}
                  <Box sx={{ display: "flex" }}>
                    {interested.slice(0, 3).map((u, i) => (
                      <Avatar key={u.name} src={u.avatar} sx={{ width: 26, height: 26, border: "2px solid #151c2e", ml: i === 0 ? 0 : "-8px", zIndex: 3 - i, fontSize: "0.6rem" }} />
                    ))}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.7rem", color: "#FFD100", fontWeight: 700, lineHeight: 1.2 }}>
                      {interested.length} {interested.length === 1 ? "match" : "matches"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.2 }}>
                      {interested[0].name}{interested.length > 1 ? ` e mais ${interested.length - 1}` : ""}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
                  Aguardando matches...
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ── página principal ───────────────────────────────────────────────────────────

export default function FigurinhasPage() {
  const router = useRouter();
  const [offers, setOffers]         = useState<TradeOffer[]>(MOCK_OFFERS);
  const [exiting, setExiting]       = useState(false);
  const [exitDir, setExitDir]       = useState<"left" | "right" | null>(null);
  const [matchOffer, setMatchOffer] = useState<TradeOffer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode]     = useState<ViewMode>("ofertas");

  const current = offers[0] ?? null;

  function saveMatch(offer: TradeOffer) {
    const match = { postId: offer.id, name: offer.user.name, avatar_url: offer.user.avatar_url, player: offer.player_name, image_url: offer.image_url ?? "", isNew: true, matchedAt: new Date().toISOString() };
    try {
      const existing = JSON.parse(localStorage.getItem("figurinha_matches") ?? "[]");
      if (!existing.find((m: { postId: string }) => m.postId === match.postId)) {
        localStorage.setItem("figurinha_matches", JSON.stringify([match, ...existing]));
      }
    } catch {}
  }

  function dismiss(dir: "left" | "right") {
    if (!current || exiting) return;
    setExitDir(dir);
    setExiting(true);
    setTimeout(() => {
      if (dir === "right") { saveMatch(current); setMatchOffer(current); }
      setOffers((prev) => { const next = prev.slice(1); return next.length === 0 ? MOCK_OFFERS : next; });
      setExiting(false);
      setExitDir(null);
    }, 350);
  }

  function handlePass() { dismiss("left"); }
  function handleWant() { dismiss("right"); }

  function handleOpenChat() {
    if (matchOffer) { setMatchOffer(null); router.push(`/pages/user/figurinhas/chat/${matchOffer.id}`); }
  }

  function handleConfirmAnnounce(player: string, team: string) {
    const ann: Announcement = {
      id: Date.now().toString(),
      player,
      team,
      image_url: PLAYER_IMAGES[player] ?? "",
      createdAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("figurinha_announcements") ?? "[]");
      localStorage.setItem("figurinha_announcements", JSON.stringify([ann, ...existing]));
    } catch {}
    setDrawerOpen(false);
    setViewMode("meus");
  }

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <PageAmbientBackground />
        <Sidebar />
        <Box
          component="main"
          sx={{ position: "relative", zIndex: 1, ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` }, height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0A1128" }}
        >
          <TopBar
            title="Figurinhas"
            rightSlot={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)", "&:hover": { color: "#F5C900" } }}>
                  <AddIcon sx={{ fontSize: "1.3rem" }} />
                </IconButton>
                <IconButton onClick={() => router.push("/pages/user/figurinhas/mensagens")} sx={{ color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)", "&:hover": { color: "#F5C900" } }}>
                  <Badge badgeContent={1} sx={{ "& .MuiBadge-badge": { backgroundColor: "#F5C900", color: "#000", fontSize: "0.55rem", minWidth: 14, height: 14, p: 0 } }}>
                    <ForumOutlinedIcon sx={{ fontSize: "1.3rem" }} />
                  </Badge>
                </IconButton>
              </Box>
            }
          />

          {/* Tabs */}
          <Box sx={{ display: "flex", gap: 1, px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}>
            {(["ofertas", "meus"] as ViewMode[]).map((mode) => (
              <Box
                key={mode}
                component="button"
                onClick={() => setViewMode(mode)}
                sx={{
                  flex: 1, py: 0.75, borderRadius: "100px", cursor: "pointer",
                  border: viewMode === mode ? "1px solid #008542" : "1px solid rgba(255,255,255,0.1)",
                  bgcolor: viewMode === mode ? "rgba(0,133,66,0.12)" : "transparent",
                  color: viewMode === mode ? "#fff" : "rgba(255,255,255,0.45)",
                  fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "0.8rem",
                  transition: "all 0.15s",
                }}
              >
                {mode === "ofertas" ? "Ofertas" : "Meus Anúncios"}
              </Box>
            ))}
          </Box>

          {/* Content */}
          {viewMode === "ofertas" ? (
            <Box sx={{ flex: 1, px: 1.5, pb: `${LAYOUT.bottomNavClearance + 8}px` }}>
              {current && (
                <TradeCard
                  key={current.id}
                  offer={current}
                  exiting={exiting}
                  exitDir={exitDir}
                  onPass={handlePass}
                  onWant={handleWant}
                />
              )}
            </Box>
          ) : (
            <MeusAnunciosView onAdd={() => setDrawerOpen(true)} />
          )}
        </Box>
      </Box>

      {matchOffer && (
        <MatchOverlay offer={matchOffer} onChat={handleOpenChat} onContinue={() => setMatchOffer(null)} />
      )}

      <AnnounceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onConfirm={handleConfirmAnnounce} />

      {!drawerOpen && !matchOffer && <BottomNav />}
    </>
  );
}
