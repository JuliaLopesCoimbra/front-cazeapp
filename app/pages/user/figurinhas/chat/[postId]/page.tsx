"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Avatar, TextField, IconButton, Chip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";

const MOCK_POSTS: Record<string, {
  name: string;
  avatarIndex: number;
  player: string;
  team: string;
}> = {
  "1": { name: "Gabriel M.",  avatarIndex: 3,  player: "Vinicius Jr.",      team: "Brasil"   },
  "2": { name: "Maria Silva", avatarIndex: 5,  player: "Messi",             team: "Argentina"},
  "3": { name: "Lucas F.",    avatarIndex: 11, player: "Cristiano Ronaldo", team: "Portugal" },
  "4": { name: "Ana Beatriz", avatarIndex: 9,  player: "Neymar",            team: "Brasil"   },
  "5": { name: "Pedro Alves", avatarIndex: 15, player: "Lucas Paquetá",     team: "Brasil"   },
  "6": { name: "Felipe S.",   avatarIndex: 53, player: "Neymar",            team: "Brasil"   },
};

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <Box sx={{
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: "16px 16px 16px 4px",
        px: 2, py: 1.25,
        display: "flex", gap: 0.6, alignItems: "center",
      }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.45)",
            animation: `typingDot 1.2s ${i * 0.2}s infinite ease-in-out`,
            "@keyframes typingDot": {
              "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.35 },
              "40%":           { transform: "scale(1)",   opacity: 1 },
            },
          }} />
        ))}
      </Box>
    </Box>
  );
}

