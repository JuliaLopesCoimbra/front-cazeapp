import api from "@/app/services/auth/axiosConfig";
import { extractApiError } from "@/app/services/apiError";

export interface DataRemovalRequestRow {
  id: number;
  email_submitted: string;
  cpf_masked: string;
  user_id: number | null;
  user_name_snapshot: string | null;
  status: string;
  match_found: boolean;
  created_at: string | null;
  processed_at: string | null;
  processed_by_name: string | null;
  request_ip: string | null;
}

export const listDataRemovalRequests = async (
  status?: string
): Promise<DataRemovalRequestRow[]> => {
  try {
    const response = await api.get<DataRemovalRequestRow[]>(
      "/auth/data-removal/admin/requests",
      { params: { status, limit: 100, offset: 0 } }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao listar solicitações"));
  }
};

export const finalizeDataRemovalRequest = async (
  requestId: number
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(
      `/auth/data-removal/admin/requests/${requestId}/finalize-removal`
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao concluir remoção"));
  }
};
