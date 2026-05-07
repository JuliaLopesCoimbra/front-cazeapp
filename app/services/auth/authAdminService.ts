// /services/auth/authAdminService.ts

import api from './axiosConfig';
import { extractApiError } from '../apiError';

interface InviteAdminData {
  name: string;
  email: string;
}

export interface UserInfo {
  id: number;
  name: string | null;
  email: string;
}

export interface UserResponse {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  invited_by_id: number | null;
  invited_by: UserInfo | null;
  deactivated_by_id: number | null;
  deactivated_by: UserInfo | null;
  deactivated_at: string | null;
  reactivated_by_id: number | null;
  reactivated_by: UserInfo | null;
  reactivated_at: string | null;
  created_at: string;
  is_email_verified: boolean;
  last_login: string | null;
}

interface FirstAccessData {
  token: string;
  password: string;
}

interface ResendAdminInviteData {
  email: string;
}

export const inviteAdmin = async (data: InviteAdminData): Promise<void> => {
  try {
    await api.post("/auth/invite-admin", data);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao convidar administrador"));
  }
};

export const firstAccess = async (data: FirstAccessData): Promise<void> => {
  try {
    await api.post("/auth/first-access", data);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao definir senha"));
  }
};

export const resendAdminInvite = async (data: ResendAdminInviteData): Promise<void> => {
  try {
    await api.post("/auth/resend-admin-invite", data);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao reenviar convite"));
  }
};

export const inviteSubadmin = async (data: InviteAdminData): Promise<void> => {
  try {
    await api.post("/auth/invite-subadmin", data);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao convidar subadmin"));
  }
};

export const inviteColunista = async (data: InviteAdminData): Promise<void> => {
  try {
    await api.post("/auth/invite-colunista", data);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao convidar colunista"));
  }
};

export const revokeColunistaAccess = async (colunistaId: number): Promise<void> => {
  try {
    await api.post(`/auth/revoke-colunista/${colunistaId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao revogar acesso do colunista"));
  }
};

export const revokeSubadminAccess = async (subadminId: number): Promise<void> => {
  try {
    await api.post(`/auth/revoke-subadmin/${subadminId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao revogar acesso do subadmin"));
  }
};

export const revokeUserAccess = async (userId: number): Promise<void> => {
  try {
    await api.post(`/auth/revoke-user/${userId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao revogar acesso do usuário"));
  }
};

export const reactivateColunistaAccess = async (colunistaId: number): Promise<void> => {
  try {
    await api.post(`/auth/reactivate-colunista/${colunistaId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao reativar acesso do colunista"));
  }
};

export const reactivateSubadminAccess = async (subadminId: number): Promise<void> => {
  try {
    await api.post(`/auth/reactivate-subadmin/${subadminId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao reativar acesso do subadmin"));
  }
};

export const reactivateUserAccess = async (userId: number): Promise<void> => {
  try {
    await api.post(`/auth/reactivate-user/${userId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao reativar acesso do usuário"));
  }
};

export const listSubadmins = async (limit?: number, offset?: number, search?: string, status?: string): Promise<UserResponse[]> => {
  try {
    const params: any = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;
    if (search) params.search = search;
    if (status) params.status = status;
    const response = await api.get<UserResponse[]>("/auth/subadmins", { params });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao listar subadmins"));
  }
};

export const listColunistas = async (limit?: number, offset?: number, search?: string, status?: string): Promise<UserResponse[]> => {
  try {
    const params: any = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;
    if (search) params.search = search;
    if (status) params.status = status;
    const response = await api.get<UserResponse[]>("/auth/colunistas", { params });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao listar colunistas"));
  }
};

export const listUsers = async (limit?: number, offset?: number, search?: string, status?: string): Promise<UserResponse[]> => {
  try {
    const params: any = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;
    if (search) params.search = search;
    if (status) params.status = status;
    const response = await api.get<UserResponse[]>("/auth/users", { params });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao listar usuários"));
  }
};

export interface UserDetailResponse {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  profile_photo: string | null;
  is_email_verified: boolean;
  last_login: string | null;
  created_at: string;
  birth_date: string | null;
  gender: string | null;
  cpf_masked: string | null;
  age_verified: boolean;
  lgpd_accepted: boolean;
  lgpd_accepted_at: string | null;
  age_terms_accepted: boolean;
  age_terms_accepted_at: string | null;
  marketing_email_accepted: boolean;
  invited_by_id: number | null;
  invited_by: UserInfo | null;
  deactivated_by_id: number | null;
  deactivated_by: UserInfo | null;
  deactivated_at: string | null;
  reactivated_by_id: number | null;
  reactivated_by: UserInfo | null;
  reactivated_at: string | null;
}

export const getUserDetail = async (userId: number): Promise<UserDetailResponse> => {
  try {
    const response = await api.get<UserDetailResponse>(`/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao carregar perfil do usuário"));
  }
};

export const resendInvite = async (userId: number): Promise<void> => {
  try {
    await api.post(`/auth/resend-invite/${userId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao reenviar convite"));
  }
};

export interface UserActivityItem {
  type: "photo_download" | "face_search" | "like" | "comment" | "post";
  label: string;
  detail: string | null;
  event_id: number | null;
  event_name: string | null;
  timestamp: string;
}

export const getUserActivity = async (userId: number, limit = 10, offset = 0): Promise<UserActivityItem[]> => {
  try {
    const response = await api.get<UserActivityItem[]>(`/auth/users/${userId}/activity`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao carregar histórico de atividades"));
  }
};
