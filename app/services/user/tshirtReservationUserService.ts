import api from "@/app/services/auth/axiosConfig";
import { extractApiError } from "@/app/services/apiError";

export interface TshirtSizeAvailability {
  size: string;
  quantity_physical: number;
  pending_reservations: number;
  available_to_reserve: number;
}

export interface TshirtReservationMine {
  id: number;
  user_id: number;
  size: string;
  status: string;
  qr_payload: string;
  created_at: string;
  picked_up_at: string | null;
  picked_up_by_name: string | null;
}

export const getTshirtAvailability = async (): Promise<TshirtSizeAvailability[]> => {
  try {
    const res = await api.get<TshirtSizeAvailability[]>("/user/tshirt-availability");
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "Erro ao carregar disponibilidade"));
  }
};

export const getMyTshirtReservation = async (): Promise<TshirtReservationMine | null> => {
  try {
    const res = await api.get<TshirtReservationMine | null>("/user/tshirt-reservation");
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "Erro ao carregar reserva"));
  }
};

export const createTshirtReservation = async (size: string): Promise<TshirtReservationMine> => {
  try {
    const res = await api.post<TshirtReservationMine>("/user/tshirt-reservation", { size });
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "Erro ao reservar"));
  }
};
