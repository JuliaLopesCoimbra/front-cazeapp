import api from "@/app/services/auth/axiosConfig";
import { extractApiError } from "@/app/services/apiError";

export interface DataRemovalRequestRow {
  id: number;
  email_submitted: string;
  cpf_masked: string;
  user_id: number | null;
  user_name_snapshot: string | null;
  match_found: boolean;
  created_at: string | null;
  processed_at: string | null;
  request_ip: string | null;
}

export const listDataRemovalRequests = async (
  limit = 100,
  offset = 0
): Promise<DataRemovalRequestRow[]> => {
  try {
    const response = await api.get<DataRemovalRequestRow[]>(
      "/auth/data-removal/admin/requests",
      { params: { limit, offset } }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao listar solicitações"));
  }
};
