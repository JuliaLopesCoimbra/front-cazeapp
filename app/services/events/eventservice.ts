import api from "../auth/axiosConfig";


export interface EventResponse {
  id: number;
  title: string;
  description: string;
  banner_image?: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  is_active: boolean; 
}


export const getEvents = async (): Promise<EventResponse[]> => {
  const response = await api.get<EventResponse[]>("/admin/events");
  return response.data;
};
export const getEventById = async (eventId: number): Promise<EventResponse> => {
  const response = await api.get<EventResponse>(`/admin/events/${eventId}`);
  return response.data;
};
export const activateEvent = async (eventId: number) => {
  const response = await api.patch(`/admin/events/${eventId}/activate`);
  return response.data;
};

export const deactivateEvent = async (eventId: number) => {
  const response = await api.patch(`/admin/events/${eventId}/deactivate`);
  return response.data;
};
