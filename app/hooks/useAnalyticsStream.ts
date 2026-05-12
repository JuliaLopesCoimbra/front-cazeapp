import { useEffect, useRef } from "react";
import { getApiUrl } from "@/app/utils/apiUrlHelper";
import { AnalyticsSummary, AnalyticsPeriod } from "@/app/services/analytics/analyticsService";

export function useAnalyticsStream(
  eventId: number | undefined,
  period: AnalyticsPeriod,
  onData: (data: AnalyticsSummary) => void,
  enabled: boolean
) {
  // stable ref so the effect doesn't re-run when onData identity changes
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const controller = new AbortController();

    const start = async () => {
      const params = new URLSearchParams({ period });
      if (eventId !== undefined) params.set("event_id", String(eventId));

      try {
        const res = await fetch(`${getApiUrl()}/analytics/stream?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data: AnalyticsSummary = JSON.parse(line.slice(6));
                if (!("error" in data)) {
                  onDataRef.current(data);
                }
              } catch (_) {}
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Analytics stream disconnected:", err);
        }
      }
    };

    start();
    return () => controller.abort();
  }, [eventId, period, enabled]);
}
