"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Avatar,
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SendIcon from "@mui/icons-material/Send";
import LiquidGlass from "@/app/components/shared/LiquidGlass";
import RainbowDivider from "@/app/components/layout/RainbowDivider";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import { useAuth } from "@/app/context/AuthContext";
import {
  listComments,
  createComment,
  type CommentResponse,
} from "@/app/services/comments/commentService";
import { getProfile, type ProfileResponse } from "@/app/services/profile/profileService";
import { formatDate } from "@/app/utils/dateUtils";

const FIGMA_POST_ART = "/assets/figma/post-copa-art.png";
const POST_HEADER_HEIGHT = 52;

const POST_IMAGE_HEIGHT = { xs: 580, sm: 600 } as const;

const FIGMA_AVATAR_HEADER = "/assets/figma/avatar-header.png";

const IMAGE_BOTTOM_GRADIENT =
  "linear-gradient(180deg, transparent 0%, transparent 42%, rgba(0,0,0,0.25) 58%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.82) 88%, rgba(0,0,0,0.94) 100%)";

function formatMetricCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

const COMMENTS_PREVIEW_LIMIT = 6;

export interface CopaStoryPostCardProps {
  newsId?: number;
  authorName?: string;
  authorPhoto?: string | null;
  caption: string;
  body?: string;
  createdAtLabel?: string;
  likesCount?: number;
  commentsCount?: number;
  onClick?: () => void;
  postArtUrl?: string;
  eyebrowLabel?: string;
}

function CopaCommentRow({ comment }: { comment: CommentResponse }) {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 1.25 }}>
      <Avatar
        src={comment.user.profile_photo}
        alt={comment.user.name}
        sx={{ width: 28, height: 28, flexShrink: 0, fontSize: 12 }}
      >
        {comment.user.name[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            lineHeight: 1.2,
          }}
        >
          {comment.user.name}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.88)",
            fontFamily: "var(--font-roboto), Roboto, sans-serif",
            fontSize: 12,
            lineHeight: 1.45,
            mt: 0.25,
            wordBreak: "break-word",
          }}
        >
          {comment.content}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 10,
            mt: 0.35,
            fontFamily: "var(--font-roboto), Roboto, sans-serif",
          }}
        >
          {formatDate(comment.created_at)}
        </Typography>
      </Box>
    </Box>
  );
}

