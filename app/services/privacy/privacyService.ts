import { extractApiError } from "@/app/services/apiError";
import api from "@/app/services/auth/axiosConfig";

interface CheckIdentityPayload {
  email: string;
  cpf: string;
}

interface RequestRemovalPayload extends CheckIdentityPayload {
  confirmed: boolean;
}

export interface DataRemovalCheckResult {
  exists: boolean;
  message?: string;
  reason?: string;
}

/** Base alinhada ao backend: rotas também existem sob /privacy (legado). */
const DATA_REMOVAL_BASE = "/auth/data-removal";

export const checkDataRemovalIdentity = async ({
  email,
  cpf,
}: CheckIdentityPayload): Promise<DataRemovalCheckResult> => {
  try {
    const response = await api.post(`${DATA_REMOVAL_BASE}/check`, {
      email,
      cpf,
    });

    return response.data as DataRemovalCheckResult;
  } catch (error: unknown) {
    throw new Error(extractApiError(error, "Não foi possível validar os dados informados"));
  }
};

export const requestDataRemoval = async ({
  email,
  cpf,
  confirmed,
}: RequestRemovalPayload) => {
  try {
    const response = await api.post(`${DATA_REMOVAL_BASE}/request`, {
      email,
      cpf,
      confirmed,
    });

    return response.data as { message?: string; request_id?: number };
  } catch (error: unknown) {
    throw new Error(extractApiError(error, "Não foi possível registrar a solicitação de remoção"));
  }
};
