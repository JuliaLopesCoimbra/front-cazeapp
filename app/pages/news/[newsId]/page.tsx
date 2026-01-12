"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Paper,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getNewsDetails,
  NewsDetailsResponse,
  deleteNews,
} from "@/app/services/news/newsService";
import {
  likeNews,
  unlikeNews,
  getLikesCount,
  didILike,
} from "@/app/services/likes/likeService";
import {
  createComment,
  listComments,
  CommentResponse,
} from "@/app/services/comments/commentService";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import EditNewsModal from "@/app/components/admin/news/EditNewsModal";
import DeleteNewsModal from "@/app/components/admin/news/DeleteNewsModal";
import { getMe } from "@/app/services/auth/authService";
import { getProfile, ProfileResponse } from "@/app/services/profile/profileService";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = Number(params.newsId);
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsDetailsResponse | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileResponse | null>(null);

  const loadNewsDetails = async () => {
    if (!newsId) return;

    setLoading(true);
    try {
      // getNewsDetails já retorna as informações de likes do backend
      const data = await getNewsDetails(newsId);
      setNews(data);

      // Busca dados do usuário logado
      if (isAuthenticated) {
        try {
          const profile = await getProfile();
          setCurrentUser(profile);
          if (isAdmin) {
            const me = await getMe();
            setIsAuthor(data.author?.id === me.id);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário", error);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes da news", error);
      showToast("Erro ao carregar post", "error");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newsId) {
      loadNewsDetails();
    }
  }, [newsId, isAuthenticated, isAdmin]);

  const handleLike = async () => {
    if (!isAuthenticated || !news || liking) return;

    setLiking(true);
    try {
      const wasLiked = news.likes.user_liked;

      if (wasLiked) {
        // Remove o like usando o endpoint específico
        await unlikeNews(newsId);
        
        // Atualiza o estado otimisticamente
        setNews({
          ...news,
          likes: {
            count: Math.max(0, news.likes.count - 1),
            user_liked: false,
          },
        });
        
        // Sincroniza com o servidor usando os endpoints de likes
        try {
          const [likeStatus, likesCount] = await Promise.all([
            didILike(newsId),
            getLikesCount(newsId),
          ]);
          setNews((prev) =>
            prev
              ? {
                  ...prev,
                  likes: {
                    count: likesCount.count,
                    user_liked: likeStatus.liked,
                  },
                }
              : null
          );
        } catch (syncError) {
          console.error("Erro ao sincronizar likes", syncError);
        }
      } else {
        // Adiciona o like usando o endpoint específico
        await likeNews(newsId);
        
        // Atualiza o estado otimisticamente
        setNews({
          ...news,
          likes: {
            count: news.likes.count + 1,
            user_liked: true,
          },
        });
        
        // Sincroniza com o servidor usando os endpoints de likes
        try {
          const [likeStatus, likesCount] = await Promise.all([
            didILike(newsId),
            getLikesCount(newsId),
          ]);
          setNews((prev) =>
            prev
              ? {
                  ...prev,
                  likes: {
                    count: likesCount.count,
                    user_liked: likeStatus.liked,
                  },
                }
              : null
          );
        } catch (syncError) {
          console.error("Erro ao sincronizar likes", syncError);
        }
      }
    } catch (error) {
      console.error("Erro ao curtir/descurtir", error);
      showToast("Erro ao processar curtida", "error");
      
      // Recarrega os dados em caso de erro usando os endpoints de likes
      try {
        const [likeStatus, likesCount] = await Promise.all([
          didILike(newsId),
          getLikesCount(newsId),
        ]);
        setNews((prev) =>
          prev
            ? {
                ...prev,
                likes: {
                  count: likesCount.count,
                  user_liked: likeStatus.liked,
                },
              }
            : null
        );
      } catch (reloadError) {
        console.error("Erro ao recarregar likes", reloadError);
      }
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated || !commentText.trim() || submittingComment || !news) return;

    setSubmittingComment(true);
    try {
      // Cria o comentário usando o endpoint específico
      const newComment = await createComment(newsId, commentText.trim());
      
      // Atualiza os comentários localmente (otimisticamente)
      setNews({
        ...news,
        comments: [newComment, ...news.comments],
        comments_count: news.comments_count + 1,
      });

      setCommentText("");
      showToast("Comentário adicionado!", "success");
      
      // Recarrega os comentários do servidor para garantir sincronização
      try {
        const comments = await listComments(newsId);
        setNews((prev) =>
          prev
            ? {
                ...prev,
                comments: comments,
                comments_count: comments.length,
              }
            : null
        );
      } catch (syncError) {
        console.error("Erro ao sincronizar comentários", syncError);
        // Se falhar na sincronização, mantém o comentário adicionado otimisticamente
      }
    } catch (error: any) {
      console.error("Erro ao comentar", error);
      const message =
        error.response?.data?.detail || "Erro ao adicionar comentário";
      showToast(message, "error");
      
      // Em caso de erro, recarrega os comentários do servidor
      try {
        const comments = await listComments(newsId);
        setNews((prev) =>
          prev
            ? {
                ...prev,
                comments: comments,
                comments_count: comments.length,
              }
            : null
        );
      } catch (reloadError) {
        console.error("Erro ao recarregar comentários", reloadError);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!news || !news.event_id) return;

    setDeleting(true);
    try {
      await deleteNews(news.event_id, news.id);
      showToast("Notícia excluída com sucesso!", "success");
      setDeleteModalOpen(false);
      router.back();
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Erro ao excluir notícia";
      showToast(message, "error");
      throw error; // Re-throw para o modal tratar
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    loadNewsDetails();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (!news) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography>Notícia não encontrada.</Typography>
        <IconButton onClick={() => router.back()} sx={{ color: "#fff" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header com botão de voltar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          backgroundColor: "#000",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            onClick={() => router.back()}
            size="small"
            sx={{ color: "#fff" }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={news.author?.profile_photo}
              sx={{ width: 40, height: 40 }}
            >
              {news.author?.name?.[0]?.toUpperCase() || "?"}
            </Avatar>
            <Box>
              <Typography fontWeight={600} fontSize={14}>
                {news.author?.name || "Autor desconhecido"}
              </Typography>
              <Typography fontSize={12} color="rgba(255,255,255,0.6)">
                {formatDate(news.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* Botões de editar/excluir apenas para admin que é autor */}
        {isAuthor && isAdmin && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => setEditModalOpen(true)}
              size="small"
              disabled={deleting}
              sx={{ color: "#ffc91f" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setDeleteModalOpen(true)}
              size="small"
              disabled={deleting}
              sx={{ color: "#ff3040" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Conteúdo */}
      <Box sx={{ pb: 2, flex: 1, overflowY: "auto" }}>
        {/* Imagem */}
        {news.image_url && (
          <Box
            component="img"
            src={news.image_url}
            alt={news.title}
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: "500px",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        {/* Conteúdo */}
        <Box sx={{ p: 2 }}>
          {/* Título */}
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "#fff", mb: 1 }}
          >
            {news.title}
          </Typography>

          {/* Texto */}
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.9)", mb: 2, whiteSpace: "pre-wrap" }}
          >
            {news.content}
          </Typography>

          {/* Ações (Curtir, Comentar) */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
            <IconButton
              onClick={handleLike}
              disabled={!isAuthenticated || liking}
              sx={{ color: news.likes.user_liked ? "#ff3040" : "#fff" }}
            >
              {news.likes.user_liked ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <IconButton sx={{ color: "#fff" }}>
              <ChatBubbleOutlineIcon />
            </IconButton>
          </Box>

          {/* Contagem de curtidas */}
          {news.likes.count > 0 && (
            <Typography
              fontWeight={600}
              fontSize={14}
              sx={{ color: "#fff", mb: 1.5 }}
            >
              {news.likes.count} {news.likes.count === 1 ? "curtida" : "curtidas"}
            </Typography>
          )}

          {/* Comentários */}
          <Box mt={2}>
            <Typography
              fontWeight={600}
              fontSize={14}
              sx={{ color: "#fff", mb: 1.5 }}
            >
              {news.comments_count > 0
                ? `${news.comments_count} ${
                    news.comments_count === 1 ? "comentário" : "comentários"
                  }`
                : "Nenhum comentário"}
            </Typography>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1.5 }} />

            {/* Lista de comentários */}
            <Box
              sx={{
                maxHeight: "400px",
                overflowY: "auto",
                mb: 2,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "3px",
                },
              }}
            >
              {news.comments.map((comment) => (
                <Box key={comment.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Avatar
                      src={comment.user.profile_photo}
                      sx={{ width: 32, height: 32 }}
                    >
                      {comment.user.name[0]?.toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Paper
                        elevation={0}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          p: 1.5,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          fontWeight={600}
                          fontSize={13}
                          sx={{ color: "#fff", mb: 0.5 }}
                        >
                          {comment.user.name}
                        </Typography>
                        <Typography
                          fontSize={14}
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        >
                          {comment.content}
                        </Typography>
                      </Paper>
                      <Typography
                        fontSize={11}
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          mt: 0.5,
                          ml: 1,
                        }}
                      >
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Campo de comentário */}
            {isAuthenticated && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <Avatar
                  src={currentUser?.profile_photo || undefined}
                  sx={{ width: 36, height: 36 }}
                >
                  {currentUser?.name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <TextField
                  fullWidth
                  placeholder="Adicione um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                  multiline
                  maxRows={4}
                  disabled={submittingComment}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ffc91f",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "#fff",
                      "&::placeholder": {
                        color: "rgba(255,255,255,0.5)",
                        opacity: 1,
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={handleComment}
                  disabled={!commentText.trim() || submittingComment}
                  sx={{
                    color: commentText.trim()
                      ? "#ffc91f"
                      : "rgba(255,255,255,0.3)",
                  }}
                >
                  {submittingComment ? (
                    <CircularProgress size={20} sx={{ color: "#ffc91f" }} />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal de Edição */}
      {news && news.event_id && (
        <EditNewsModal
          open={editModalOpen}
          eventId={news.event_id}
          news={news}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de Exclusão */}
      {news && (
        <DeleteNewsModal
          open={deleteModalOpen}
          newsTitle={news.title}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </Box>
  );
}

