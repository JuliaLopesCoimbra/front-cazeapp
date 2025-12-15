import api from "../auth/axiosConfig";

/* =====================
   TIPOS
===================== */

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  banner_image?: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
}


export const getEvents = async (): Promise<EventResponse[]> => {
  const response = await api.get<EventResponse[]>("/admin/events");
  return response.data;
};
