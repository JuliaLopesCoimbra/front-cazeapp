import api from "@/app/services/auth/axiosConfig";
import { extractApiError } from "@/app/services/apiError";

export interface TshirtStockItem {
  id: number;
  size: string;
  quantity: number;
  created_at: string;
  updated_at: string | null;
  updated_by_id: number | null;
  /** Reservas ainda não retiradas (bloqueiam nova reserva neste tamanho). */
  pending_reservations?: number;
  /** Estoque físico menos reservas pendentes. */
  available_to_reserve?: number;
  /** Reservas já retiradas (QR escaneado). */
  picked_up_count?: number;
}

export interface TshirtStockMovement {
  id: number;
  stock_item_id: number;
  size: string;
  direction: "in" | "out";
  quantity: number;
  performed_by_id: number;
  performed_by_name: string;
  created_at: string;
}

export const ALLOWED_SIZES = ["PP", "P", "M", "G", "GG", "EXG"] as const;

export const listTshirtStock = async (): Promise<TshirtStockItem[]> => {
  try {
    const response = await api.get<TshirtStockItem[]>("/admin/tshirt-stock");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao carregar estoque"));
  }
};

export const listTshirtStockMovements = async (
  limit = 100,
  offset = 0
): Promise<TshirtStockMovement[]> => {
  try {
    const response = await api.get<TshirtStockMovement[]>(
      "/admin/tshirt-stock/movements",
      { params: { limit, offset } }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao carregar histórico"));
  }
};

export const registerTshirtStockMovement = async (
  itemId: number,
  direction: "in" | "out",
  quantity: number
): Promise<TshirtStockItem> => {
  try {
    const response = await api.post<TshirtStockItem>(
      `/admin/tshirt-stock/${itemId}/movements`,
      { direction, quantity }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao registrar movimento"));
  }
};

export const createTshirtStockItem = async (
  size: string,
  quantity: number
): Promise<TshirtStockItem> => {
  try {
    const response = await api.post<TshirtStockItem>("/admin/tshirt-stock", {
      size,
      quantity,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao criar item"));
  }
};

export const updateTshirtStockItem = async (
  itemId: number,
  quantity: number
): Promise<TshirtStockItem> => {
  try {
    const response = await api.put<TshirtStockItem>(
      `/admin/tshirt-stock/${itemId}`,
      { quantity }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao atualizar"));
  }
};

export const deleteTshirtStockItem = async (itemId: number): Promise<void> => {
  try {
    await api.delete(`/admin/tshirt-stock/${itemId}`);
  } catch (error) {
    throw new Error(extractApiError(error, "Erro ao excluir"));
  }
};
