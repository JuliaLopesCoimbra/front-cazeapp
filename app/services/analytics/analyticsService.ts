import api from "../auth/axiosConfig";

export type AnalyticsPeriod = "all" | "day" | "week" | "month";

export interface UserMetrics {
  total: number;
  new_today: number;
  new_this_week: number;
  new_this_month: number;
  users_online?: number;
}

export interface InteractionMetrics {
  total_likes: number;
  new_likes_today: number;
  total_comments: number;
  new_comments_today: number;
  total_interactions: number;
}

export interface AdMetrics {
  total_views: number;
  views_today: number;
  total_clicks: number;
  clicks_today: number;
  ctr_percent: number;
}

export interface PhotoFinderMetrics {
  total_uploads: number;
  uploads_today: number;
  total_recognitions: number;
  recognitions_today: number;
  total_downloads: number;
  downloads_today: number;
  recognition_rate_percent: number;
}

export interface PostMetrics {
  total_published: number;
  published_today: number;
  pending_approval: number;
  rejected: number;
}

export interface RouletteMetrics {
  total_spins: number;
  spins_today: number;
  unique_players: number;
}

export interface NotificationMetrics {
  total_sent: number;
  sent_today: number;
  read_rate_percent: number;
  push_subscriptions: number;
}

export interface TopPath {
  path: string;
  count: number;
}

export interface PageViewMetrics {
  total_views: number;
  views_today: number;
  unique_devices: number;
  authenticated_views: number;
  anonymous_views: number;
  top_paths: TopPath[];
  peak_hour_utc: number | null;
  avg_duration_seconds: number;
}

export interface AnalyticsSummary {
  users: UserMetrics;
  interactions: InteractionMetrics;
  ads: AdMetrics;
  photo_finder: PhotoFinderMetrics;
  posts: PostMetrics;
  roulette: RouletteMetrics;
  notifications: NotificationMetrics;
  page_views: PageViewMetrics;
  generated_at: string;
  cached: boolean;
}

export const getAnalyticsSummary = async (
  eventId?: number,
  period: AnalyticsPeriod = "all"
): Promise<AnalyticsSummary> => {
  const params: Record<string, string | number> = { period };
  if (eventId !== undefined) params.event_id = eventId;
  const res = await api.get<AnalyticsSummary>("/analytics/summary", { params });
  return res.data;
};

export interface InstanceMetrics {
  instance_id: string;
  label: string;
  cpu_percent: number | null;
  network_in_bytes: number | null;
  network_out_bytes: number | null;
  status_ok: boolean | null;
}

export interface ALBMetrics {
  request_count: number | null;
  errors_5xx: number | null;
  avg_response_ms: number | null;
}

export interface InfraMetrics {
  available: boolean;
  instances: InstanceMetrics[];
  alb: ALBMetrics | null;
  period_minutes: number;
  generated_at: string;
}

export const getInfraMetrics = async (): Promise<InfraMetrics> => {
  const res = await api.get<InfraMetrics>("/analytics/infra");
  return res.data;
};
