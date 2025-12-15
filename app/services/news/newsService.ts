import api from "../auth/axiosConfig";

export interface NewsResponse {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export const getEventNews = async (
  eventId: number,
  limit = 10,
  offset = 0
): Promise<NewsResponse[]> => {
  const response = await api.get(
    `/admin/events/${eventId}/news`,
    {
      params: { limit, offset },
    }
  );

  return response.data as NewsResponse[];
};
