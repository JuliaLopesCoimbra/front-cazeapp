import api from "../auth/axiosConfig";

export interface MusicLyricsResponse {
  id: number;
  song_name: string;
  singer?: string;
  lyrics: string;
  image_url?: string;
  event_id: number;
  created_at: string;
}

export const getMusicLyricsByEvent = async (
  eventId: number
): Promise<MusicLyricsResponse[]> => {
  const response = await api.get<MusicLyricsResponse[]>(
    `/admin/events/${eventId}/music-lyrics`
  );
  return response.data;
};
