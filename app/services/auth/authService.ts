// /services/authService.ts

import axios from 'axios';
import { LoginResponse } from '@/app/types/types';
import api from './axiosConfig';
import { getApiUrl } from '@/app/utils/apiUrlHelper';

const API_URL = getApiUrl();

// Tipos para login normal
interface LoginData {
  email: string;
  password: string;
}
interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
interface RegisterData {
  name: string;
  email: string;
  password: string;
  birth_date: string;
}
export interface MeResponse {
  id: number;
  name: string;
  photo_url?: string;
  current_environment: {
    id: number;
    name: string;
  };
}
// ---------------------------
// LOGIN NORMAL
// ---------------------------
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data as LoginResponse;
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

    // Verificar se precisa verificar idade - verificar primeiro antes de processar outros erros
    const detail = err.response?.data?.detail;
    if (detail) {
      try {
        const parsedDetail = JSON.parse(detail);
        if (parsedDetail.requires_age_verification && parsedDetail.temp_token) {
          // Criar um erro especial que será tratado no frontend
          const specialError: any = new Error("AGE_VERIFICATION_REQUIRED");
          specialError.tempToken = parsedDetail.temp_token;
          throw specialError; // Lança o erro especial que será capturado no componente
        }
      } catch (parseError: any) {
        // Se for o erro especial que criamos, relançar
        if (parseError.message === "AGE_VERIFICATION_REQUIRED") {
          throw parseError;
        }
        // Se não for JSON válido ou não for o erro especial, continua
      }
    }

    // Extrair mensagem de erro normal
    let message = 
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Erro ao fazer login";

    // Tentar parsear se for JSON (pode conter informações estruturadas)
    try {
      const parsed = JSON.parse(message);
      if (typeof parsed === 'object' && parsed.message) {
        message = parsed.message;
      }
    } catch {
      // Não é JSON, usar mensagem original
    }

    throw new Error(message);
  }
};

export const refreshAuthToken = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    return response.data as RefreshResponse;
  } catch {
    throw new Error("Sessão expirada");
  }
};
// ---------------------------
// LOGIN VIA GOOGLE
// ---------------------------
export const initGoogleLogin = async (): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/init`);
    return (response.data as { auth_url: string }).auth_url; // retorna URL de autenticação
  } catch {
    throw new Error('Erro ao iniciar login com Google');
  }
};
// ---------------------------
// LOGIN VIA FACEBOOK
// ---------------------------
export const initFacebookLogin = async (): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/auth/facebook/init`);
    return (response.data as { auth_url: string }).auth_url;
  } catch {
    throw new Error('Erro ao iniciar login com Facebook');
  }
};

// ---------------------------
// REGISTER
// ---------------------------
export const registerUser = async (
  data: RegisterData
): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/register`, data);
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
      "Erro ao realizar cadastro";

    throw new Error(message);
  }
};

export const verifyEmail = async (token: string) => {
  const response = await api.post("/auth/verify-email", { token });
  return response.data;
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/resend-verification`, { email });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
        status?: number;
      };
      message?: string;
    };

    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Erro ao reenviar email de verificação";

    throw new Error(message);
  }
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me");
  return response.data;
};

// ---------------------------
// VERIFICAÇÃO DE IDADE
// ---------------------------
export const verifyAge = async (
  birthDate: string,
  confirmed: boolean,
  token?: string
): Promise<void> => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    await axios.post(
      `${API_URL}/auth/verify-age`,
      { confirmed, birth_date: birthDate },
      { headers }
    );
  } catch (error: any) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Erro ao verificar idade";
    throw new Error(message);
  }
};
