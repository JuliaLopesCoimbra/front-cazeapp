"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Tabs, Tab, Avatar, Chip,
  Drawer, ToggleButton, ToggleButtonGroup,
  IconButton, Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PublicIcon from "@mui/icons-material/Public";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import CazeButton from "@/app/components/shared/CazeButton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── tipos ─────────────────────────────────────────────────────────────────────

type PostType = "need" | "sell";
type TabValue = "need" | "sell" | "myads";
type CategoryKey = "selecao" | "tacas" | "escudos";
type CatalogStep = "category" | "team" | "player";

interface StickerPost {
  id: string;
  type: PostType;
  user: { name: string; avatar_url: string | null };
  player_name: string;
  team: string;
  created_at: string;
}

// ── catálogo de figurinhas ────────────────────────────────────────────────────

const COUNTRY_CODES: Record<string, string> = {
  "Brasil": "br", "Argentina": "ar", "França": "fr", "Alemanha": "de",
  "Inglaterra": "gb-eng", "Espanha": "es", "Portugal": "pt", "Holanda": "nl",
  "Bélgica": "be", "Croácia": "hr", "Marrocos": "ma", "Senegal": "sn",
  "Japão": "jp", "Coreia do Sul": "kr", "Austrália": "au", "Suíça": "ch",
  "Estados Unidos": "us", "México": "mx", "Canadá": "ca", "Uruguai": "uy",
  "Colômbia": "co", "Equador": "ec", "Sérvia": "rs", "Polônia": "pl",
  "Dinamarca": "dk", "Turquia": "tr", "Ucrânia": "ua", "Áustria": "at",
};

const CATALOG: Record<CategoryKey, Array<{ name: string; players: string[] }>> = {
  selecao: [
    { name: "Brasil",       players: ["Alisson", "Éderson", "Weverton", "Danilo", "Militão", "Marquinhos", "Bremer", "Wendell", "Casemiro", "Lucas Paquetá", "Bruno Guimarães", "Gerson", "Raphinha", "Vinicius Jr.", "Rodrygo", "Gabriel Martinelli", "Endrick", "Pedro", "Richarlison"] },
    { name: "Argentina",    players: ["E. Martínez", "N. Molina", "Romero", "Otamendi", "Acuña", "De Paul", "Enzo Fernández", "Mac Allister", "Messi", "Lautaro Martínez", "J. Álvarez", "Di María"] },
    { name: "França",       players: ["Maignan", "Pavard", "Upamecano", "Saliba", "T. Hernandez", "Tchouameni", "Camavinga", "Griezmann", "Mbappé", "Dembélé", "Giroud", "Rabiot"] },
    { name: "Alemanha",     players: ["Neuer", "Kimmich", "Rüdiger", "Schlotterbeck", "Raum", "Kroos", "Gündogan", "Müller", "Gnabry", "Havertz", "Wirtz", "Sané"] },
    { name: "Espanha",      players: ["Unai Simón", "Carvajal", "Le Normand", "Laporte", "Cucurella", "Pedri", "Rodri", "Fabián Ruiz", "Yamal", "Morata", "Ferran Torres", "Olmo"] },
    { name: "Portugal",     players: ["Diogo Costa", "J. Cancelo", "Rúben Dias", "Pepe", "N. Mendes", "Vitinha", "Bruno Fernandes", "Bernardo Silva", "Cristiano Ronaldo", "Rafael Leão", "G. Ramos"] },
    { name: "Inglaterra",   players: ["Pickford", "Alexander-Arnold", "Stones", "Maguire", "Shaw", "Bellingham", "Rice", "Saka", "Rashford", "Kane", "Sterling", "Grealish"] },
    { name: "Holanda",      players: ["Flekken", "Dumfries", "De Vrij", "Van Dijk", "Blind", "De Jong", "De Roon", "Gakpo", "Bergwijn", "Depay", "Xavi Simons"] },
    { name: "México",       players: ["Ochoa", "Sánchez", "Moreno", "Montes", "Gallardo", "E. Álvarez", "Herrera", "H. Lozano", "Martín", "Jiménez", "Vega"] },
    { name: "Estados Unidos", players: ["Turner", "Dest", "Richards", "Long", "Robinson", "McKennie", "Musah", "Reyna", "Weah", "Pulisic", "Ferreira"] },
    { name: "Uruguai",      players: ["Rochet", "Nández", "Giménez", "Godín", "Olivera", "Valverde", "Bentancur", "Vecino", "De Arrascaeta", "Suárez", "Núñez", "Pellistri"] },
    { name: "Colômbia",     players: ["Vargas", "Muñoz", "Dávinson", "Cuesta", "Mojica", "Lerma", "Uribe", "J. Díaz", "J. Rodríguez", "Borré", "Córdoba"] },
    { name: "Senegal",      players: ["E. Mendy", "Sabaly", "Koulibaly", "Niakhate", "Jakobs", "Gana Gueye", "P. Gueye", "Diatta", "Mané", "Dia", "Diedhiou"] },
    { name: "Marrocos",     players: ["Bounou", "Hakimi", "El Yamiq", "Aguerd", "Mazraoui", "Amrabat", "Ounahi", "Ziyech", "En-Nesyri", "Boufal", "Sabiri"] },
    { name: "Japão",        players: ["Gonda", "Tomiyasu", "Itakura", "Yoshida", "Nagatomo", "Endo", "Tanaka", "Kamada", "Doan", "Minamino", "Asano"] },
    { name: "Coreia do Sul", players: ["Kim Seung-gyu", "Kim Moon-hwan", "Kim Min-jae", "Kwon Kyung-won", "Kim Jin-su", "Hwang In-beom", "Son Heung-min", "Lee Jae-sung", "Hwang Hee-chan", "Cho Gue-sung"] },
  ],
  tacas: [
    { name: "Troféus", players: ["Taça Jules Rimet", "Taça FIFA", "Troféu Copa 2026", "Troféu de Artilheiro", "Troféu Melhor Jogador", "Troféu Melhor Goleiro", "Troféu Fair Play"] },
  ],
  escudos: [
    { name: "Escudos", players: ["Escudo Brasil", "Escudo Argentina", "Escudo França", "Escudo Alemanha", "Escudo Espanha", "Escudo Portugal", "Escudo Inglaterra", "Escudo Holanda", "Escudo México", "Escudo Estados Unidos", "Escudo Uruguai", "Escudo Colômbia", "Escudo Senegal", "Escudo Marrocos", "Escudo Japão", "Escudo FIFA Copa 2026"] },
  ],
};

