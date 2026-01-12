import api from "../auth/axiosConfig";
import { NewsResponse } from "../news/newsService";

export const getMyPosts = async (
  limit = 10,
  offset = 0
): Promise<NewsResponse[]> => {
  const response = await api.get("/admin/events/my-posts", {
    params: { limit, offset },
  });

  return response.data as NewsResponse[];
};

