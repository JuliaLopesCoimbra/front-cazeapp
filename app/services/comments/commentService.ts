import api from "../auth/axiosConfig";

export interface CommentUser {
  id: number;
  name: string;
  profile_photo?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  created_at: string;
  user: CommentUser;
}

/**
 * Listar comentários de uma notícia
 */
export const listComments = async (
  newsId: number
): Promise<CommentResponse[]> => {
  const response = await api.get(`/news/${newsId}/comments`);
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

