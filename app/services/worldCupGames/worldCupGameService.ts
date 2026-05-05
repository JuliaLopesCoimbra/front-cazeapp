import api from "../auth/axiosConfig";

export interface WorldCupGameResponse {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  photo_url?: string;
  game_date?: string; // YYYY-MM-DD
  game_time?: string; // HH:mm:ss
  created_at: string;
  created_by_id?: number;
  updated_at?: string;
}

export interface CreateWorldCupGameData {
  title: string;
  description?: string;
  game_date?: string; // YYYY-MM-DD
  game_time?: string; // HH:mm
  photo?: File;
}

export async function getWorldCupGames(
  eventId: number,
  limit = 50,
  offset = 0
): Promise<WorldCupGameResponse[]> {
  const res = await api.get<WorldCupGameResponse[]>(
    `/admin/events/${eventId}/world-cup-games`,
    { params: { limit, offset } }
  );
  return res.data;
}

export async function createWorldCupGame(
  eventId: number,
  data: CreateWorldCupGameData
): Promise<WorldCupGameResponse> {
  const form = new FormData();
  form.append("title", data.title);
  if (data.description) form.append("description", data.description);
  if (data.game_date) form.append("game_date", data.game_date);
  if (data.game_time) form.append("game_time", data.game_time);
  if (data.photo) form.append("photo", data.photo);

  const res = await api.post<WorldCupGameResponse>(`/admin/events/${eventId}/world-cup-games`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateWorldCupGame(
  eventId: number,
  gameId: number,
  data: CreateWorldCupGameData
): Promise<WorldCupGameResponse> {
  const form = new FormData();
  form.append("title", data.title);
  if (data.description) form.append("description", data.description);
  if (data.game_date) form.append("game_date", data.game_date);
  if (data.game_time) form.append("game_time", data.game_time);
  if (data.photo) form.append("photo", data.photo);

  const res = await api.put<WorldCupGameResponse>(
    `/admin/events/${eventId}/world-cup-games/${gameId}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}

export async function deleteWorldCupGame(
  eventId: number,
  gameId: number
): Promise<void> {
  await api.delete(`/admin/events/${eventId}/world-cup-games/${gameId}`);
}
