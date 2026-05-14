import api from "@/app/services/auth/axiosConfig";
import { extractApiError } from "@/app/services/apiError";

export interface TshirtReservationAdminRow {
  id: number;
  user_id: number;
  stock_item_id: number;
  size: string;
  status: string;
  user_name_snapshot: string;
  user_email_snapshot: string;
  qr_payload: string;
  created_at: string;
  picked_up_at: string | null;
  picked_up_by_id: number | null;
  picked_up_by_name: string | null;
}

export const listTshirtReservationsAdmin = async (
  limit = 100,
  offset = 0
): Promise<TshirtReservationAdminRow[]> => {
  try {
    const res = await api.get<TshirtReservationAdminRow[]>("/admin/tshirt-reservations", {
      params: { limit, offset },
    });
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "Erro ao listar reservas"));
  }
};

export interface TshirtRedeemResult {
  message: string;
  reservation: {
    id: number;
    size: string;
    status: string;
    user_name_snapshot: string;
  };
}

export const redeemTshirtReservation = async (
  token: string
): Promise<TshirtRedeemResult> => {
  try {
    const res = await api.post<TshirtRedeemResult>("/admin/tshirt-reservations/redeem", {
      token: token.trim(),
    });
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "Erro ao registrar retirada"));
  }
};

export interface TshirtCpfLookupResult {
  reservation_id: number;
  user_name: string;
  size: string;
  status: string;
  qr_token: string;
}

export const lookupTshirtReservationByCpf = async (
  cpf: string
): Promise<TshirtCpfLookupResult> => {
  try {
    const res = await api.get<TshirtCpfLookupResult>("/admin/tshirt-reservations/lookup-cpf", {
      params: { cpf },
    });
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "CPF não encontrado"));
  }
};
