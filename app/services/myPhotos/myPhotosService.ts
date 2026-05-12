import api from "../auth/axiosConfig";

export interface DownloadedPhoto {
  id: number;
  image_url: string;
  downloaded_at: string;
  event_id?: number;
  event_name?: string;
  similarity?: string;
}

export const getMyDownloadedPhotos = async (limit: number = 100, offset: number = 0, eventId?: number): Promise<DownloadedPhoto[]> => {
  const { data } = await api.get<DownloadedPhoto[]>("/downloaded-photos", {
    params: { limit, offset, ...(eventId !== undefined && { event_id: eventId }) }
  });
  return data;
};