function AuthorRow({
  avatarSrc,
  authorName,
  createdAtLabel,
  size = 36,
}: {
  avatarSrc: string;
  authorName: string;
  createdAtLabel?: string;
  size?: number;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Avatar src={avatarSrc} alt={authorName} sx={{ width: size, height: size, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.2,
          }}
        >
          {authorName}
        </Typography>
        {createdAtLabel ? (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-roboto), Roboto, sans-serif",
              fontSize: 11,
              mt: 0.25,
            }}
          >
            {createdAtLabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function CopaStoryPostCard({
  authorName = "@casacazetv",
  authorPhoto,
  caption,
  body,
  createdAtLabel,
  likesCount = 0,
  commentsCount = 0,
  onClick,
  postArtUrl = FIGMA_POST_ART,
  eyebrowLabel = "POST EM DESTAQUE",
  newsId,
}: CopaStoryPostCardProps) {
  const { isAuthenticated, authReady } = useAuth();
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileResponse | null>(null);

  const headerAvatar = authorPhoto || FIGMA_AVATAR_HEADER;
  const fullText = (body?.trim() || caption).trim();
  const totalComments = commentsCount > 0 ? commentsCount : comments.length;
  const commentsHeading =
    totalComments === 0
      ? "Comentários"
      : totalComments === 1
        ? "1 comentário"
        : `${totalComments} comentários`;

  const stopCardNav = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const loadComments = useCallback(async () => {
    if (!newsId) return;
    setCommentsLoading(true);
    try {
      const data = await listComments(newsId, COMMENTS_PREVIEW_LIMIT, 0);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    if (!commentsExpanded || !newsId || commentsLoaded) return;
    loadComments().then(() => setCommentsLoaded(true));
  }, [commentsExpanded, newsId, commentsLoaded, loadComments]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    getProfile()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, [authReady, isAuthenticated]);

  const expandComments = useCallback(() => {
    setCommentsExpanded(true);
    requestAnimationFrame(() => {
      commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const scrollToComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    expandComments();
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (commentsExpanded) {
      setCommentsExpanded(false);
    } else {
      expandComments();
    }
  };

  const handleSubmitComment = async () => {
    if (!newsId || !commentDraft.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const created = await createComment(newsId, commentDraft.trim());
      setComments((prev) => [created, ...prev]);
      setCommentsLoaded(true);
      setCommentsExpanded(true);
      setCommentDraft("");
    } catch {
      /* toast opcional */
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Box
      component="article"
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        px: "14px",
        maxWidth: 393,
        mx: "auto",
        width: "100%",
        transition: "opacity 0.2s",
        "&:hover": onClick ? { opacity: 0.92 } : undefined,
      }}
    >
      <Box
        sx={{
          borderRadius: "15px",
          overflow: "hidden",
          bgcolor: "#282828",
        }}
      >
        <LiquidGlass
          border="none"
          borderRadius="15px 15px 0 0"
          brazilGlow={false}
          blurPx={10}
          glassAlpha={0.1}
          noPadding
          minHeight={POST_HEADER_HEIGHT}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: POST_HEADER_HEIGHT,
              px: "14px",
            }}
          >
            <Avatar
              src={headerAvatar}
              alt={authorName}
              sx={{ width: 32, height: 32, flexShrink: 0 }}
            />
            <Typography
              component="span"
              sx={{
                flex: 1,
                color: "#FFFFFF",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {authorName}
            </Typography>
            {createdAtLabel ? (
              <Typography
                component="span"
                sx={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 10,
                  fontFamily: "var(--font-roboto), Roboto, sans-serif",
                  flexShrink: 0,
                }}
              >
                {createdAtLabel}
              </Typography>
            ) : null}
            <MoreHorizIcon
              sx={{
                fontSize: 18,
                color: "rgba(255,255,255,0.45)",
                flexShrink: 0,
              }}
            />
          </Box>
        </LiquidGlass>

        <RainbowDivider />

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: POST_IMAGE_HEIGHT.xs, sm: POST_IMAGE_HEIGHT.sm },
            minHeight: { xs: POST_IMAGE_HEIGHT.xs, sm: POST_IMAGE_HEIGHT.sm },
            overflow: "hidden",
          }}
        >
          <Image
            src={postArtUrl}
            alt=""
            fill
            sizes="(max-width: 393px) 100vw, 357px"
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />

          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: IMAGE_BOTTOM_GRADIENT,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* Título sobre a imagem — sem container, só texto + gradiente */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 4,
              px: 2.5,
              pb: 2.75,
              pt: 10,
              pr: 7,
              pointerEvents: "none",
            }}
          >
            {eyebrowLabel ? (
              <Typography
                component="p"
                sx={{
                  m: 0,
                  mb: 0.75,
                  color: "rgba(196, 172, 120, 0.95)",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {eyebrowLabel}
              </Typography>
            ) : null}
            <Typography
              component="h2"
              sx={{
                m: 0,
                color: "#FFFFFF",
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontWeight: 500,
                fontSize: { xs: "1.5rem", sm: "1.625rem" },
                lineHeight: 1.28,
                letterSpacing: "0.01em",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {caption}
            </Typography>
          </Box>

          {/* Barra flutuante — curtidas, comentários, salvar */}
          <Box
            onClick={stopCardNav}
            sx={{
              position: "absolute",
              right: 14,
              bottom: 28,
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.25,
              py: 1.5,
              px: 1.1,
              borderRadius: "999px",
              backgroundColor: "rgba(0, 0, 0, 0.38)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <FavoriteBorderIcon sx={{ fontSize: 24, color: "#FFFFFF" }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.2,
                  fontFamily: "var(--font-roboto), Roboto, sans-serif",
                }}
              >
                {formatMetricCount(likesCount)}
              </Typography>
            </Box>
            <Box
              component="button"
              type="button"
              onClick={scrollToComments}
              sx={{
                textAlign: "center",
                border: "none",
                background: "none",
                cursor: "pointer",
                p: 0,
                color: "inherit",
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.2,
                  fontFamily: "var(--font-roboto), Roboto, sans-serif",
                }}
              >
                {formatMetricCount(commentsCount)}
              </Typography>
            </Box>
            <BookmarkBorderIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />
          </Box>
        </Box>

        <Box onClick={stopCardNav} sx={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <LiquidGlass
            border="none"
            borderRadius="0 0 15px 15px"
            brazilGlow={false}
            blurPx={8}
            glassAlpha={0.04}
            noPadding
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <AuthorRow
                avatarSrc={headerAvatar}
                authorName={authorName}
                createdAtLabel={createdAtLabel}
              />
              <Typography
                component="h3"
                sx={{
                  mt: 1.25,
                  mb: 0.5,
                  color: "#FFCB00",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  lineHeight: 1.3,
                }}
              >
                {caption}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "var(--font-roboto), Roboto, sans-serif",
                  fontSize: 13,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {fullText}
              </Typography>

              <Box sx={{ my: 1 }}>
                <BrazilDivider />
              </Box>

              <Box ref={commentsSectionRef}>
                <Box
                  component="button"
                  type="button"
                  onClick={toggleComments}
                  aria-expanded={commentsExpanded}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    p: 0,
                    py: 0.25,
                    textAlign: "left",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: "#9E9E9E", flexShrink: 0 }} />
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.75)",
                        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {commentsHeading}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                    <Typography
                      sx={{
                        color: "#9E9E9E",
                        fontSize: 10,
                        fontFamily: "var(--font-roboto), Roboto, sans-serif",
                      }}
                    >
                      {commentsExpanded ? "Recolher" : "Expandir"}
                    </Typography>
                    {commentsExpanded ? (
                      <ExpandLessIcon sx={{ fontSize: 20, color: "#9E9E9E" }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: 20, color: "#9E9E9E" }} />
                    )}
                  </Box>
                </Box>

                <Collapse in={commentsExpanded} timeout={280} unmountOnExit>
                  <Box sx={{ pt: 1 }}>
                    {commentsLoading ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                        <CircularProgress size={22} sx={{ color: "#009440" }} />
                      </Box>
                    ) : comments.length === 0 ? (
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 12,
                          py: 1,
                          fontFamily: "var(--font-roboto), Roboto, sans-serif",
                        }}
                      >
                        Seja o primeiro a comentar! ⚽
                      </Typography>
                    ) : (
                      comments.map((comment) => (
                        <CopaCommentRow key={comment.id} comment={comment} />
                      ))
                    )}

                    {totalComments > comments.length && comments.length > 0 && onClick ? (
                      <Box
                        component="button"
                        type="button"
                        onClick={(e) => {
                          stopCardNav(e);
                          onClick();
                        }}
                        sx={{
                          mt: 0.5,
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#009440",
                          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          p: 0,
                        }}
                      >
                        Ver todos os comentários
                      </Box>
                    ) : null}

                    {isAuthenticated && newsId ? (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                          mt: 1.25,
                          pt: 1,
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <Avatar
                          src={currentUser?.profile_photo}
                          sx={{ width: 28, height: 28, flexShrink: 0 }}
                        >
                          {currentUser?.name?.[0]?.toUpperCase() ?? "U"}
                        </Avatar>
                        <Box sx={{ flex: 1, display: "flex", gap: 0.5, alignItems: "flex-end" }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Comente..."
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment();
                              }
                            }}
                            disabled={submittingComment}
                            multiline
                            maxRows={3}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                color: "#fff",
                                fontSize: 13,
                                backgroundColor: "rgba(255,255,255,0.05)",
                                borderRadius: "10px",
                                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                "&:hover fieldset": { borderColor: "rgba(0,148,64,0.35)" },
                                "&.Mui-focused fieldset": { borderColor: "#009440" },
                              },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              stopCardNav(e);
                              handleSubmitComment();
                            }}
                            disabled={submittingComment || !commentDraft.trim()}
                            aria-label="Enviar comentário"
                            sx={{ color: "#009440", mb: 0.25 }}
                          >
                            {submittingComment ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <SendIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                </Collapse>
              </Box>
            </Box>
          </LiquidGlass>
        </Box>
      </Box>
    </Box>
  );
}
