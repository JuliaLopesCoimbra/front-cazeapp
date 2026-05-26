"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TopBar from "@/app/components/layout/TopBar";
import BottomNav from "@/app/components/layout/BottomNav";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Match {
  postId: string;
  name: string;
  avatar_url: string | null;
  player: string;
  image_url: string;
  isNew: boolean;
  matchedAt?: string;
}

interface Conversation {
  postId: string;
  name: string;
  avatar_url: string | null;
  player: string;
  lastMessage: string;
  lastAt: string;
}

const GLASS_CARD = {
  backgroundColor: "rgba(21,28,46,0.92)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
} as const;

export default function MensagensPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    try {
      const savedMatches: Match[] = JSON.parse(localStorage.getItem("figurinha_matches") ?? "[]");
      setMatches(savedMatches);

      const convs: Conversation[] = savedMatches
        .map((m) => {
          try {
            const msgs: Array<{ text: string; time: string; sender: string }> =
              JSON.parse(localStorage.getItem(`figurinha_chat_${m.postId}`) ?? "[]");
            if (msgs.length === 0) return null;
            const last = msgs[msgs.length - 1];
            return {
              postId: m.postId,
              name: m.name,
              avatar_url: m.avatar_url,
              player: m.player,
              lastMessage: last.text,
              lastAt: new Date().toISOString(),
            } as Conversation;
          } catch { return null; }
        })
        .filter((c): c is Conversation => c !== null);
      setConversations(convs);
    } catch {
      setMatches([]);
      setConversations([]);
    }
  }, []);

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
          <TopBar title="Mensagens" showBack />

          <Box sx={{ pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>

            {/* ── Matches ─────────────────────────────────────────────── */}
            <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, mb: 0.5 }}>
              <Typography sx={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                mb: 1.5,
              }}>
                Matches
              </Typography>
            </Box>

            <Box sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              px: `${LAYOUT.pagePaddingX}px`,
              pb: 2,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}>
              {matches.length === 0 ? (
                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", pl: 0.5 }}>
                  Nenhum match ainda. Arraste pra esquerda nas figurinhas!
                </Typography>
              ) : matches.map((match) => (
                <Box
                  key={match.postId}
                  onClick={() => router.push(`/pages/user/figurinhas/chat/${match.postId}`)}
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, cursor: "pointer", flexShrink: 0, width: 68 }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Box sx={{
                      width: 64, height: 64,
                      borderRadius: "50%",
                      p: "2.5px",
                      background: "linear-gradient(135deg, #FFD100, #009440)",
                    }}>
                      <Box
                        component="img"
                        src={match.image_url}
                        alt={match.player}
                        sx={{
                          width: "100%", height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                          objectPosition: "top center",
                          border: "2px solid #0A1128",
                          display: "block",
                        }}
                      />
                    </Box>
                    <Box sx={{
                      position: "absolute", bottom: 0, right: 0,
                      bgcolor: "#FFD100",
                      borderRadius: "100px",
                      px: 0.6, py: 0.1,
                      border: "2px solid #0A1128",
                    }}>
                      <Typography sx={{ fontSize: "0.45rem", fontWeight: 900, color: "#000", lineHeight: 1.4 }}>
                        NOVO
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    textAlign: "center",
                    lineHeight: 1.2,
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {match.name.split(" ")[0]}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Divisor */}
            <Box sx={{ height: "1px", bgcolor: "rgba(255,255,255,0.07)", mx: `${LAYOUT.pagePaddingX}px`, mb: 2 }} />

            {/* ── Conversas ───────────────────────────────────────────── */}
            <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, mb: 1 }}>
              <Typography sx={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                mb: 1.5,
              }}>
                Mensagens
              </Typography>
            </Box>

            <Box sx={{ px: `${LAYOUT.pagePaddingX}px` }}>
              {conversations.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                    Nenhuma conversa ainda.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {conversations.map((conv) => (
                    <Box
                      key={conv.postId}
                      onClick={() => router.push(`/pages/user/figurinhas/chat/${conv.postId}`)}
                      sx={{
                        ...GLASS_CARD,
                        display: "flex", alignItems: "center", gap: 1.5,
                        p: 1.5,
                        cursor: "pointer",
                        transition: "box-shadow 0.15s, transform 0.15s",
                        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.35)", transform: "translateY(-1px)" },
                      }}
                    >
                      <Avatar
                        src={conv.avatar_url ?? undefined}
                        sx={{ width: 46, height: 46, border: "2px solid rgba(0,133,66,0.35)", flexShrink: 0 }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.875rem", fontFamily: '"Montserrat"' }}>
                            {conv.name}
                          </Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6rem", flexShrink: 0 }}>
                            {formatDistanceToNow(new Date(conv.lastAt), { addSuffix: false, locale: ptBR })}
                          </Typography>
                        </Box>

                        <Typography sx={{ color: "#008542", fontSize: "0.7rem", fontWeight: 600, mb: 0.2 }}>
                          {conv.player}
                        </Typography>

                        <Typography sx={{
                          color: "rgba(255,255,255,0.45)",
                          fontSize: "0.75rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {conv.lastMessage}
                        </Typography>
                      </Box>

                      <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.35)", fontSize: "1.1rem", flexShrink: 0 }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}
