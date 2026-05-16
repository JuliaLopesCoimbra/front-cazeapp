import api from "@/app/services/auth/axiosConfig";
import { extractApiError } from "@/app/services/apiError";

export interface PhotoSyncLogEntry {
  id: number;
  event_id: string;
  server_name: string;
  cycle_at: string;
  new_files: number;
  uploaded: number;
  indexed: number;
  no_face: number;
  errors: number;
  duration_seconds: number;
  total_drive_files: number;
}

export interface PhotoSyncStatus {
  is_alive: boolean;
  last_cycle_at: string | null;
  seconds_since_last_cycle: number | null;
  total_indexed_today: number;
  total_cycles_today: number;
  total_drive_files: number;
  total_s3_files: number;
  recent_logs: PhotoSyncLogEntry[];
  upload_logs: PhotoSyncLogEntry[];
}

export const getPhotoSyncStatus = async (eventId?: string): Promise<PhotoSyncStatus> => {
  try {
    const res = await api.get<PhotoSyncStatus>("/admin/photo-sync/status", {
      params: eventId ? { event_id: eventId } : {},
    });
    return res.data;
  } catch (e) {
    throw new Error(extractApiError(e, "Erro ao carregar status do robô"));
  }
};
