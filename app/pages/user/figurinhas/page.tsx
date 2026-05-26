"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Box, Typography, Avatar, IconButton, Badge, Drawer,
  ToggleButton, ToggleButtonGroup,
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
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import CazeButton from "@/app/components/shared/CazeButton";

// ── tipos ──────────────────────────────────────────────────────────────────────

type Rarity = "common" | "rare" | "epic" | "legendary";
type PostType = "need" | "sell";
type CatalogStep = "category" | "team" | "player";
type CategoryKey = "selecao" | "tacas" | "escudos";

interface TradeOffer {
  id: string;
  user: { name: string; avatar_url: string | null };
  player_name: string;
  team: string;
  rarity: Rarity;
  number: number;
  image_url?: string;
}

interface StickerPost {
  id: string;
  type: PostType;
  user: { name: string; avatar_url: string | null };
  player_name: string;
  team: string;
  created_at: string;
}

// ── dados ──────────────────────────────────────────────────────────────────────

const COUNTRY_CODES: Record<string, string> = {
  "Brasil": "br", "Argentina": "ar", "França": "fr", "Alemanha": "de",
  "Inglaterra": "gb-eng", "Espanha": "es", "Portugal": "pt", "Holanda": "nl",
  "Bélgica": "be", "Croácia": "hr", "Marrocos": "ma", "Senegal": "sn",
  "Japão": "jp", "Coreia do Sul": "kr", "Austrália": "au", "Suíça": "ch",
  "Estados Unidos": "us", "México": "mx", "Canadá": "ca", "Uruguai": "uy",
  "Colômbia": "co", "Equador": "ec", "Sérvia": "rs", "Polônia": "pl",
};

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: "Comum",    color: "#94A3B8", bg: "linear-gradient(160deg,#1e293b,#0f172a)",       glow: "#94A3B8" },
  rare:      { label: "Rara",     color: "#60A5FA", bg: "linear-gradient(160deg,#1e3a8a,#0f172a)",       glow: "#3B82F6" },
  epic:      { label: "Épica",    color: "#C084FC", bg: "linear-gradient(160deg,#581c87,#1e1b4b)",       glow: "#A855F7" },
  legendary: { label: "Lendária", color: "#FCD34D", bg: "linear-gradient(160deg,#92400e,#1c1917)",       glow: "#F59E0B" },
};

const MOCK_OFFERS: TradeOffer[] = [
  { id: "1", user: { name: "Gabriel M.",   avatar_url: "https://i.pravatar.cc/80?img=3"  }, player_name: "Vinicius Jr.",       team: "Brasil",   rarity: "legendary", number: 42,  image_url: "/figurinhas/vinicius.jpeg"  },
  { id: "2", user: { name: "Maria Silva",  avatar_url: "https://i.pravatar.cc/80?img=5"  }, player_name: "Messi",              team: "Argentina",rarity: "legendary", number: 10,  image_url: "/figurinhas/messi.jpeg"     },
  { id: "3", user: { name: "Lucas F.",     avatar_url: "https://i.pravatar.cc/80?img=11" }, player_name: "Cristiano Ronaldo",  team: "Portugal", rarity: "epic",      number: 7,   image_url: "/figurinhas/cristiano.jpeg" },
  { id: "4", user: { name: "Ana Beatriz",  avatar_url: "https://i.pravatar.cc/80?img=9"  }, player_name: "Neymar",             team: "Brasil",   rarity: "epic",      number: 10,  image_url: "/figurinhas/neymar.jpeg"    },
  { id: "5", user: { name: "Pedro Alves",  avatar_url: "https://i.pravatar.cc/80?img=15" }, player_name: "Lucas Paquetá",      team: "Brasil",   rarity: "rare",      number: 23,  image_url: "/figurinhas/paqueta.jpeg"   },
];