const CATEGORIES = [
  { key: "selecao" as CategoryKey, label: "Seleção",  Icon: PublicIcon,               color: "#F5C900" },
  { key: "tacas"   as CategoryKey, label: "Taças",    Icon: EmojiEventsOutlinedIcon,  color: "#F5C900" },
  { key: "escudos" as CategoryKey, label: "Escudos",  Icon: ShieldOutlinedIcon,       color: "#F5C900" },
];

// ── mock de posts ─────────────────────────────────────────────────────────────

const MOCK: StickerPost[] = [
  { id: "1", type: "need", user: { name: "Gabriel M.",     avatar_url: null }, player_name: "Vinicius Jr.", team: "Brasil",     created_at: new Date(Date.now() - 1000*60*30).toISOString() },
  { id: "2", type: "need", user: { name: "Maria Silva",    avatar_url: null }, player_name: "Endrick",      team: "Brasil",     created_at: new Date(Date.now() - 1000*60*60*2).toISOString() },
  { id: "3", type: "need", user: { name: "Lucas Ferreira", avatar_url: null }, player_name: "Mbappé",       team: "França",     created_at: new Date(Date.now() - 1000*60*60*5).toISOString() },
  { id: "4", type: "need", user: { name: "Ana Beatriz",    avatar_url: null }, player_name: "Bellingham",   team: "Inglaterra", created_at: new Date(Date.now() - 1000*60*60*8).toISOString() },
  { id: "5", type: "sell", user: { name: "Pedro Alves",    avatar_url: null }, player_name: "Neymar Jr.",   team: "Brasil",     created_at: new Date(Date.now() - 1000*60*45).toISOString() },
  { id: "6", type: "sell", user: { name: "Fernanda C.",    avatar_url: null }, player_name: "Messi",        team: "Argentina",  created_at: new Date(Date.now() - 1000*60*60*3).toISOString() },
  { id: "7", type: "sell", user: { name: "Rafael S.",      avatar_url: null }, player_name: "Rodrygo",      team: "Brasil",     created_at: new Date(Date.now() - 1000*60*60*6).toISOString() },
];

