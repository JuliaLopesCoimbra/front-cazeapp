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
import FrostedGlass from "@/app/components/shared/FrostedGlass";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import { COLORS, LAYOUT } from "@/app/constants/designTokens";
import RainbowDivider from "@/app/components/layout/RainbowDivider";
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
/** Barra recolhida do bloco de comentários — alinhada ao header do post */
const COMMENTS_TOGGLE_MIN_HEIGHT = 40;

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
}

function CopaCommentRow({ comment }: { comment: CommentResponse }) {
  return (
    <Box sx={{ display: "flex", gap: 0.75, mb: 0.75 }}>
      <Avatar
        src={comment.user.profile_photo}
        alt={comment.user.name}
        sx={{ width: 24, height: 24, flexShrink: 0, fontSize: 11 }}
      >
        {comment.user.name[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.95)",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            lineHeight: 1.2,
          }}
        >
          {comment.user.name}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.78)",
            fontFamily: "var(--font-roboto), Roboto, sans-serif",
            fontSize: 11,
            lineHeight: 1.4,
            mt: 0.15,
            wordBreak: "break-word",
          }}
        >
          {comment.content}
        </Typography>
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
        px: `${LAYOUT.pagePaddingX}px`,
        maxWidth: 393,
        mx: "auto",
        width: "100%",
        transition: "opacity 0.2s",
        "&:hover": onClick ? { opacity: 0.92 } : undefined,
      }}
    >
      <Box
        sx={{
          borderRadius: CAZE_RADIUS.md,
          overflow: "hidden",
          bgcolor: "transparent",
        }}
      >
        {/* Cabeçalho transparente — fica acima da mídia; divisão arco-íris abaixo */}
        <Box
          sx={{
            position: "relative",
            zIndex: 4,
            isolation: "isolate",
          }}
        >
          <FrostedGlass
            borderRadius={`${CAZE_RADIUS.md} ${CAZE_RADIUS.md} 0 0`}
            blurPx={12}
            fillAlpha={0}
            noPadding
            sx={{
              backgroundColor: "rgba(40, 40, 40, 0.28)",
              backdropFilter: "blur(14px) saturate(1.2)",
              WebkitBackdropFilter: "blur(14px) saturate(1.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderBottom: "none",
              boxShadow: "none",
            }}
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
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              />
              <Typography
                component="span"
                sx={{
                  flex: 1,
                  color: COLORS.text,
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.01em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textShadow: "0 1px 8px rgba(0, 0, 0, 0.45)",
                }}
              >
                {authorName}
              </Typography>
              {createdAtLabel ? (
                <Typography
                  component="span"
                  sx={{
                    color: COLORS.textSecondary,
                    fontSize: 10,
                    fontFamily: "var(--font-roboto), Roboto, sans-serif",
                    flexShrink: 0,
                    textShadow: "0 1px 6px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {createdAtLabel}
                </Typography>
              ) : null}
              <MoreHorizIcon
                sx={{
                  fontSize: 18,
                  color: "rgba(255, 255, 255, 0.55)",
                  flexShrink: 0,
                }}
              />
            </Box>
          </FrostedGlass>
          <Box sx={{ position: "relative", zIndex: 5 }}>
            <RainbowDivider />
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: { xs: POST_IMAGE_HEIGHT.xs, sm: POST_IMAGE_HEIGHT.sm },
            minHeight: { xs: POST_IMAGE_HEIGHT.xs, sm: POST_IMAGE_HEIGHT.sm },
            overflow: "hidden",
            mt: -0.25,
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

        <RainbowDivider />

        <Box onClick={stopCardNav} sx={{ position: "relative", zIndex: 2, bgcolor: "transparent" }}>
          <FrostedGlass
            borderRadius={`0 0 ${CAZE_RADIUS.md} ${CAZE_RADIUS.md}`}
            blurPx={commentsExpanded ? 18 : 14}
            fillAlpha={commentsExpanded ? 0.08 : 0}
            noPadding
            sx={{
              backgroundColor: commentsExpanded
                ? "rgba(40, 40, 40, 0.9)"
                : "rgba(40, 40, 40, 0.28)",
              backdropFilter: commentsExpanded
                ? "blur(18px) saturate(1.25)"
                : "blur(14px) saturate(1.2)",
              WebkitBackdropFilter: commentsExpanded
                ? "blur(18px) saturate(1.25)"
                : "blur(14px) saturate(1.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderTop: "none",
              boxShadow: "none",
              transition:
                "background-color 0.22s ease, backdrop-filter 0.22s ease, -webkit-backdrop-filter 0.22s ease",
            }}
          >
            <Box sx={{ px: 1.25, py: commentsExpanded ? 1 : 1.125 }}>
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
                    gap: 0.5,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    p: 0,
                    minHeight: COMMENTS_TOGGLE_MIN_HEIGHT,
                    textAlign: "left",
                  }}
                >
                  <Typography
                    sx={{
                      color: commentsExpanded
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.75)",
                      fontFamily: "var(--font-roboto), Roboto, sans-serif",
                      fontWeight: 500,
                      fontSize: 11,
                    }}
                  >
                    {commentsHeading}
                  </Typography>
                  {commentsExpanded ? (
                    <ExpandLessIcon sx={{ fontSize: 18, color: "#9E9E9E" }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 18, color: "#9E9E9E" }} />
                  )}
                </Box>

                <Collapse in={commentsExpanded} timeout={220} unmountOnExit>
                  <Box sx={{ pt: 0.75, pb: 0.5 }}>
                    {commentsLoading ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
                        <CircularProgress size={18} sx={{ color: "#009440" }} />
                      </Box>
                    ) : comments.length === 0 ? (
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.45)",
                          fontSize: 11,
                          py: 0.5,
                          fontFamily: "var(--font-roboto), Roboto, sans-serif",
                        }}
                      >
                        Seja o primeiro a comentar
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
                          mt: 0.25,
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#009440",
                          fontFamily: "var(--font-roboto), Roboto, sans-serif",
                          fontSize: 10,
                          p: 0,
                        }}
                      >
                        Ver todos
                      </Box>
                    ) : null}

                    {isAuthenticated && newsId ? (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          alignItems: "center",
                          mt: 0.75,
                          pt: 0.75,
                          borderTop: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Avatar
                          src={currentUser?.profile_photo ?? undefined}
                          sx={{ width: 22, height: 22, flexShrink: 0, fontSize: 10 }}
                        >
                          {currentUser?.name?.[0]?.toUpperCase() ?? "U"}
                        </Avatar>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Comentar..."
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment();
                            }
                          }}
                          disabled={submittingComment}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: "#fff",
                              fontSize: 12,
                              minHeight: 32,
                              backgroundColor: "rgba(255,255,255,0.04)",
                              borderRadius: "8px",
                              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                              "&.Mui-focused fieldset": { borderColor: "rgba(0,148,64,0.45)" },
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
                          aria-label="Enviar"
                          sx={{ color: "#009440", p: 0.5 }}
                        >
                          {submittingComment ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <SendIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Box>
                    ) : null}
                  </Box>
                </Collapse>
              </Box>
            </Box>
          </FrostedGlass>
        </Box>
      </Box>
    </Box>
  );
}
