"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Avatar } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TopBar from "@/app/components/layout/TopBar";
import BottomNav from "@/app/components/layout/BottomNav";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  postId: string;
  name: string;
  initial: string;
  player: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    postId: "1",
    name: "Gabriel M.",
    initial: "G",
    player: "Vinicius Jr.",
    lastMessage: "Tenho disponível, por onde posso te enviar?",
    lastAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unread: 1,
  },
  {
    postId: "5",
    name: "Pedro Alves",
    initial: "P",
    player: "Neymar Jr.",
    lastMessage: "Quanto você topa pela figurinha?",
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread: 0,
  },
  {
    postId: "6",
    name: "Fernanda C.",
    initial: "F",
    player: "Messi",
    lastMessage: "Posso te mandar por mensagem no Instagram.",
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unread: 0,
  },
];

export default function MensagensPage() {
  const router = useRouter();

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Mensagens" showBack />

      <Box sx={{ px: 2, pt: 2 }}>
        {MOCK_CONVERSATIONS.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.875rem" }}>
              Nenhuma conversa ainda.
            </Typography>
            <Typography sx={{ color: "#555", fontSize: "0.75rem", mt: 0.5 }}>
              Entre em contato com alguém na listagem de figurinhas.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MOCK_CONVERSATIONS.map((conv, idx) => (
              <Box key={conv.postId}>
                <Box
                  onClick={() => router.push(`/pages/user/figurinhas/chat/${conv.postId}`)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    py: 1.75, px: 0.5,
                    cursor: "pointer",
                    borderRadius: "12px",
                    "&:hover": { backgroundColor: "#0D0D0D" },
                    transition: "background-color 0.15s",
                  }}
                >
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar sx={{ width: 46, height: 46, backgroundColor: "#222", fontSize: "1rem", fontWeight: 700, color: "#FFF" }}>
                      {conv.initial}
                    </Avatar>
                    {conv.unread > 0 && (
                      <Box sx={{
                        position: "absolute", top: 0, right: 0,
                        width: 14, height: 14, borderRadius: "50%",
                        backgroundColor: "#F5C900",
                        border: "2px solid #000",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Typography sx={{ fontSize: "0.5rem", fontWeight: 900, color: "#000", lineHeight: 1 }}>
                          {conv.unread}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                      <Typography sx={{
                        color: conv.unread > 0 ? "#FFF" : "#CCC",
                        fontWeight: conv.unread > 0 ? 700 : 500,
                        fontSize: "0.875rem",
                        fontFamily: '"Montserrat"',
                      }}>
                        {conv.name}
                      </Typography>
                      <Typography sx={{ color: "#444", fontSize: "0.6rem", flexShrink: 0 }}>
                        {formatDistanceToNow(new Date(conv.lastAt), { addSuffix: false, locale: ptBR })}
                      </Typography>
                    </Box>

                    <Typography sx={{ color: "#555", fontSize: "0.7rem", mb: 0.25 }}>
                      Figurinha: {conv.player}
                    </Typography>

                    <Typography sx={{
                      color: conv.unread > 0 ? "#9E9E9E" : "#444",
                      fontSize: "0.75rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {conv.lastMessage}
                    </Typography>
                  </Box>

                  <ChevronRightIcon sx={{ color: "#2A2A2A", fontSize: "1.1rem", flexShrink: 0 }} />
                </Box>

                {idx < MOCK_CONVERSATIONS.length - 1 && (
                  <Box sx={{ height: "1px", backgroundColor: "#111", mx: 0.5 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
