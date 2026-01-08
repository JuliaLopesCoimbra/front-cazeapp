// /services/auth/authAdminService.ts

import api from './axiosConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipos
interface InviteAdminData {
  name: string;
  email: string;
}

interface FirstAccessData {
  token: string;
  password: string;
}

interface ResendAdminInviteData {
  email: string;
}

// ---------------------------
// INVITE ADMIN
// ---------------------------
export const inviteAdmin = async (data: InviteAdminData): Promise<void> => {
  try {
    await api.post(`${API_URL}/auth/invite-admin`, data);
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
      message?: string;
    };

    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Erro ao convidar administrador";

    throw new Error(message);
  }
};

// ---------------------------
// FIRST ACCESS
// ---------------------------
export const firstAccess = async (data: FirstAccessData): Promise<void> => {
  try {
    await api.post(`${API_URL}/auth/first-access`, data);
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
      message?: string;
    };

    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Erro ao definir senha";

    throw new Error(message);
  }
};

// ---------------------------
// RESEND ADMIN INVITE
// ---------------------------
export const resendAdminInvite = async (
  data: ResendAdminInviteData
): Promise<void> => {
  try {
    await api.post(`${API_URL}/auth/resend-admin-invite`, data);
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
      message?: string;
    };

    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Erro ao reenviar convite";

    throw new Error(message);
  }
};