function timeAgo(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

// ── componente PostCard ───────────────────────────────────────────────────────

function PostCard({
  post,
  onContact,
  onRemove,
}: {
  post: StickerPost;
  onContact?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const isNeed = post.type === "need";
  return (
    <Box sx={{
      backgroundColor: "#1A1A1A", borderRadius: "12px", p: 2,
      border: `1px solid ${isNeed ? "rgba(230,57,70,0.25)" : "rgba(34,197,94,0.25)"}`,
      display: "flex", gap: 2, alignItems: "flex-start",
    }}>
      <Avatar sx={{ width: 40, height: 40, backgroundColor: "#333", fontSize: "0.875rem", flexShrink: 0 }}>
        {post.user.name[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ color: "#FFF", fontWeight: 700, fontSize: "0.875rem" }}>{post.user.name}</Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem" }}>{timeAgo(post.created_at)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Chip
            label={isNeed ? "Preciso" : "Vendendo"}
            size="small"
            sx={{
              backgroundColor: isNeed ? "rgba(230,57,70,0.15)" : "rgba(34,197,94,0.15)",
              color: isNeed ? "#E63946" : "#22c55e",
              fontWeight: 700, fontSize: "0.65rem", height: 20,
            }}
          />
          <Typography sx={{ color: "#F5C900", fontWeight: 700, fontSize: "0.875rem" }}>{post.player_name}</Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem" }}>· {post.team}</Typography>
        </Box>
        {onContact && (
          <CazeButton variant="secondary" onClick={() => onContact(post.id)}>
            Entrar em contato
          </CazeButton>
        )}
        {onRemove && (
          <CazeButton variant="secondary" onClick={() => onRemove(post.id)}>
            Remover anúncio
          </CazeButton>
        )}
      </Box>
    </Box>
  );
}

// ── AnnounceDrawer ────────────────────────────────────────────────────────────

function TeamFlag({ name }: { name: string }) {
  const code = COUNTRY_CODES[name];
  if (!code) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name}
      width={24}
      height={16}
      style={{ borderRadius: 2, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

function AnnounceDrawer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<StickerPost, "id" | "created_at" | "user">) => void;
}) {
  const [postType,         setPostType]         = useState<PostType>("need");
  const [catalogStep,      setCatalogStep]      = useState<CatalogStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedTeam,     setSelectedTeam]     = useState<string | null>(null);
  const [selectedPlayer,   setSelectedPlayer]   = useState<string | null>(null);

  function reset() {
    setCatalogStep("category");
    setSelectedCategory(null);
    setSelectedTeam(null);
    setSelectedPlayer(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCategoryClick(cat: CategoryKey) {
    setSelectedCategory(cat);
    setSelectedPlayer(null);
    setSelectedTeam(null);
    if (cat === "selecao") {
      setCatalogStep("team");
    } else {
      // taças e escudos têm apenas um grupo direto
      setSelectedTeam(CATALOG[cat][0].name);
      setCatalogStep("player");
    }
  }

  function handleTeamClick(team: string) {
    setSelectedTeam(team);
    setSelectedPlayer(null);
    setCatalogStep("player");
  }

  function handlePlayerClick(player: string) {
    setSelectedPlayer(player === selectedPlayer ? null : player);
  }

  function handleBack() {
    if (catalogStep === "player" && selectedCategory === "selecao") {
      setCatalogStep("team");
      setSelectedPlayer(null);
    } else {
      setCatalogStep("category");
      setSelectedCategory(null);
      setSelectedTeam(null);
      setSelectedPlayer(null);
    }
  }

  function handleConfirm() {
    if (!selectedPlayer) return;
    onSubmit({
      type: postType,
      player_name: selectedPlayer,
      team: selectedTeam ?? "—",
    });
    reset();
    onClose();
  }

  const players = selectedCategory && selectedTeam
    ? CATALOG[selectedCategory].find((t) => t.name === selectedTeam)?.players ?? []
    : [];

  // breadcrumb text
  const breadcrumb = catalogStep === "team"
    ? CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? ""
    : catalogStep === "player"
    ? [CATEGORIES.find((c) => c.key === selectedCategory)?.label, selectedTeam].filter(Boolean).join(" › ")
    : "";

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: "#111",
          borderRadius: "20px 20px 0 0",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* drag handle */}
      <Box sx={{ pt: 2, pb: 0.5, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <Box sx={{ width: 40, height: 4, backgroundColor: "#2A2A2A", borderRadius: "2px" }} />
      </Box>

      {/* header fixo */}
      <Box sx={{ px: 3, pt: 1.5, pb: 2, flexShrink: 0 }}>
        {/* título + back */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {catalogStep !== "category" && (
            <IconButton onClick={handleBack} size="small" sx={{ color: "#9E9E9E", p: 0.5 }}>
              <ArrowBackIosNewIcon sx={{ fontSize: "0.85rem" }} />
            </IconButton>
          )}
          <Typography sx={{ color: "#FFF", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "0.95rem", flex: 1 }}>
            {catalogStep === "category" ? "Anunciar figurinha" : breadcrumb}
          </Typography>
        </Box>

        {/* toggle tipo */}
        <ToggleButtonGroup
          value={postType}
          exclusive
          onChange={(_, v) => v && setPostType(v)}
          fullWidth
          size="small"
          sx={{ mb: 0 }}
        >
          <ToggleButton value="need" sx={{
            borderColor: "#2A2A2A", color: "#9E9E9E", textTransform: "none", fontWeight: 700, fontSize: "0.8rem",
            "&.Mui-selected": { backgroundColor: "rgba(230,57,70,0.15)", color: "#E63946", borderColor: "#E63946" },
          }}>
            Precisando
          </ToggleButton>
          <ToggleButton value="sell" sx={{
            borderColor: "#2A2A2A", color: "#9E9E9E", textTransform: "none", fontWeight: 700, fontSize: "0.8rem",
            "&.Mui-selected": { backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", borderColor: "#22c55e" },
          }}>
            Tenho para Vender
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: "1px", backgroundColor: "#1E1E1E", flexShrink: 0 }} />

      {/* conteúdo rolável */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>

        {/* step: categoria */}
        {catalogStep === "category" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography sx={{ color: "#555", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.5 }}>
              Categoria
            </Typography>
            {CATEGORIES.map(({ key, label, Icon }) => (
              <Box
                key={key}
                onClick={() => handleCategoryClick(key)}
                sx={{
                  display: "flex", alignItems: "center", gap: 2,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "12px",
                  p: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#F5C900", backgroundColor: "#1E1E1E" },
                }}
              >
                <Box sx={{
                  width: 36, height: 36, borderRadius: "10px",
                  backgroundColor: "rgba(245,201,0,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon sx={{ color: "#F5C900", fontSize: "1.2rem" }} />
                </Box>
                <Typography sx={{ color: "#FFF", fontWeight: 600, fontSize: "0.875rem", flex: 1 }}>
                  {label}
                </Typography>
                <ChevronRightIcon sx={{ color: "#444", fontSize: "1.1rem" }} />
              </Box>
            ))}
          </Box>
        )}

        {/* step: seleções */}
        {catalogStep === "team" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography sx={{ color: "#555", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
              Escolha a seleção
            </Typography>
            {CATALOG.selecao.map((team, idx) => (
              <Box key={team.name}>
                <Box
                  onClick={() => handleTeamClick(team.name)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 2,
                    py: 1.5, px: 0.5,
                    cursor: "pointer", borderRadius: "10px",
                    "&:hover": { backgroundColor: "#1A1A1A" },
                    transition: "background-color 0.1s",
                  }}
                >
                  <TeamFlag name={team.name} />
                  <Typography sx={{ color: "#FFF", fontSize: "0.875rem", fontWeight: 500, flex: 1 }}>
                    {team.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ color: "#444", fontSize: "0.7rem" }}>
                      {team.players.length} fig.
                    </Typography>
                    <ChevronRightIcon sx={{ color: "#333", fontSize: "1rem" }} />
                  </Box>
                </Box>
                {idx < CATALOG.selecao.length - 1 && (
                  <Box sx={{ height: "1px", backgroundColor: "#1A1A1A" }} />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* step: jogadores/itens */}
        {catalogStep === "player" && (
          <Box>
            <Typography sx={{ color: "#555", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
              Escolha a figurinha
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {players.map((player, idx) => {
                const isSelected = player === selectedPlayer;
                return (
                  <Box key={player}>
                    <Box
                      onClick={() => handlePlayerClick(player)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 2,
                        py: 1.5, px: 0.5,
                        cursor: "pointer", borderRadius: "10px",
                        backgroundColor: isSelected ? "rgba(245,201,0,0.08)" : "transparent",
                        "&:hover": { backgroundColor: isSelected ? "rgba(245,201,0,0.1)" : "#1A1A1A" },
                        transition: "background-color 0.1s",
                      }}
                    >
                      <Typography sx={{ color: isSelected ? "#F5C900" : "#FFF", fontSize: "0.875rem", fontWeight: isSelected ? 700 : 400, flex: 1 }}>
                        {player}
                      </Typography>
                      {isSelected && <CheckCircleIcon sx={{ color: "#F5C900", fontSize: "1.1rem" }} />}
                    </Box>
                    {idx < players.length - 1 && (
                      <Box sx={{ height: "1px", backgroundColor: "#1A1A1A" }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* rodapé fixo */}
      {selectedPlayer && (
        <Box sx={{ px: 3, pt: 1.5, pb: 3, borderTop: "1px solid #1E1E1E", flexShrink: 0 }}>
          <Box sx={{
            backgroundColor: "rgba(245,201,0,0.08)",
            border: "1px solid rgba(245,201,0,0.25)",
            borderRadius: "10px",
            px: 2, py: 1,
            mb: 2,
            display: "flex", alignItems: "center", gap: 1,
          }}>
            <CheckCircleIcon sx={{ color: "#F5C900", fontSize: "1rem" }} />
            <Typography sx={{ color: "#F5C900", fontSize: "0.8rem", fontWeight: 600 }}>
              {selectedPlayer}
              {selectedTeam && selectedCategory === "selecao" && (
                <Typography component="span" sx={{ color: "#9E9E9E", fontWeight: 400 }}>
                  {" "}· {selectedTeam}
                </Typography>
              )}
            </Typography>
          </Box>
          <CazeButton fullWidth onClick={handleConfirm}>
            Confirmar anúncio
          </CazeButton>
        </Box>
      )}
    </Drawer>
  );
}

// ── página principal ──────────────────────────────────────────────────────────

export default function FigurinhasPage() {
  const router = useRouter();
  const [tab, setTab]               = useState<TabValue>("need");
  const [posts, setPosts]           = useState<StickerPost[]>(MOCK);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const communityPosts = posts.filter((p) => p.user.name !== "Você");
  const myPosts        = posts.filter((p) => p.user.name === "Você");

  const displayed =
    tab === "myads" ? myPosts :
    tab === "need"  ? communityPosts.filter((p) => p.type === "need") :
                      communityPosts.filter((p) => p.type === "sell");

  const needCount  = communityPosts.filter((p) => p.type === "need").length;
  const sellCount  = communityPosts.filter((p) => p.type === "sell").length;
  const myAdsCount = myPosts.length;

  function handleContact(postId: string) {
    router.push(`/pages/user/figurinhas/chat/${postId}`);
  }

  function handleRemove(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  function handleAnnounce(data: Omit<StickerPost, "id" | "created_at" | "user">) {
    const newPost: StickerPost = {
      ...data,
      id: String(Date.now()),
      user: { name: "Você", avatar_url: null },
      created_at: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setTab("myads");
  }

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "120px" }}>
      <TopBar
        title="Figurinhas"
        rightSlot={
          <IconButton
            onClick={() => router.push("/pages/user/figurinhas/mensagens")}
            sx={{ color: "#9E9E9E", "&:hover": { color: "#F5C900" } }}
            aria-label="Histórico de mensagens"
          >
            <Badge badgeContent={1} sx={{ "& .MuiBadge-badge": { backgroundColor: "#F5C900", color: "#000", fontSize: "0.55rem", minWidth: 14, height: 14, p: 0 } }}>
              <ForumOutlinedIcon sx={{ fontSize: "1.3rem" }} />
            </Badge>
          </IconButton>
        }
      />

      <Box sx={{ px: 2, pt: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as TabValue)}
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": { backgroundColor: "#F5C900" },
            "& .MuiTab-root": { color: "#9E9E9E", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "0.75rem", textTransform: "none", minWidth: "auto", px: 1.5 },
            "& .Mui-selected": { color: "#F5C900" },
          }}
        >
          <Tab value="need"   label={`Precisando (${needCount})`} />
          <Tab value="sell"   label={`Vendendo (${sellCount})`} />
          <Tab value="myads"  label={`Meus anúncios${myAdsCount > 0 ? ` (${myAdsCount})` : ""}`} />
        </Tabs>

        {displayed.length === 0 ? (
          <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 6 }}>
            {tab === "need"   && "Ninguém precisando ainda. Seja o primeiro!"}
            {tab === "sell"   && "Ninguém vendendo ainda. Compartilhe!"}
            {tab === "myads"  && "Você ainda não fez nenhum anúncio."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {displayed.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onContact={tab !== "myads" ? handleContact : undefined}
                onRemove={tab === "myads" ? handleRemove : undefined}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* FAB */}
      <Box
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: "fixed", bottom: "90px", right: "20px",
          width: 52, height: 52, borderRadius: "50%",
          backgroundColor: "#F5C900",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(245,201,0,0.4)",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.08)" },
          zIndex: 100,
        }}
      >
        <AddIcon sx={{ color: "#000", fontSize: "1.5rem" }} />
      </Box>

      <AnnounceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleAnnounce}
      />

      {!drawerOpen && <BottomNav />}
    </Box>
  );
}
