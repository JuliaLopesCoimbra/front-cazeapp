"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Skeleton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NewsDetailHeader from "@/app/components/news/NewsDetailHeader";
import NewsImageCarousel from "@/app/components/news/NewsImageCarousel";
import NewsActions from "@/app/components/news/NewsActions";
import NewsContent from "@/app/components/news/NewsContent";
import NewsLikeSection from "@/app/components/news/NewsLikeSection";
import CommentInput from "@/app/components/news/CommentInput";
import {
  getNewsDetails,
  NewsDetailsResponse,
  deleteNews,
  deactivatePost,
  approvePost,
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
  createReply,
  listReplies,
  likeComment,
  unlikeComment,
  deleteComment,
  CommentResponse,
} from "@/app/services/comments/commentService";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import DeleteNewsModal from "@/app/components/admin/news/DeleteNewsModal";
import DeleteCommentModal from "@/app/components/comments/DeleteCommentModal";
import { getMe } from "@/app/services/auth/authService";
import { getProfile, ProfileResponse } from "@/app/services/profile/profileService";
import { formatDate } from "@/app/utils/dateUtils";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = Number(params.newsId);
  const eventIdParam = searchParams.get("eventId");
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;
  const { isAuthenticated, isAdmin, isAdminMaster, isSubadmin, isColunista, canCreatePost } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsDetailsResponse | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileResponse | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [replies, setReplies] = useState<Record<number, CommentResponse[]>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [submittingReply, setSubmittingReply] = useState<Record<number, boolean>>({});
  const [likingComment, setLikingComment] = useState<Record<number, boolean>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});
  const [repliesOffset, setRepliesOffset] = useState<Record<number, number>>({});
  const [hasMoreReplies, setHasMoreReplies] = useState<Record<number, boolean>>({});
  const [loadingMoreReplies, setLoadingMoreReplies] = useState<Record<number, boolean>>({});
  const REPLIES_PER_PAGE = 5; // Carrega 5 respostas por vez
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{ id: number; content: string } | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [commentsOffset, setCommentsOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const COMMENTS_PER_PAGE = 20; // Carrega 20 comentários por vez
  
  // Ref para rastrear se o scroll já foi executado para evitar múltiplas execuções
  const scrollExecutedRef = useRef<number | null>(null);

  const loadNewsDetails = async () => {
    if (!newsId) return;

    setLoading(true);
    try {
      let data: NewsDetailsResponse;
      
      // Se tiver eventId na URL, usa ele
      if (eventId) {
        data = await getNewsDetails(newsId, eventId);
      } else {
        // Se não tiver, tenta carregar sem eventId (endpoint unificado permite para posts aprovados)
        try {
          data = await getNewsDetails(newsId);
          // Se conseguir carregar e tiver event_id na resposta, atualiza a URL preservando o commentId se existir
          if (data.event_id) {
            const urlParams = new URLSearchParams(window.location.search);
            const commentId = urlParams.get("commentId");
            const newUrl = commentId 
              ? `/pages/news/${newsId}?eventId=${data.event_id}&commentId=${commentId}`
              : `/pages/news/${newsId}?eventId=${data.event_id}`;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error: any) {
          // Se falhar, pode ser um post pendente que precisa do eventId
          showToast("Evento não encontrado. Por favor, acesse através do evento.", "error");
          router.back();
          return;
        }
      }
      
      // Carrega apenas os primeiros comentários se não vierem do backend
      const initialComments = data.comments || [];
      setNews(data);
      
      // Se os comentários vieram do backend, verifica se há mais
      if (initialComments.length > 0) {
        setHasMoreComments(data.comments_count > initialComments.length);
        setCommentsOffset(initialComments.length);
      } else {
        // Se não vieram comentários, carrega os primeiros
        try {
          const firstComments = await listComments(newsId, COMMENTS_PER_PAGE, 0);
          setNews((prev) => prev ? { ...prev, comments: firstComments } : null);
          setHasMoreComments(data.comments_count > firstComments.length);
          setCommentsOffset(firstComments.length);
        } catch (error) {
          console.error("Erro ao carregar comentários iniciais", error);
          setHasMoreComments(false);
          setCommentsOffset(0);
        }
      }

      // Busca dados do usuário logado
      if (isAuthenticated) {
        try {
          const profile = await getProfile();
          setCurrentUser(profile);
          // Verifica se é autor (para admin ou colunista)
          if (canCreatePost) {
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

  // Scroll automático para o comentário quando há commentId na URL
  // Este useEffect monitora quando news e loading mudam, e então verifica se há commentId na URL
  useEffect(() => {
    // Só executa quando a news foi carregada e não está mais carregando
    if (!news || loading) {
      return;
    }
    
    // Função para ler o commentId da URL
    const getCommentIdFromUrl = (): number | null => {
      if (typeof window === 'undefined') return null;
      const urlParams = new URLSearchParams(window.location.search);
      const commentIdParam = urlParams.get("commentId");
      return commentIdParam ? parseInt(commentIdParam, 10) : null;
    };
    
    // Lê o commentId diretamente da URL usando window.location para garantir que seja atualizado
    const targetCommentId = getCommentIdFromUrl();
    
    // Se não tem commentId, limpa o ref e retorna
    if (!targetCommentId) {
      if (scrollExecutedRef.current !== null) {
        scrollExecutedRef.current = null;
      }
      return;
    }
    
    // Se já executou o scroll para este commentId, não executa novamente
    if (scrollExecutedRef.current === targetCommentId) {
      return;
    }
    
    // Agora tem tudo: commentId, news carregada e não está mais carregando
    // Marca que o scroll será executado para este commentId
    scrollExecutedRef.current = targetCommentId;
    
    if (targetCommentId && news && !loading) {
      // Marca que o scroll será executado para este commentId
      scrollExecutedRef.current = targetCommentId;
      const highlightAndScroll = (element: HTMLElement) => {
        // Encontra o container de scroll - procura pelo id "news-content-scroll-container"
        let scrollContainer: HTMLElement | null = document.getElementById("news-content-scroll-container");
        
        // Se não encontrou, procura por um parent com scroll
        if (!scrollContainer) {
          scrollContainer = element.parentElement;
          while (scrollContainer && scrollContainer !== document.body) {
            const style = window.getComputedStyle(scrollContainer);
            if (style.overflowY === "auto" || style.overflowY === "scroll" || style.maxHeight) {
              break;
            }
            scrollContainer = scrollContainer.parentElement;
          }
        }
        
        // Se não encontrou container com scroll, usa window
        if (!scrollContainer || scrollContainer === document.body) {
          scrollContainer = null;
        }
        
        // Faz scroll suave
        if (scrollContainer) {
          // Scroll no container
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = scrollContainer.scrollTop;
          const relativeTop = elementRect.top - containerRect.top;
          const targetScroll = scrollTop + relativeTop - 100; // 100px de margem para header fixo
          
          const finalScroll = Math.max(0, Math.min(targetScroll, scrollContainer.scrollHeight - containerRect.height));
          
          // Verifica se o container pode fazer scroll
          if (scrollContainer.scrollHeight <= containerRect.height) {
            // Se não pode fazer scroll no container, tenta na window
            element.scrollIntoView({ 
              behavior: "smooth", 
              block: "center",
              inline: "nearest"
            });
          } else {
            // Força o scroll usando múltiplas abordagens para garantir que funcione
            // Primeiro tenta scroll suave
            scrollContainer.scrollTo({
              top: finalScroll,
              behavior: "smooth"
            });
            
            // Como fallback, verifica se o scroll realmente aconteceu e tenta novamente se necessário
            const checkAndRetry = (attempts = 0) => {
              setTimeout(() => {
                const currentScroll = scrollContainer.scrollTop;
                const diff = Math.abs(currentScroll - finalScroll);
                
                // Se a diferença for grande (mais de 50px), tenta novamente
                if (diff > 50 && attempts < 3) {
                  // Tenta scroll instantâneo
                  scrollContainer.scrollTop = finalScroll;
                  // Se ainda não funcionou, tenta novamente
                  if (attempts < 2) {
                    checkAndRetry(attempts + 1);
                  }
                } else if (diff > 50) {
                  // Último recurso: tenta scrollIntoView
                  element.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "center",
                    inline: "nearest"
                  });
                }
              }, attempts === 0 ? 100 : 200);
            };
            
            checkAndRetry();
          }
        } else {
          // Scroll na window - também tenta no container se existir mas não foi detectado
          // Tenta encontrar o container novamente antes de usar window
          const container = document.getElementById("news-content-scroll-container");
          if (container) {
            // Tenta fazer scroll no container usando scrollIntoView com block: "nearest"
            // Isso força o scroll no container pai
            element.scrollIntoView({ 
              behavior: "smooth", 
              block: "center",
              inline: "nearest"
            });
            
            // Como fallback, também tenta scroll direto no container
            setTimeout(() => {
              const elementRect = element.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              const relativeTop = elementRect.top - containerRect.top;
              const targetScroll = container.scrollTop + relativeTop - 100;
              container.scrollTop = Math.max(0, targetScroll);
            }, 200);
          } else {
            element.scrollIntoView({ 
              behavior: "smooth", 
              block: "center",
              inline: "nearest"
            });
          }
        }
        
        // Aguarda um pouco antes de destacar para garantir que o scroll terminou
        setTimeout(() => {
          // Adiciona destaque temporário minimalista
          element.style.transition = "all 0.3s ease";
          element.style.borderLeft = "3px solid rgba(255, 255, 255, 0.5)";
          element.style.paddingLeft = "12px";
          
          // Remove o destaque após 3 segundos
          setTimeout(() => {
            element.style.transition = "all 0.5s ease";
            element.style.borderLeft = "none";
            element.style.paddingLeft = "0";
          }, 3000);
        }, 1000);
        
        // Remove o commentId da URL após scroll e highlight (após 4.5 segundos total)
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("commentId");
          window.history.replaceState({}, "", url.toString());
          // Limpa o ref quando remove da URL
          if (scrollExecutedRef.current === targetCommentId) {
            scrollExecutedRef.current = null;
          }
        }, 4500);
      };

      const tryScrollToComment = (attempts = 0) => {
        const commentElement = document.getElementById(`comment-${targetCommentId}`);
        
        if (commentElement) {
          highlightAndScroll(commentElement);
          return;
        }
        
        // Se não encontrou e ainda tem tentativas, tenta novamente
        if (attempts < 15) {
          setTimeout(() => tryScrollToComment(attempts + 1), 300);
        }
      };

      const scrollToComment = async () => {
        // Verifica se é um comentário principal
        const isMainComment = news.comments.some(c => c.id === targetCommentId);
        
        if (isMainComment) {
          // É um comentário principal - tenta scroll após um delay maior
          setTimeout(() => tryScrollToComment(), 800);
        } else {
          // É uma resposta - precisa encontrar o comentário pai e expandir
          let foundParent = false;
          
          for (const comment of news.comments) {
            if (comment.replies_count > 0) {
              // Verifica se a resposta está na lista já carregada
              const replyList = replies[comment.id] || [];
              const hasReply = replyList.some(r => r.id === targetCommentId);
              
              if (hasReply) {
                foundParent = true;
                // Expande se não estiver expandido
                if (!expandedComments.has(comment.id)) {
                  setExpandedComments(prev => new Set(prev).add(comment.id));
                }
                // Aguarda renderização e tenta scroll
                setTimeout(() => tryScrollToComment(), 1200);
                break;
              }
              
              // Se não encontrou, expande e carrega para verificar
              if (!expandedComments.has(comment.id)) {
                setExpandedComments(prev => new Set(prev).add(comment.id));
                
                // Carrega as respostas se ainda não foram carregadas
                if (!replies[comment.id] || replies[comment.id].length === 0) {
                  setLoadingReplies(prev => ({ ...prev, [comment.id]: true }));
                  try {
                    const fetchedReplies = await listReplies(newsId, comment.id, REPLIES_PER_PAGE, 0);
                    setReplies(prev => ({ ...prev, [comment.id]: fetchedReplies }));
                    setRepliesOffset(prev => ({ ...prev, [comment.id]: fetchedReplies.length }));
                    const totalReplies = comment.replies_count || 0;
                    setHasMoreReplies(prev => ({ ...prev, [comment.id]: totalReplies > fetchedReplies.length }));
                    
                    // Verifica se encontrou a resposta após carregar
                    if (fetchedReplies.some(r => r.id === targetCommentId)) {
                      foundParent = true;
                      setTimeout(() => tryScrollToComment(), 1500);
                      break;
                    }
                  } catch (error) {
                    console.error("Erro ao carregar respostas", error);
                  } finally {
                    setLoadingReplies(prev => ({ ...prev, [comment.id]: false }));
                  }
                }
              }
            }
          }
          
          // Se não encontrou em nenhum comentário, tenta scroll mesmo assim (pode estar carregando)
          if (!foundParent) {
            setTimeout(() => tryScrollToComment(), 2000);
          }
        }
      };
      
      // Aguarda um pouco mais para garantir que o DOM foi renderizado completamente
      const timer = setTimeout(() => {
        scrollToComment();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [news, loading, newsId]); // Monitora apenas news, loading e newsId - quando news carrega e loading vira false, executa

  const handleLike = async () => {
    if (!isAuthenticated || !news || liking) return;

    // Bloqueia curtir se o post estiver pendente
    if (news.status === "pending") {
      showToast("Este post ainda não foi aprovado.", "error");
      return;
    }

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

    // Bloqueia comentar se o post estiver pendente ou rejeitado
    if (news.status === "pending" || news.status === "rejected") {
      showToast("Este post ainda não foi aprovado.", "error");
      return;
    }

    const commentContent = commentText.trim();
    setSubmittingComment(true);
    
    try {
      // Cria o comentário usando o endpoint específico
      const newComment = await createComment(newsId, commentContent);
      
      // Atualização otimista imediata - mostra o comentário na hora
      if (newComment) {
        setNews({
          ...news,
          comments: [newComment, ...news.comments],
          comments_count: news.comments_count + 1,
        });
        setCommentsOffset((prev) => prev + 1);
      }

      setCommentText("");
      showToast("Comentário adicionado!", "success");
      
      // Recarrega os comentários em background para garantir sincronização
      // Não bloqueia a UI - o comentário já está visível
      // O cache foi invalidado no backend antes de retornar, então podemos buscar imediatamente
      (async () => {
        try {
          // Recarrega apenas os comentários (mais rápido que recarregar tudo)
          const comments = await listComments(newsId, COMMENTS_PER_PAGE, 0);
          
          // Atualiza apenas se os comentários foram carregados com sucesso
          setNews((prev) => {
            if (!prev) return prev;
            // Verifica se o novo comentário já está na lista
            const hasNewComment = comments.some(c => c.id === newComment?.id);
            return {
              ...prev,
              comments: comments,
              comments_count: comments.length,
            };
          });
          setCommentsOffset(comments.length);
          setHasMoreComments(comments.length >= COMMENTS_PER_PAGE);
        } catch (syncError) {
          console.error("Erro ao sincronizar comentários em background", syncError);
          // Não mostra erro ao usuário - o comentário já está visível
        }
      })();
      
    } catch (error: any) {
      console.error("Erro ao comentar", error);
      const message =
        error.response?.data?.detail || "Erro ao adicionar comentário";
      showToast(message, "error");
      
      // Em caso de erro, tenta recarregar os comentários
      try {
        const comments = await listComments(newsId, COMMENTS_PER_PAGE, 0);
        setNews((prev) =>
          prev
            ? {
                ...prev,
                comments: comments,
                comments_count: comments.length,
              }
            : null
        );
        setCommentsOffset(comments.length);
      } catch (reloadError) {
        console.error("Erro ao recarregar comentários", reloadError);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const loadMoreComments = async () => {
    if (!news || loadingMoreComments || !hasMoreComments) return;

    setLoadingMoreComments(true);
    try {
      const newComments = await listComments(newsId, COMMENTS_PER_PAGE, commentsOffset);
      
      if (newComments.length > 0) {
        setNews((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, ...newComments],
              }
            : null
        );
        setCommentsOffset((prev) => prev + newComments.length);
        setHasMoreComments(newComments.length >= COMMENTS_PER_PAGE && news.comments_count > commentsOffset + newComments.length);
      } else {
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Erro ao carregar mais comentários", error);
      showToast("Erro ao carregar mais comentários", "error");
    } finally {
      setLoadingMoreComments(false);
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


  const handleLikeComment = async (commentId: number, parentCommentId?: number | null) => {
    if (!isAuthenticated || !news || likingComment[commentId]) return;

    setLikingComment((prev) => ({ ...prev, [commentId]: true }));
    try {
      let comment: any = null;
      let wasLiked = false;

      // Verifica se é uma resposta (tem parent_comment_id) ou um comentário principal
      if (parentCommentId) {
        // É uma resposta
        const replyList = replies[parentCommentId] || [];
        comment = replyList.find((r) => r.id === commentId);
        wasLiked = comment?.likes.user_liked || false;

        if (wasLiked) {
          await unlikeComment(commentId);
          setReplies((prev) => ({
            ...prev,
            [parentCommentId]: (prev[parentCommentId] || []).map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    likes: {
                      count: r.likes.count - 1,
                      user_liked: false,
                    },
                  }
                : r
            ),
          }));
          
          // Dispara evento para remover notificação da lista
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('notificationRemoved', {
              detail: { commentId, type: 'comment_like' }
            }));
          }
        } else {
          await likeComment(commentId);
          setReplies((prev) => ({
            ...prev,
            [parentCommentId]: (prev[parentCommentId] || []).map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    likes: {
                      count: r.likes.count + 1,
                      user_liked: true,
                    },
                  }
                : r
            ),
          }));
        }
      } else {
        // É um comentário principal
        comment = news.comments.find((c) => c.id === commentId);
        if (!comment) return;
        wasLiked = comment.likes.user_liked;

        if (wasLiked) {
          await unlikeComment(commentId);
          setNews({
            ...news,
            comments: news.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    likes: {
                      count: c.likes.count - 1,
                      user_liked: false,
                    },
                  }
                : c
            ),
          });
          
          // Dispara evento para remover notificação da lista
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('notificationRemoved', {
              detail: { commentId, type: 'comment_like' }
            }));
          }
        } else {
          await likeComment(commentId);
          setNews({
            ...news,
            comments: news.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    likes: {
                      count: c.likes.count + 1,
                      user_liked: true,
                    },
                  }
                : c
            ),
          });
        }
      }
    } catch (error: any) {
      console.error("Erro ao curtir comentário", error);
      showToast("Erro ao processar curtida", "error");
    } finally {
      setLikingComment((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleReplies = async (commentId: number) => {
    const isExpanded = expandedComments.has(commentId);
    
    if (isExpanded) {
      // Fechar respostas
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Abrir e carregar respostas
      setExpandedComments((prev) => new Set(prev).add(commentId));
      
      if (!replies[commentId] || replies[commentId].length === 0) {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
        try {
          // Carrega apenas as primeiras 5 respostas
          const fetchedReplies = await listReplies(newsId, commentId, REPLIES_PER_PAGE, 0);
          setReplies((prev) => ({ ...prev, [commentId]: fetchedReplies }));
          
          // Verifica se há mais respostas
          const comment = news?.comments.find(c => c.id === commentId);
          const totalReplies = comment?.replies_count || 0;
          setRepliesOffset((prev) => ({ ...prev, [commentId]: fetchedReplies.length }));
          setHasMoreReplies((prev) => ({ ...prev, [commentId]: totalReplies > fetchedReplies.length }));
        } catch (error) {
          console.error("Erro ao carregar respostas", error);
          showToast("Erro ao carregar respostas", "error");
        } finally {
          setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
        }
      }
    }
  };

  const loadMoreReplies = async (commentId: number) => {
    if (loadingMoreReplies[commentId] || !hasMoreReplies[commentId] || !news) return;

    setLoadingMoreReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const currentOffset = repliesOffset[commentId] || 0;
      const newReplies = await listReplies(newsId, commentId, REPLIES_PER_PAGE, currentOffset);
      
      if (newReplies.length > 0) {
        setReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), ...newReplies],
        }));
        
        const newOffset = currentOffset + newReplies.length;
        setRepliesOffset((prev) => ({ ...prev, [commentId]: newOffset }));
        
        // Verifica se há mais respostas
        const comment = news.comments.find(c => c.id === commentId);
        const totalReplies = comment?.replies_count || 0;
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: totalReplies > newOffset }));
      } else {
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: false }));
      }
    } catch (error) {
      console.error("Erro ao carregar mais respostas", error);
      showToast("Erro ao carregar mais respostas", "error");
    } finally {
      setLoadingMoreReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReply = async (commentId: number) => {
    if (!isAuthenticated || !replyTexts[commentId]?.trim() || submittingReply[commentId] || !news) return;

    setSubmittingReply((prev) => ({ ...prev, [commentId]: true }));
    try {
      const newReply = await createReply(newsId, commentId, replyTexts[commentId].trim());
      
      // Atualiza as respostas localmente
      setReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), newReply],
      }));

      // Atualiza o contador de respostas no comentário principal
      setNews({
        ...news,
        comments: news.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies_count: c.replies_count + 1 }
            : c
        ),
      });

      setReplyTexts((prev) => {
        const newTexts = { ...prev };
        delete newTexts[commentId];
        return newTexts;
      });
      setReplyingTo(null);
      showToast("Resposta adicionada!", "success");
      
      // Recarrega as respostas do servidor (primeiras 5)
      try {
        const fetchedReplies = await listReplies(newsId, commentId, REPLIES_PER_PAGE, 0);
        setReplies((prev) => ({ ...prev, [commentId]: fetchedReplies }));
        setRepliesOffset((prev) => ({ ...prev, [commentId]: fetchedReplies.length }));
        const comment = news.comments.find(c => c.id === commentId);
        const totalReplies = comment?.replies_count || 0;
        setHasMoreReplies((prev) => ({ ...prev, [commentId]: totalReplies > fetchedReplies.length }));
      } catch (syncError) {
        console.error("Erro ao sincronizar respostas", syncError);
      }
    } catch (error: any) {
      console.error("Erro ao responder", error);
      const message =
        error.response?.data?.detail || "Erro ao adicionar resposta";
      showToast(message, "error");
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteCommentClick = (commentId: number, commentContent: string) => {
    setCommentToDelete({ id: commentId, content: commentContent });
    setDeleteCommentModalOpen(true);
  };

  const handleDeleteCommentConfirm = async () => {
    if (!commentToDelete || !news) return;

    setDeletingComment(true);
    try {
      await deleteComment(commentToDelete.id);
      showToast("Comentário excluído com sucesso!", "success");
      setDeleteCommentModalOpen(false);
      
      // Salva o ID antes de limpar o estado
      const deletedCommentId = commentToDelete.id;
      
      // Verifica se é um comentário principal ou um subcomentário (reply)
      const isMainComment = news.comments.some(c => c.id === deletedCommentId);
      let parentCommentId: number | null = null;
      
      if (isMainComment) {
        // Remove o comentário principal da lista
        setNews((prevNews) => {
          if (!prevNews) return prevNews;
          return {
            ...prevNews,
            comments: prevNews.comments.filter(c => c.id !== deletedCommentId),
            comments_count: Math.max(0, prevNews.comments_count - 1),
          };
        });
        
        // Remove também das replies se estiver carregado e fecha a expansão
        setReplies((prev) => {
          const newReplies = { ...prev };
          delete newReplies[deletedCommentId];
          return newReplies;
        });
        
        // Remove da lista de comentários expandidos
        setExpandedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deletedCommentId);
          return newSet;
        });
      } else {
        // É um subcomentário - remove das replies
        setReplies((prev) => {
          const newReplies = { ...prev };
          // Encontra em qual comentário principal está essa reply
          Object.keys(newReplies).forEach((key) => {
            const commentId = Number(key);
            const replyExists = newReplies[commentId]?.some(r => r.id === deletedCommentId);
            if (replyExists) {
              parentCommentId = commentId;
              newReplies[commentId] = newReplies[commentId].filter(
                r => r.id !== deletedCommentId
              );
            }
          });
          return newReplies;
        });
        
        // Atualiza o contador de replies no comentário principal
        if (parentCommentId !== null) {
          setNews((prevNews) => {
            if (!prevNews) return prevNews;
            return {
              ...prevNews,
              comments: prevNews.comments.map(c =>
                c.id === parentCommentId
                  ? { ...c, replies_count: Math.max(0, c.replies_count - 1) }
                  : c
              ),
            };
          });
        }
      }
      
      setCommentToDelete(null);
      
      // Recarrega os dados do servidor para garantir sincronização
      await loadNewsDetails();
      
      // Se deletamos um comentário principal que tinha replies carregadas, recarrega os replies dos outros comentários
      if (isMainComment) {
        // Recarrega replies de todos os comentários que estão expandidos
        const expandedIds = Array.from(expandedComments);
        for (const commentId of expandedIds) {
          if (commentId !== deletedCommentId) {
            try {
              const fetchedReplies = await listReplies(newsId, commentId, REPLIES_PER_PAGE, 0);
              setReplies((prev) => ({ ...prev, [commentId]: fetchedReplies }));
              const comment = news?.comments.find(c => c.id === commentId);
              const totalReplies = comment?.replies_count || 0;
              setRepliesOffset((prev) => ({ ...prev, [commentId]: fetchedReplies.length }));
              setHasMoreReplies((prev) => ({ ...prev, [commentId]: totalReplies > fetchedReplies.length }));
            } catch (error) {
              console.error(`Erro ao recarregar replies do comentário ${commentId}`, error);
            }
          }
        }
      } else if (parentCommentId !== null) {
        // Se deletamos um reply, recarrega os replies do comentário pai
        try {
          const fetchedReplies = await listReplies(newsId, parentCommentId);
          setReplies((prev) => ({ ...prev, [parentCommentId as number]: fetchedReplies }));
        } catch (error) {
          console.error(`Erro ao recarregar replies do comentário ${parentCommentId}`, error);
        }
      }
    } catch (error: any) {
      console.error("Erro ao excluir comentário", error);
      const message = error.response?.data?.detail || "Erro ao excluir comentário";
      showToast(message, "error");
      throw error; // Re-throw para o modal tratar
    } finally {
      setDeletingComment(false);
    }
  };

  const handleReactivate = async () => {
    if (!news || reactivating) return;

    setReactivating(true);
    try {
      await approvePost(newsId);
      showToast("Post reativado com sucesso!", "success");
      setReactivateModalOpen(false);
      // Recarrega os dados para atualizar o status
      await loadNewsDetails();
    } catch (error: any) {
      console.error("Erro ao reativar post", error);
      showToast(
        error?.response?.data?.detail || "Erro ao reativar post",
        "error"
      );
    } finally {
      setReactivating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!newsId) return;

    setDeactivating(true);
    try {
      await deactivatePost(newsId);
      showToast("Post desativado com sucesso!", "success");
      setDeactivateModalOpen(false);
      router.push("/pages/user/home");
    } catch (error: any) {
      console.error("Erro ao desativar post", error);
      const message = error.response?.data?.detail || "Erro ao desativar post";
      showToast(message, "error");
    } finally {
      setDeactivating(false);
    }
  };



  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          height: "100vh",
          overflowY: "auto",
          backgroundImage: "url(/background/dashboard.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Skeleton para NewsActions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
          />
        </Box>

        {/* Skeleton para NewsDetailHeader */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, pb: 2 }}>
          <Skeleton
            variant="circular"
            width={48}
            height={48}
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant="text"
              width="40%"
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 0.5 }}
            />
            <Skeleton
              variant="text"
              width="30%"
              height={16}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>
        </Box>

        <Box sx={{ pb: 2, flex: 1, overflowY: "auto" }}>
          {/* Skeleton para imagem/carrossel */}
          <Box sx={{ mb: 2 }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={400}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>

          {/* Skeleton para conteúdo */}
          <Box sx={{ px: 2, maxWidth: { xs: "100%", sm: "600px", md: "700px" }, margin: "0 auto", width: "100%" }}>
            <Skeleton
              variant="text"
              width="90%"
              height={32}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="100%"
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="85%"
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }}
            />

            {/* Skeleton para seção de likes */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              />
            </Box>

            {/* Skeleton para comentários */}
            <Box mt={2}>
              <Skeleton
                variant="text"
                width={150}
                height={20}
                sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1.5 }}
              />
              <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1.5 }} />

              {/* Skeleton para lista de comentários */}
              {[1, 2, 3].map((index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Skeleton
                      variant="circular"
                      width={32}
                      height={32}
                      sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                    />
                    <Box flex={1}>
                      <Paper
                        elevation={0}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          p: 1.5,
                          borderRadius: 2,
                        }}
                      >
                        <Skeleton
                          variant="text"
                          width="30%"
                          height={16}
                          sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 0.5 }}
                        />
                        <Skeleton
                          variant="text"
                          width="100%"
                          height={14}
                          sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 0.5 }}
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={14}
                          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                        />
                      </Paper>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, ml: 1 }}>
                        <Skeleton
                          variant="text"
                          width={60}
                          height={12}
                          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                        />
                        <Skeleton
                          variant="circular"
                          width={20}
                          height={20}
                          sx={{ bgcolor: "rgba(255,255,255,0.1)", ml: 1 }}
                        />
                        <Skeleton
                          variant="circular"
                          width={20}
                          height={20}
                          sx={{ bgcolor: "rgba(255,255,255,0.1)", ml: 0.5 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* Skeleton para campo de comentário */}
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
                <Skeleton
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={40}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                />
                <Skeleton
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
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
        <IconButton onClick={() => router.push("/pages/user/home")} sx={{ color: "#fff" }}>
          ←
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      id="news-content-scroll-container"
      sx={{
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        backgroundImage: "url(/background/dashboard.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NewsActions
        newsId={newsId}
        eventId={eventId || news?.event_id || null}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        isAdminMaster={isAdminMaster}
        isSubadmin={isSubadmin}
        isColunista={isColunista}
        canDelete={Boolean(
          (isAuthor && (isAdmin || isColunista)) || 
          ((isAdminMaster || isSubadmin) && news && news.author && news.approved_by_id && news.approved_by_id === news.author.id) ||
          // Admin e subadmin podem excluir posts rejeitados
          ((isAdminMaster || isSubadmin) && news?.status === "rejected")
        )}
        canDeactivate={Boolean((isAdminMaster || isSubadmin) && news?.status !== "rejected")}
        onDelete={() => setDeleteModalOpen(true)}
        onDeactivate={() => setDeactivateModalOpen(true)}
        deleting={deleting}
        deactivating={deactivating}
      />

      <NewsDetailHeader
        authorName={news.author?.name}
        authorPhoto={news.author?.profile_photo}
        createdAt={news.created_at}
      />

      <Box sx={{ pb: 2, flex: 1, overflowY: "auto" }}>
        {news.images && news.images.length > 0 && (
          <NewsImageCarousel images={news.images} alt={news.title} />
        )}

        <NewsContent title={news.title} content={news.content} />

        <Box sx={{ px: 2, maxWidth: { xs: "100%", sm: "600px", md: "700px" }, margin: "0 auto", width: "100%" }}>
          <NewsLikeSection
            likesCount={news.likes.count}
            userLiked={news.likes.user_liked}
            onLike={handleLike}
            disabled={!isAuthenticated || liking || news.status === "pending" || news.status === "rejected"}
          />

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
                <Box 
                  key={comment.id} 
                  id={`comment-${comment.id}`}
                  sx={{ 
                    mb: 2,
                    scrollMarginTop: "100px", // Espaço para o header fixo
                  }}
                >
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, ml: 1 }}>
                        <Typography
                          fontSize={11}
                          sx={{
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          {formatDate(comment.created_at)}
                        </Typography>
                        {/* Botões de ação */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleLikeComment(comment.id)}
                            disabled={!isAuthenticated || likingComment[comment.id]}
                            sx={{
                              color: comment.likes.user_liked ? "#ff3040" : "rgba(255,255,255,0.5)",
                              padding: "4px",
                            }}
                          >
                            <FavoriteIcon fontSize="small" />
                          </IconButton>
                          {comment.likes.count > 0 && (
                            <Typography
                              fontSize={11}
                              sx={{ color: "rgba(255,255,255,0.5)", mr: 1 }}
                            >
                              {comment.likes.count}
                            </Typography>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => setReplyingTo(comment.id)}
                            disabled={!isAuthenticated}
                            sx={{
                              color: "rgba(255,255,255,0.5)",
                              padding: "4px",
                            }}
                          >
                            <ReplyIcon fontSize="small" />
                          </IconButton>
                          {comment.replies_count > 0 && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => toggleReplies(comment.id)}
                                sx={{
                                  color: "rgba(255,255,255,0.5)",
                                  padding: "4px",
                                }}
                              >
                                {expandedComments.has(comment.id) ? (
                                  <ExpandLessIcon fontSize="small" />
                                ) : (
                                  <ExpandMoreIcon fontSize="small" />
                                )}
                              </IconButton>
                              <Typography
                                fontSize={11}
                                sx={{ color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                                onClick={() => toggleReplies(comment.id)}
                              >
                                {comment.replies_count} {comment.replies_count === 1 ? "resposta" : "respostas"}
                              </Typography>
                            </>
                          )}
                          {/* Botão de excluir - apenas para admin_master, subadmin ou dono do comentário */}
                          {isAuthenticated && (isAdminMaster || isSubadmin || comment.user.id === currentUser?.id) && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteCommentClick(comment.id, comment.content)}
                              sx={{
                                color: "rgba(255,255,255,0.5)",
                                padding: "4px",
                                ml: 0.5,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      
                      {/* Campo de resposta */}
                      {replyingTo === comment.id && isAuthenticated && (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end", mt: 1, ml: 4 }}>
                          <Avatar
                            src={currentUser?.profile_photo || undefined}
                            sx={{ width: 28, height: 28 }}
                          >
                            {currentUser?.name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
                          </Avatar>
                          <TextField
                            fullWidth
                            placeholder="Escreva uma resposta..."
                            value={replyTexts[comment.id] || ""}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleReply(comment.id);
                              }
                            }}
                            multiline
                            maxRows={3}
                            disabled={submittingReply[comment.id]}
                            size="small"
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
                                fontSize: "13px",
                                "&::placeholder": {
                                  color: "rgba(255,255,255,0.5)",
                                  opacity: 1,
                                },
                              },
                            }}
                          />
                          <IconButton
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyTexts[comment.id]?.trim() || submittingReply[comment.id]}
                            sx={{
                              color: replyTexts[comment.id]?.trim()
                                ? "#ffc91f"
                                : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {submittingReply[comment.id] ? (
                              <CircularProgress size={16} sx={{ color: "#ffc91f" }} />
                            ) : (
                              <SendIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyTexts((prev) => {
                                const newTexts = { ...prev };
                                delete newTexts[comment.id];
                                return newTexts;
                              });
                            }}
                            sx={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}

                      {/* Lista de respostas */}
                      {expandedComments.has(comment.id) && (
                        <Box sx={{ mt: 1, ml: 4, borderLeft: "2px solid rgba(255,255,255,0.1)", pl: 2 }}>
                          {loadingReplies[comment.id] ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                              <CircularProgress size={20} sx={{ color: "#ffc91f" }} />
                            </Box>
                          ) : (
                            <>
                              {(replies[comment.id] || []).map((reply) => (
                                <Box 
                                  key={reply.id} 
                                  id={`comment-${reply.id}`}
                                  sx={{ 
                                    mb: 1.5,
                                    scrollMarginTop: "100px",
                                  }}
                                >
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Avatar
                                      src={reply.user.profile_photo}
                                      sx={{ width: 24, height: 24 }}
                                    >
                                      {reply.user.name[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          backgroundColor: "rgba(255,255,255,0.03)",
                                          p: 1,
                                          borderRadius: 1.5,
                                        }}
                                      >
                                        <Typography
                                          fontWeight={600}
                                          fontSize={12}
                                          sx={{ color: "#fff", mb: 0.3 }}
                                        >
                                          {reply.user.name}
                                        </Typography>
                                        <Typography
                                          fontSize={13}
                                          sx={{ color: "rgba(255,255,255,0.9)" }}
                                        >
                                          {reply.content}
                                        </Typography>
                                      </Paper>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3, ml: 0.5 }}>
                                        <Typography
                                          fontSize={10}
                                          sx={{ color: "rgba(255,255,255,0.4)" }}
                                        >
                                          {formatDate(reply.created_at)}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleLikeComment(reply.id, comment.id)}
                                          disabled={!isAuthenticated || likingComment[reply.id]}
                                          sx={{
                                            color: reply.likes.user_liked ? "#ff3040" : "rgba(255,255,255,0.4)",
                                            padding: "2px",
                                          }}
                                        >
                                          <FavoriteIcon fontSize="small" />
                                        </IconButton>
                                        {reply.likes.count > 0 && (
                                          <Typography
                                            fontSize={10}
                                            sx={{ color: "rgba(255,255,255,0.4)" }}
                                          >
                                            {reply.likes.count}
                                          </Typography>
                                        )}
                                        {/* Botão de excluir subcomentário - apenas para admin_master, subadmin ou dono do comentário */}
                                        {isAuthenticated && (isAdminMaster || isSubadmin || reply.user.id === currentUser?.id) && (
                                          <IconButton
                                            size="small"
                                            onClick={() => handleDeleteCommentClick(reply.id, reply.content)}
                                            sx={{
                                              color: "rgba(255,255,255,0.4)",
                                              padding: "2px",
                                              ml: 0.5,
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                              {(!replies[comment.id] || replies[comment.id].length === 0) && (
                                <Typography
                                  fontSize={12}
                                  sx={{ color: "rgba(255,255,255,0.5)", py: 1 }}
                                >
                                  Nenhuma resposta ainda
                                </Typography>
                              )}
                              
                              {/* Botão para carregar mais respostas */}
                              {hasMoreReplies[comment.id] && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5, mb: 1 }}>
                                  <Button
                                    onClick={() => loadMoreReplies(comment.id)}
                                    disabled={loadingMoreReplies[comment.id]}
                                    variant="text"
                                    size="small"
                                    sx={{
                                      color: "rgba(255,255,255,0.7)",
                                      textTransform: "none",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      padding: "4px 12px",
                                      minWidth: "auto",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        color: "#ffc91f",
                                        backgroundColor: "rgba(255,201,31,0.1)",
                                      },
                                      "&:disabled": {
                                        color: "rgba(255,255,255,0.3)",
                                      },
                                    }}
                                  >
                                    {loadingMoreReplies[comment.id] ? (
                                      <>
                                        <CircularProgress size={12} sx={{ color: "#ffc91f", mr: 0.5 }} />
                                        Carregando...
                                      </>
                                    ) : (
                                      `Ver mais respostas (${comment.replies_count - (repliesOffset[comment.id] || replies[comment.id]?.length || 0)} restantes)`
                                    )}
                                  </Button>
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
              
              {/* Botão para carregar mais comentários */}
              {hasMoreComments && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
                  <Button
                    onClick={loadMoreComments}
                    disabled={loadingMoreComments}
                    variant="outlined"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      borderColor: "rgba(255,255,255,0.3)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(5px)",
                      textTransform: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      padding: "8px 24px",
                      minWidth: "200px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.5)",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      },
                      "&:disabled": {
                        color: "rgba(255,255,255,0.5)",
                        borderColor: "rgba(255,255,255,0.2)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      },
                    }}
                  >
                    {loadingMoreComments ? (
                      <>
                        <CircularProgress size={16} sx={{ color: "#ffc91f", mr: 1 }} />
                        Carregando...
                      </>
                    ) : (
                      `Carregar mais comentários (${news.comments_count - commentsOffset} restantes)`
                    )}
                  </Button>
                </Box>
              )}
            </Box>

            {isAuthenticated && (
              <CommentInput
                value={commentText}
                onChange={setCommentText}
                onSubmit={handleComment}
                placeholder="Adicione um comentário..."
                disabled={news?.status === "pending" || news?.status === "rejected"}
                submitting={submittingComment}
                userPhoto={currentUser?.profile_photo || undefined}
                userName={currentUser?.name || undefined}
                userEmail={currentUser?.email || undefined}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Botão de reativar para posts rejeitados (apenas admin/subadmin) - no final da página */}
      {news.status === "rejected" && (isAdminMaster || isSubadmin) && (
        <Box
          sx={{
            px: 2,
            pt: 3,
            pb: 4,
            display: "flex",
            justifyContent: "center",
            maxWidth: { xs: "100%", sm: "600px", md: "700px" },
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setReactivateModalOpen(true)}
            sx={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 4,
              py: 1.5,
              minWidth: "200px",
              "&:hover": {
                backgroundColor: "#45a049",
              },
            }}
            startIcon={<CheckCircleIcon />}
          >
            Reativar Post
          </Button>
        </Box>
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

      {/* Modal de Exclusão de Comentário */}
      {commentToDelete && (
        <DeleteCommentModal
          open={deleteCommentModalOpen}
          commentContent={commentToDelete.content}
          onClose={() => {
            setDeleteCommentModalOpen(false);
            setCommentToDelete(null);
          }}
          onConfirm={handleDeleteCommentConfirm}
          loading={deletingComment}
        />
      )}

      {/* Modal de Desativação de Post */}
      <Dialog
        open={deactivateModalOpen}
        onClose={() => !deactivating && setDeactivateModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CloseIcon sx={{ fontSize: 28, color: "#ff3040" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Desativar Post
            </Typography>
          </Box>
        </DialogTitle>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mx: 3 }} />
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}>
            Tem certeza que deseja <strong style={{ color: "#ff3040" }}>desativar</strong> este post?
            <br />
            <br />
            <Box
              component="span"
              sx={{
                display: "block",
                p: 2,
                mt: 2,
                backgroundColor: "rgba(255, 68, 68, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(255, 68, 68, 0.2)",
              }}
            >
              O post será desativado e não será mais visível no feed.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setDeactivateModalOpen(false)}
            disabled={deactivating}
            sx={{
              color: "rgba(255,255,255,0.7)",
              textTransform: "none",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeactivate}
            disabled={deactivating}
            variant="contained"
            startIcon={deactivating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <CloseIcon />}
            sx={{
              backgroundColor: "#ff3040",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#cc0000",
              },
            }}
          >
            {deactivating ? "Desativando..." : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Reativação de Post */}
      <Dialog
        open={reactivateModalOpen}
        onClose={() => !reactivating && setReactivateModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(20px)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minWidth: { xs: "90%", sm: "400px" },
            maxWidth: "500px",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          Reativar Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 2,
            }}
          >
            Tem certeza que deseja reativar este post? O post voltará a ser visível no feed e poderá receber curtidas e comentários novamente.
          </DialogContentText>
          <Box
            sx={{
              display: "block",
              p: 2,
              mt: 2,
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(76, 175, 80, 0.2)",
            }}
          >
            O post será aprovado e voltará a aparecer no feed.
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setReactivateModalOpen(false)}
            disabled={reactivating}
            sx={{
              color: "rgba(255,255,255,0.7)",
              textTransform: "none",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReactivate}
            disabled={reactivating}
            variant="contained"
            startIcon={reactivating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <CheckCircleIcon />}
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#45a049",
              },
            }}
          >
            {reactivating ? "Reativando..." : "Reativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

