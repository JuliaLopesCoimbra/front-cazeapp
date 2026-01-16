import api from "../auth/axiosConfig";

export interface CommentUser {
  id: number;
  name: string;
  profile_photo?: string;
}

export interface CommentLikes {
  count: number;
  user_liked: boolean;
}

export interface CommentResponse {
  id: number;
  content: string;
  created_at: string;
  parent_comment_id?: number | null;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  likes: CommentLikes;
  replies_count: number;
  user: CommentUser;
}

/**
 * Listar comentários de uma notícia com paginação
 */
export const listComments = async (
  newsId: number,
  limit: number = 50,
  offset: number = 0
): Promise<CommentResponse[]> => {
  const response = await api.get(`/news/${newsId}/comments`, {
    params: { limit, offset }
  });
  return response.data as CommentResponse[];
};

/**
 * Criar um comentário em uma notícia
 */
export const createComment = async (
  newsId: number,
  content: string
): Promise<CommentResponse> => {
  // FastAPI trata parâmetros simples em POST como query params por padrão
  // Mas vamos tentar enviar como query param primeiro (como estava no código original)
  const response = await api.post(`/news/${newsId}/comments`, null, {
    params: { content },
  });
  return response.data as CommentResponse;
};

/**
 * Criar resposta a um comentário
 */
export const createReply = async (
  newsId: number,
  commentId: number,
  content: string
): Promise<CommentResponse> => {
  const response = await api.post(
    `/news/${newsId}/comments/${commentId}/replies`,
    null,
    { params: { content } }
  );
  return response.data as CommentResponse;
};

/**
 * Listar respostas de um comentário com paginação
 */
export const listReplies = async (
  newsId: number,
  commentId: number,
  limit: number = 50,
  offset: number = 0
): Promise<CommentResponse[]> => {
  const response = await api.get(
    `/news/${newsId}/comments/${commentId}/replies`,
    { params: { limit, offset } }
  );
  return response.data as CommentResponse[];
};

/**
 * Curtir comentário
 */
export const likeComment = async (commentId: number) => {
  const response = await api.post(`/news/comments/${commentId}/likes`);
  return response.data;
};

/**
 * Descurtir comentário
 */
export const unlikeComment = async (commentId: number) => {
  const response = await api.delete(`/news/comments/${commentId}/likes`);
  return response.data;
};

/**
 * Deletar comentário (soft delete)
 */
export const deleteComment = async (commentId: number) => {
  const response = await api.delete(`/news/comments/${commentId}`);
  return response.data;
};

