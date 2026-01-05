import api from "../auth/axiosConfig";

export interface SambaSchoolResponse {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  event_id: number;
  created_at: string;
}

export const getSambaSchoolsByEvent = async (
  eventId: number
): Promise<SambaSchoolResponse[]> => {
  const response = await api.get<SambaSchoolResponse[]>(
    `/admin/events/${eventId}/samba-schools`
  );
  return response.data;
};
