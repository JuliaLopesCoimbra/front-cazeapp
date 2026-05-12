import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getApiUrl } from "@/app/utils/apiUrlHelper";

const getDeviceType = (): string => {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};

const getOrCreateSessionId = (): string => {
  let id = sessionStorage.getItem("analytics_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("analytics_sid", id);
  }
  return id;
};

export function usePageTracking(userId?: number | null, eventId?: number | null) {
  const pathname = usePathname();
  const startRef = useRef<number>(Date.now());
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sessionId = getOrCreateSessionId();
    const now = Date.now();
    const duration = prevPathRef.current !== null
      ? Math.floor((now - startRef.current) / 1000)
      : null;

    const payload = {
      session_id: sessionId,
      path: pathname,
      referrer_path: prevPathRef.current,
      device_type: getDeviceType(),
      duration_seconds: duration,
      user_id: userId ?? null,
      event_id: eventId ?? null,
    };

    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${getApiUrl()}/analytics/track`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    startRef.current = now;
    prevPathRef.current = pathname;
  }, [pathname, userId, eventId]);
}
