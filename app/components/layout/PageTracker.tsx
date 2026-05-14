"use client";

import { usePageTracking } from "@/app/hooks/usePageTracking";

const getUserIdFromToken = (): number | null => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ? parseInt(payload.sub) : null;
  } catch {
    return null;
  }
};

export default function PageTracker() {
  const userId = typeof window !== "undefined" ? getUserIdFromToken() : null;
  usePageTracking(userId);
  return null;
}