export default function FigurinhasChatPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const post = MOCK_POSTS[postId as string] ?? {
    name: "Usuário", avatarIndex: 1, player: "figurinha", team: "", type: "need" as const,
  };

  const storageKey = `figurinha_chat_${postId}`;

  const [messages, setMessages]   = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch { return []; }
  });
  const [inputText, setInputText] = useState("");
  const [phase, setPhase]         = useState<"quick" | "typing" | "open">(() =>
    messages.length > 0 ? "open" : "quick"
  );
  const messagesEndRef            = useRef<HTMLDivElement>(null);

  const quickReplies = [
    `Oi ${post.name.split(" ")[0]}! Topei a troca do ${post.player}!`,
    `Qual figurinha você quer em troca?`,
    `Tenho repetidas que podem te interessar!`,
    `Quando podemos fazer a troca?`,
  ];

  const botReplies = [
    `Oi! Que bom! Tenho interesse em algumas repetidas. Quais você tem disponível?`,
    `Pode ser! Me manda a lista das suas repetidas que a gente vê.`,
    `Perfeito! Só me fala o que você precisa e a gente combina.`,
    `Pode ser qualquer horário! Me chama quando quiser.`,
  ];

  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch {}
    }
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  function handleQuickReply(text: string) {
    const msg: Message = { id: Date.now().toString(), sender: "me", text, time: nowTime() };
    setMessages([msg]);
    setPhase("typing");
    const replyIndex = quickReplies.indexOf(text);
    const replyText = botReplies[replyIndex] ?? botReplies[0];
    setTimeout(() => {
      const reply: Message = { id: (Date.now() + 1).toString(), sender: "them", text: replyText, time: nowTime() };
      setMessages((prev) => [...prev, reply]);
      setPhase("open");
    }, 1600);
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    const msg: Message = { id: Date.now().toString(), sender: "me", text, time: nowTime() };
    setMessages((prev) => [...prev, msg]);
    setInputText("");
  }

  return (
    <Box sx={{ backgroundColor: "#0A1128", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* header */}
      <Box sx={{
        backgroundColor: "#151c2e",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        px: 1.5, py: 1,
        display: "flex", alignItems: "center", gap: 1.5,
        flexShrink: 0,
        minHeight: 56,
        boxShadow: "0 1px 8px rgba(0,0,0,0.3)",
      }}>
        <IconButton onClick={() => router.back()} size="small" sx={{ color: "rgba(255,255,255,0.72)" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Avatar
          src={`https://i.pravatar.cc/80?img=${post.avatarIndex}`}
          sx={{ width: 36, height: 36, border: "2px solid rgba(0,133,66,0.35)" }}
        />

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "#FFFFFF", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.2 }}>
            {post.name}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", lineHeight: 1.2 }}>
            {post.player} · {post.team}
          </Typography>
        </Box>

        {/* chip de match */}
        <Box sx={{
          backgroundColor: "rgba(255,209,0,0.12)",
          border: "1px solid rgba(255,209,0,0.35)",
          borderRadius: CAZE_RADIUS.pill, px: 1.25, py: 0.4,
        }}>
          <Typography sx={{ color: "#FFD100", fontSize: "0.6rem", fontWeight: 700 }}>
            Match!
          </Typography>
        </Box>
      </Box>

      {/* messages */}
      <Box sx={{
        flex: 1, overflowY: "auto", px: 2, py: 2,
        display: "flex", flexDirection: "column", gap: 1,
        backgroundColor: "#0A1128",
      }}>
        {phase === "quick" && (
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem" }}>
              Escolha uma mensagem para iniciar a conversa
            </Typography>
          </Box>
        )}

        {messages.map((msg) => (
          <Box key={msg.id} sx={{
            display: "flex",
            justifyContent: msg.sender === "me" ? "flex-end" : "flex-start",
            alignItems: "flex-end",
            gap: 0.75,
          }}>
            {msg.sender === "them" && (
              <Avatar
                src={`https://i.pravatar.cc/80?img=${post.avatarIndex}`}
                sx={{ width: 28, height: 28, flexShrink: 0 }}
              />
            )}
            <Box sx={{
              maxWidth: "78%",
              backgroundColor: msg.sender === "me" ? "#008542" : "rgba(21,28,46,0.92)",
              border: msg.sender === "them" ? "1px solid rgba(255,255,255,0.08)" : "none",
              borderRadius: msg.sender === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              px: 1.75, py: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}>
              <Typography sx={{
                color: "#FFFFFF",
                fontSize: "0.875rem", lineHeight: 1.4,
                fontWeight: msg.sender === "me" ? 500 : 400,
              }}>
                {msg.text}
              </Typography>
              <Typography sx={{
                color: msg.sender === "me" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)",
                fontSize: "0.6rem", textAlign: "right", mt: 0.25,
              }}>
                {msg.time}
              </Typography>
            </Box>
          </Box>
        ))}

        {phase === "typing" && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </Box>

      {/* quick replies */}
      {phase === "quick" && (
        <Box sx={{
          px: 2, pt: 1.5, pb: 2,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "#151c2e",
          display: "flex", flexDirection: "column", gap: 1, flexShrink: 0,
        }}>
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Respostas rapidas
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {quickReplies.map((reply) => (
              <Chip
                key={reply}
                label={reply}
                onClick={() => handleQuickReply(reply)}
                sx={{
                  backgroundColor: "rgba(0,133,66,0.10)",
                  border: "1px solid rgba(0,133,66,0.25)",
                  color: "#008542",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  height: "auto",
                  py: 0.5,
                  cursor: "pointer",
                  "& .MuiChip-label": { whiteSpace: "normal", lineHeight: 1.3, px: 1.5 },
                  "&:hover": { backgroundColor: "rgba(0,133,66,0.18)", borderColor: "rgba(0,133,66,0.45)" },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* text input */}
      {phase === "open" && (
        <Box sx={{
          px: 2, pt: 1, pb: 3,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "#151c2e",
          display: "flex", gap: 1, alignItems: "center", flexShrink: 0,
        }}>
          <TextField
            fullWidth
            placeholder="Digite uma mensagem..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            size="small"
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: "24px",
                "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.22)" },
                "&.Mui-focused fieldset": { borderColor: "#008542" },
              },
              "& input::placeholder": { color: "rgba(255,255,255,0.35)", opacity: 1 },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputText.trim()}
            sx={{
              width: 40, height: 40, flexShrink: 0,
              backgroundColor: inputText.trim() ? "#008542" : "rgba(255,255,255,0.08)",
              color: inputText.trim() ? "#FFFFFF" : "rgba(255,255,255,0.35)",
              boxShadow: inputText.trim() ? "0 2px 8px rgba(0,133,66,0.3)" : "none",
              transition: "all 0.2s",
              "&:hover": { backgroundColor: inputText.trim() ? "#006d36" : "rgba(255,255,255,0.12)" },
              "&:disabled": { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" },
            }}
          >
            <SendIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