const CATALOG: Record<CategoryKey, Array<{ name: string; players: string[] }>> = {
  selecao: [
    { name: "Brasil",    players: ["Alisson","Militão","Marquinhos","Casemiro","Lucas Paquetá","Raphinha","Vinicius Jr.","Rodrygo","Endrick","Pedro","Richarlison"] },
    { name: "Argentina", players: ["E. Martínez","Romero","Otamendi","De Paul","Enzo Fernández","Mac Allister","Messi","Lautaro Martínez","J. Álvarez","Di María"] },
    { name: "França",    players: ["Maignan","Upamecano","Saliba","Camavinga","Griezmann","Mbappé","Dembélé","Tchouameni","Rabiot"] },
    { name: "Alemanha",  players: ["Neuer","Kimmich","Rüdiger","Kroos","Gündogan","Müller","Havertz","Wirtz","Sané"] },
    { name: "Espanha",   players: ["Unai Simón","Carvajal","Le Normand","Pedri","Rodri","Fabián Ruiz","Yamal","Morata","Olmo"] },
    { name: "Portugal",  players: ["Diogo Costa","Rúben Dias","Vitinha","Bruno Fernandes","Bernardo Silva","Cristiano Ronaldo","Rafael Leão"] },
    { name: "Inglaterra",players: ["Pickford","Alexander-Arnold","Stones","Bellingham","Rice","Saka","Kane","Rashford"] },
  ],
  tacas:   [{ name: "Troféus",  players: ["Taça Jules Rimet","Taça FIFA","Troféu Copa 2026","Troféu Artilheiro","Troféu Melhor Jogador"] }],
  escudos: [{ name: "Escudos",  players: ["Escudo Brasil","Escudo Argentina","Escudo França","Escudo Alemanha","Escudo Espanha","Escudo Portugal","Escudo FIFA Copa 2026"] }],
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

function MatchOverlay({
  offer,
  onChat,
  onContinue,
}: {
  offer: TradeOffer;
  onChat: () => void;
  onContinue: () => void;
}) {
  const content = (
    <Box sx={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,148,64,0.25) 0%, transparent 70%), linear-gradient(160deg,#060d1a,#0a1128)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      px: 3,
      textAlign: "center",
    }}>
      {/* Avatares lado a lado */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0, mb: 4 }}>
        <Avatar
          src="https://i.pravatar.cc/80?img=25"
          sx={{ width: 80, height: 80, border: "3px solid #FFD100", zIndex: 1 }}
        />
        <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#009440", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, mx: -1.5, border: "2px solid #060d1a" }}>
          <FavoriteIcon sx={{ fontSize: 16, color: "#fff" }} />
        </Box>
        <Avatar
          src={offer.user.avatar_url ?? undefined}
          sx={{ width: 80, height: 80, border: "3px solid #009440", zIndex: 1 }}
        />
      </Box>

      <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: "2rem", color: "#FFD100", lineHeight: 1.1, mb: 1 }}>
        É um Match!
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", mb: 4 }}>
        Você e <strong style={{ color: "#fff" }}>{offer.user.name}</strong> querem trocar a figurinha do <strong style={{ color: "#fff" }}>{offer.player_name}</strong>!
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box
          component="button"
          onClick={onChat}
          sx={{
            py: 1.5, bgcolor: "#009440", border: 0, borderRadius: "12px",
            fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: "1rem", color: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
            "&:hover": { bgcolor: "#007a35" }, transition: "background-color 0.15s",
          }}
        >
          <ForumOutlinedIcon sx={{ fontSize: 20 }} />
          Abrir Chat
        </Box>
        <Box
          component="button"
          onClick={onContinue}
          sx={{
            py: 1.25, bgcolor: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "12px",
            fontFamily: '"Montserrat",sans-serif', fontWeight: 600, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)",
            cursor: "pointer", "&:hover": { borderColor: "#FFD100", color: "#FFD100" },
            transition: "border-color 0.15s, color 0.15s",
          }}
        >
          Continuar vendo ofertas
        </Box>
      </Box>
    </Box>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── TradeCard ──────────────────────────────────────────────────────────────────

