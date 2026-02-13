import api from "../auth/axiosConfig";

export interface NotificationPreferences {
  user_id: number;
  lineup_updated: boolean;
  news_feed: boolean;
  interactions: boolean;
  new_events: boolean;
  push_enabled?: boolean;
}

export interface UpdateNotificationPreferences {
  lineup_updated?: boolean;
  news_feed?: boolean;
  interactions?: boolean;
  new_events?: boolean;
  push_enabled?: boolean;
}

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await api.get<NotificationPreferences>("/notifications/preferences");
  return response.data;
};

export const updateNotificationPreferences = async (
  preferences: UpdateNotificationPreferences
): Promise<NotificationPreferences> => {
  const response = await api.put<NotificationPreferences>("/notifications/preferences", preferences);
  return response.data;
};

