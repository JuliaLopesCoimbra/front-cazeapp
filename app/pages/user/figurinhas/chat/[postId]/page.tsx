"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Avatar, TextField, IconButton, Chip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SendIcon from "@mui/icons-material/Send";

const MOCK_POSTS: Record<string, {
  name: string;
  avatarIndex: number;
  player: string;
  team: string;
  type: "need" | "sell";
}> = {
  "1": { name: "Gabriel M.",     avatarIndex: 3,  player: "Vinicius Jr.",  team: "Brasil",     type: "need" },
  "2": { name: "Maria Silva",    avatarIndex: 25, player: "Endrick",       team: "Brasil",     type: "need" },
  "3": { name: "Lucas Ferreira", avatarIndex: 8,  player: "Mbappé",        team: "França",     type: "need" },
  "4": { name: "Ana Beatriz",    avatarIndex: 44, player: "Bellingham",    team: "Inglaterra", type: "need" },
  "5": { name: "Pedro Alves",    avatarIndex: 12, player: "Neymar Jr.",    team: "Brasil",     type: "sell" },
  "6": { name: "Fernanda C.",    avatarIndex: 47, player: "Messi",         team: "Argentina",  type: "sell" },
  "7": { name: "Rafael S.",      avatarIndex: 17, player: "Rodrygo",       team: "Brasil",     type: "sell" },
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
        backgroundColor: "rgba(0,0,0,0.06)",
        borderRadius: "16px 16px 16px 4px",
        px: 2, py: 1.25,
        display: "flex", gap: 0.6, alignItems: "center",
      }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: "#9E9E9E",
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

  const [messages, setMessages]   = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [phase, setPhase]         = useState<"quick" | "typing" | "open">("quick");
  const messagesEndRef            = useRef<HTMLDivElement>(null);

  const quickReplies = post.type === "need"
    ? [
        `Oi! Tenho a figurinha do ${post.player} disponível`,
        `Ainda precisa do ${post.player}?`,
        "Podemos fazer uma troca?",
        "Qual o preço que você topa?",
      ]
    : [
        `Oi! Quero comprar a figurinha do ${post.player}`,
        `Ainda tem o ${post.player} disponível?`,
        "Quanto você quer pela figurinha?",
        "Podemos trocar por outra?",
      ];

  const botReply = "Tenho disponível, por onde posso te enviar?";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  function handleQuickReply(text: string) {
    const msg: Message = { id: Date.now().toString(), sender: "me", text, time: nowTime() };
    setMessages([msg]);
    setPhase("typing");
    setTimeout(() => {
      const reply: Message = { id: (Date.now() + 1).toString(), sender: "them", text: botReply, time: nowTime() };
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
    <Box sx={{ backgroundColor: "#FFFFFF", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* header */}
      <Box sx={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        px: 1.5, py: 1,
        display: "flex", alignItems: "center", gap: 1.5,
        flexShrink: 0,
        minHeight: 56,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <IconButton onClick={() => router.back()} size="small" sx={{ color: "#6B6B6B" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Avatar
          src={`https://i.pravatar.cc/80?img=${post.avatarIndex}`}
          sx={{ width: 36, height: 36, border: "2px solid rgba(0,148,64,0.2)" }}
        />

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "#0A0A0A", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.2 }}>
            {post.name}
          </Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", lineHeight: 1.2 }}>
            {post.type === "need" ? `Precisa de ${post.player}` : `Vendendo ${post.player}`} · {post.team}
          </Typography>
        </Box>

        {/* chip de tipo */}
        <Box sx={{
          backgroundColor: post.type === "need" ? "rgba(230,57,70,0.08)" : "rgba(0,148,64,0.08)",
          border: `1px solid ${post.type === "need" ? "rgba(230,57,70,0.25)" : "rgba(0,148,64,0.25)"}`,
          borderRadius: "100px", px: 1.25, py: 0.4,
        }}>
          <Typography sx={{
            color: post.type === "need" ? "#E63946" : "#009440",
            fontSize: "0.6rem", fontWeight: 700,
          }}>
            {post.type === "need" ? "Precisando" : "Vendendo"}
          </Typography>
        </Box>
      </Box>

      {/* messages */}
      <Box sx={{
        flex: 1, overflowY: "auto", px: 2, py: 2,
        display: "flex", flexDirection: "column", gap: 1,
        backgroundColor: "#F8F8F8",
      }}>
        {phase === "quick" && (
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem" }}>
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
              backgroundColor: msg.sender === "me" ? "#009440" : "#FFFFFF",
              borderRadius: msg.sender === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              px: 1.75, py: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <Typography sx={{
                color: msg.sender === "me" ? "#FFFFFF" : "#0A0A0A",
                fontSize: "0.875rem", lineHeight: 1.4,
                fontWeight: msg.sender === "me" ? 500 : 400,
              }}>
                {msg.text}
              </Typography>
              <Typography sx={{
                color: msg.sender === "me" ? "rgba(255,255,255,0.6)" : "#9E9E9E",
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
          borderTop: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "#FFFFFF",
          display: "flex", flexDirection: "column", gap: 1, flexShrink: 0,
        }}>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Respostas rapidas
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {quickReplies.map((reply) => (
              <Chip
                key={reply}
                label={reply}
                onClick={() => handleQuickReply(reply)}
                sx={{
                  backgroundColor: "rgba(0,148,64,0.06)",
                  border: "1px solid rgba(0,148,64,0.2)",
                  color: "#009440",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  height: "auto",
                  py: 0.5,
                  cursor: "pointer",
                  "& .MuiChip-label": { whiteSpace: "normal", lineHeight: 1.3, px: 1.5 },
                  "&:hover": { backgroundColor: "rgba(0,148,64,0.12)", borderColor: "rgba(0,148,64,0.35)" },
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
          borderTop: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "#FFFFFF",
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
                color: "#0A0A0A",
                backgroundColor: "rgba(0,0,0,0.04)",
                borderRadius: "24px",
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                "&:hover fieldset": { borderColor: "rgba(0,0,0,0.2)" },
                "&.Mui-focused fieldset": { borderColor: "#009440" },
              },
              "& input::placeholder": { color: "#9E9E9E", opacity: 1 },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputText.trim()}
            sx={{
              width: 40, height: 40, flexShrink: 0,
              backgroundColor: inputText.trim() ? "#009440" : "rgba(0,0,0,0.06)",
              color: inputText.trim() ? "#FFFFFF" : "#9E9E9E",
              boxShadow: inputText.trim() ? "0 2px 8px rgba(0,148,64,0.3)" : "none",
              transition: "all 0.2s",
              "&:hover": { backgroundColor: inputText.trim() ? "#007a33" : "rgba(0,0,0,0.06)" },
              "&:disabled": { backgroundColor: "rgba(0,0,0,0.06)", color: "#9E9E9E" },
            }}
          >
            <SendIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
