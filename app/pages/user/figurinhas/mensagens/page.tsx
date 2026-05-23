"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Avatar } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TopBar from "@/app/components/layout/TopBar";
import BottomNav from "@/app/components/layout/BottomNav";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  postId: string;
  name: string;
  avatarIndex: number;
  player: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    postId: "1",
    name: "Gabriel M.",
    avatarIndex: 3,
    player: "Vinicius Jr.",
    lastMessage: "Tenho disponível, por onde posso te enviar?",
    lastAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unread: 1,
  },
  {
    postId: "5",
    name: "Pedro Alves",
    avatarIndex: 12,
    player: "Neymar Jr.",
    lastMessage: "Quanto você topa pela figurinha?",
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread: 0,
  },
  {
    postId: "6",
    name: "Fernanda C.",
    avatarIndex: 44,
    player: "Messi",
    lastMessage: "Posso te mandar por mensagem no Instagram.",
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unread: 0,
  },
];

const GLASS_CARD = {
  backgroundColor: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
} as const;

export default function MensagensPage() {
  const router = useRouter();

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
            backgroundColor: "#FFFFFF",
          }}
        >
          <TopBar title="Mensagens" showBack light />

          <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>
            {MOCK_CONVERSATIONS.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ color: "#9E9E9E", fontSize: "0.875rem" }}>
                  Nenhuma conversa ainda.
                </Typography>
                <Typography sx={{ color: "#C0C0C0", fontSize: "0.75rem", mt: 0.5 }}>
                  Entre em contato com alguém na listagem de figurinhas.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {MOCK_CONVERSATIONS.map((conv) => (
                  <Box
                    key={conv.postId}
                    onClick={() => router.push(`/pages/user/figurinhas/chat/${conv.postId}`)}
                    sx={{
                      ...GLASS_CARD,
                      display: "flex", alignItems: "center", gap: 1.5,
                      p: 1.5,
                      cursor: "pointer",
                      transition: "box-shadow 0.15s, transform 0.15s",
                      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transform: "translateY(-1px)" },
                    }}
                  >
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <Avatar
                        src={`https://i.pravatar.cc/80?img=${conv.avatarIndex}`}
                        sx={{ width: 46, height: 46, border: "2px solid rgba(0,148,64,0.2)" }}
                      />
                      {conv.unread > 0 && (
                        <Box sx={{
                          position: "absolute", top: -2, right: -2,
                          width: 16, height: 16, borderRadius: "50%",
                          backgroundColor: "#009440",
                          border: "2px solid #FFFFFF",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Typography sx={{ fontSize: "0.5rem", fontWeight: 900, color: "#FFF", lineHeight: 1 }}>
                            {conv.unread}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                        <Typography sx={{
                          color: "#0A0A0A",
                          fontWeight: conv.unread > 0 ? 700 : 600,
                          fontSize: "0.875rem",
                          fontFamily: '"Montserrat"',
                        }}>
                          {conv.name}
                        </Typography>
                        <Typography sx={{ color: "#9E9E9E", fontSize: "0.6rem", flexShrink: 0 }}>
                          {formatDistanceToNow(new Date(conv.lastAt), { addSuffix: false, locale: ptBR })}
                        </Typography>
                      </Box>

                      <Typography sx={{ color: "#009440", fontSize: "0.7rem", fontWeight: 600, mb: 0.2 }}>
                        {conv.player}
                      </Typography>

                      <Typography sx={{
                        color: conv.unread > 0 ? "#0A0A0A" : "#9E9E9E",
                        fontSize: "0.75rem",
                        fontWeight: conv.unread > 0 ? 500 : 400,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {conv.lastMessage}
                      </Typography>
                    </Box>

                    <ChevronRightIcon sx={{ color: "#C0C0C0", fontSize: "1.1rem", flexShrink: 0 }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}