function TradeCard({ offer, exiting, exitDir }: { offer: TradeOffer; exiting: boolean; exitDir: "left" | "right" | null }) {
  const cfg = RARITY_CONFIG[offer.rarity];
  const flag = flagUrl(offer.team);

  return (
    <Box sx={{
      width: "100%",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: `0 8px 64px ${cfg.glow}40, 0 2px 20px rgba(0,0,0,0.6)`,
      border: `1.5px solid ${cfg.color}40`,
      transform: exiting
        ? exitDir === "left"
          ? "translateX(-120%) rotate(-12deg)"
          : "translateX(120%) rotate(12deg)"
        : "translateX(0) rotate(0deg)",
      opacity: exiting ? 0 : 1,
      transition: "transform 0.35s ease-in, opacity 0.35s ease-in",
    }}>
      {/* Sticker visual */}
      <Box sx={{
        background: cfg.bg,
        px: 4, pt: 5, pb: 4,
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative",
        minHeight: 380,
        justifyContent: "center",
      }}>
        {/* Rarity badge */}
        <Box sx={{
          position: "absolute", top: 18, right: 18,
          bgcolor: `${cfg.color}20`,
          border: `1px solid ${cfg.color}60`,
          borderRadius: "100px",
          px: 1.5, py: 0.4,
        }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: cfg.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {cfg.label}
          </Typography>
        </Box>

        {/* Number */}
        <Typography sx={{ position: "absolute", top: 18, left: 20, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
          #{offer.number}
        </Typography>

        {/* Player photo */}
        {offer.image_url ? (
          <Box sx={{ position: "relative", mb: 2.5, mt: 1 }}>
            <Box
              component="img"
              src={offer.image_url}
              alt={offer.player_name}
              sx={{
                width: 180,
                height: 180,
                objectFit: "cover",
                objectPosition: "top center",
                borderRadius: "50%",
                border: `3px solid ${cfg.color}60`,
                boxShadow: `0 0 40px ${cfg.glow}50, 0 8px 24px rgba(0,0,0,0.6)`,
              }}
            />
            {/* Flag badge over photo */}
            {flag && (
              <Box
                component="img"
                src={flag}
                alt={offer.team}
                sx={{
                  position: "absolute",
                  bottom: 4, right: 4,
                  width: 36, height: 24,
                  objectFit: "cover",
                  borderRadius: "4px",
                  border: "2px solid rgba(0,0,0,0.4)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              />
            )}
          </Box>
        ) : flag ? (
          <Box
            component="img"
            src={flag}
            alt={offer.team}
            sx={{ width: 110, height: 74, objectFit: "cover", borderRadius: "10px", mb: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}
          />
        ) : (
          <Box sx={{ width: 110, height: 74, bgcolor: "rgba(255,255,255,0.08)", borderRadius: "10px", mb: 3 }} />
        )}

        <Typography sx={{
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 900,
          fontSize: "2rem",
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.1,
          textShadow: `0 0 30px ${cfg.glow}90`,
        }}>
          {offer.player_name}
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", mt: 1 }}>
          {offer.team}
        </Typography>
      </Box>

      {/* Offering user */}
      <Box sx={{
        bgcolor: "#0d1526",
        px: 4, py: 2.5,
        display: "flex", alignItems: "center", gap: 2,
        borderTop: `1px solid ${cfg.color}20`,
      }}>
        <Avatar src={offer.user.avatar_url ?? undefined} sx={{ width: 48, height: 48, border: `2px solid ${cfg.color}50` }}>
          {!offer.user.avatar_url && offer.user.name[0]}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.2 }}>
            está oferecendo
          </Typography>
          <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
            {offer.user.name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── AnnounceDrawer ─────────────────────────────────────────────────────────────

function AnnounceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [postType,         setPostType]         = useState<PostType>("need");
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {catalogStep !== "category" && (
            <IconButton onClick={handleBack} size="small" sx={{ color: "rgba(255,255,255,0.72)", p: 0.5 }}>
              <ArrowBackIosNewIcon sx={{ fontSize: "0.85rem" }} />
            </IconButton>
          )}
          <Typography sx={{ color: "#FFFFFF", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "0.95rem", flex: 1 }}>
            {catalogStep === "category" ? "Anunciar figurinha" : breadcrumb}
          </Typography>
        </Box>
        <ToggleButtonGroup value={postType} exclusive onChange={(_, v) => v && setPostType(v)} fullWidth size="small"
          sx={{ backgroundColor: "#1A1A2E", borderRadius: CAZE_RADIUS.sm }}
        >
          <ToggleButton value="need" sx={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", textTransform: "none", fontWeight: 700, fontSize: "0.8rem", "&.Mui-selected": { backgroundColor: "rgba(232,23,93,0.12)", color: "#E8175D", borderColor: "#E8175D" } }}>
            Precisando
          </ToggleButton>
          <ToggleButton value="sell" sx={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", textTransform: "none", fontWeight: 700, fontSize: "0.8rem", "&.Mui-selected": { backgroundColor: "rgba(0,133,66,0.12)", color: "#008542", borderColor: "#008542" } }}>
            Tenho para trocar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
        {catalogStep === "category" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {CATEGORIES.map(({ key, label, Icon }) => (
              <Box key={key} onClick={() => handleCategoryClick(key)}
                sx={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: "#1A1A2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: CAZE_RADIUS.md, p: "14px 16px", cursor: "pointer", "&:hover": { borderColor: "#009440" }, transition: "border-color 0.15s" }}
              >
                <Box sx={{ width: 36, height: 36, borderRadius: CAZE_RADIUS.sm, backgroundColor: "rgba(0,133,66,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon sx={{ color: "#009440", fontSize: "1.2rem" }} />
                </Box>
                <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.875rem", flex: 1 }}>{label}</Typography>
                <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.45)", fontSize: "1.1rem" }} />
              </Box>
            ))}
          </Box>
        )}
        {catalogStep === "team" && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {CATALOG.selecao.map((team, idx) => (
              <Box key={team.name}>
                <Box onClick={() => handleTeamClick(team.name)} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, px: 0.5, cursor: "pointer", borderRadius: CAZE_RADIUS.sm, "&:hover": { backgroundColor: "rgba(0,133,66,0.08)" }, transition: "background-color 0.1s" }}>
                  {COUNTRY_CODES[team.name] && <img src={`https://flagcdn.com/w40/${COUNTRY_CODES[team.name]}.png`} alt={team.name} width={24} height={16} style={{ borderRadius: 2, objectFit: "cover" }} />}
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 500, flex: 1 }}>{team.name}</Typography>
                  <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }} />
                </Box>
                {idx < CATALOG.selecao.length - 1 && <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />}
              </Box>
            ))}
          </Box>
        )}
        {catalogStep === "player" && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {players.map((player, idx) => {
              const isSelected = player === selectedPlayer;
              return (
                <Box key={player}>
                  <Box onClick={() => handlePlayerClick(player)} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, px: 0.5, cursor: "pointer", borderRadius: CAZE_RADIUS.sm, backgroundColor: isSelected ? "rgba(0,133,66,0.12)" : "transparent", "&:hover": { backgroundColor: isSelected ? "rgba(0,133,66,0.16)" : "rgba(255,255,255,0.04)" } }}>
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
          <Box sx={{ backgroundColor: "rgba(0,133,66,0.10)", border: "1px solid rgba(0,133,66,0.30)", borderRadius: CAZE_RADIUS.sm, px: 2, py: 1, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ color: "#009440", fontSize: "1rem" }} />
            <Typography sx={{ color: "#009440", fontSize: "0.8rem", fontWeight: 600 }}>{selectedPlayer}</Typography>
          </Box>
          <CazeButton fullWidth onClick={() => { reset(); onClose(); }}>Confirmar anúncio</CazeButton>
        </Box>
      )}
    </Drawer>
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

  const current = offers[0] ?? null;

  function dismiss(dir: "left" | "right") {
    if (!current || exiting) return;
    setExitDir(dir);
    setExiting(true);
    setTimeout(() => {
      if (dir === "right") setMatchOffer(current);
      setOffers((prev) => prev.slice(1));
      setExiting(false);
      setExitDir(null);
    }, 350);
  }

  function handlePass() { dismiss("left"); }
  function handleWant() { dismiss("right"); }

  function handleOpenChat() {
    if (matchOffer) {
      setMatchOffer(null);
      router.push(`/pages/user/figurinhas/chat/${matchOffer.id}`);
    }
  }

  function handleContinue() { setMatchOffer(null); }

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <PageAmbientBackground />
        <Sidebar />
        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            backgroundColor: "#0A1128",
          }}
        >
          <TopBar
            title="Figurinhas"
            rightSlot={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton onClick={() => setDrawerOpen(true)}
                  sx={{ color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)", "&:hover": { color: "#F5C900" } }}
                >
                  <AddIcon sx={{ fontSize: "1.3rem" }} />
                </IconButton>
                <IconButton onClick={() => router.push("/pages/user/figurinhas/mensagens")}
                  sx={{ color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)", "&:hover": { color: "#F5C900" } }}
                >
                  <Badge badgeContent={1} sx={{ "& .MuiBadge-badge": { backgroundColor: "#F5C900", color: "#000", fontSize: "0.55rem", minWidth: 14, height: 14, p: 0 } }}>
                    <ForumOutlinedIcon sx={{ fontSize: "1.3rem" }} />
                  </Badge>
                </IconButton>
              </Box>
            }
          />

          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            px: 1.5,
            pt: 2,
          }}>
            {/* counter */}
            <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", mb: 2, letterSpacing: "0.06em" }}>
              {offers.length > 0 ? `${offers.length} oferta${offers.length > 1 ? "s" : ""} disponível${offers.length > 1 ? "s" : ""}` : ""}
            </Typography>

            {current ? (
              <>
                {/* Card */}
                <TradeCard offer={current} exiting={exiting} exitDir={exitDir} />

                {/* Action buttons */}
                <Box sx={{ display: "flex", gap: 4, mt: 4, alignItems: "center" }}>
                  {/* Não */}
                  <Box
                    component="button"
                    onClick={handlePass}
                    disabled={exiting}
                    sx={{
                      width: 64, height: 64,
                      borderRadius: "50%",
                      bgcolor: "rgba(239,68,68,0.12)",
                      border: "2px solid rgba(239,68,68,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      transition: "transform 0.1s, background-color 0.15s",
                      "&:hover": { bgcolor: "rgba(239,68,68,0.22)", transform: "scale(1.08)" },
                      "&:active": { transform: "scale(0.95)" },
                    }}
                  >
                    <CloseIcon sx={{ color: "#EF4444", fontSize: 28 }} />
                  </Box>

                  {/* Quero */}
                  <Box
                    component="button"
                    onClick={handleWant}
                    disabled={exiting}
                    sx={{
                      width: 72, height: 72,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,148,64,0.15)",
                      border: "2px solid rgba(0,148,64,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                      transition: "transform 0.1s, background-color 0.15s",
                      "&:hover": { bgcolor: "rgba(0,148,64,0.28)", transform: "scale(1.08)" },
                      "&:active": { transform: "scale(0.95)" },
                    }}
                  >
                    <FavoriteIcon sx={{ color: "#009440", fontSize: 32 }} />
                  </Box>
                </Box>

                {/* Labels */}
                <Box sx={{ display: "flex", gap: 5.5, mt: 1 }}>
                  <Typography sx={{ fontSize: "0.65rem", color: "rgba(239,68,68,0.7)", fontWeight: 700, width: 64, textAlign: "center" }}>Não</Typography>
                  <Typography sx={{ fontSize: "0.65rem", color: "rgba(0,148,64,0.7)", fontWeight: 700, width: 72, textAlign: "center" }}>Quero!</Typography>
                </Box>
              </>
            ) : (
              /* Empty state */
              <Box sx={{ textAlign: "center", pt: 8 }}>
                <Typography sx={{ fontSize: "3rem", mb: 2 }}>📭</Typography>
                <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: "1.1rem", color: "#fff", mb: 1 }}>
                  Você viu tudo por hoje!
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", mb: 3 }}>
                  Volte mais tarde ou anuncie suas repetidas.
                </Typography>
                <Box
                  component="button"
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    px: 3, py: 1.2,
                    bgcolor: "#FFD100", border: 0, borderRadius: "12px",
                    fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: "0.9rem", color: "#000",
                    cursor: "pointer",
                  }}
                >
                  Anunciar figurinha
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {matchOffer && (
        <MatchOverlay offer={matchOffer} onChat={handleOpenChat} onContinue={handleContinue} />
      )}

      <AnnounceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {!drawerOpen && !matchOffer && <BottomNav />}
    </>
  );
}
