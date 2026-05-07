"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UserResponse } from "@/app/services/auth/authAdminService";

const LIMIT = 20;

type ListFunction = (limit: number, offset: number, search?: string, status?: string) => Promise<UserResponse[]>;

interface UseInfiniteUsersReturn {
  users: UserResponse[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  loaderRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteUsers(
  listFunction: ListFunction,
  searchTerm: string = "",
  statusFilter: string = ""
): UseInfiniteUsersReturn {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const searchRef = useRef(searchTerm);
  const statusRef = useRef(statusFilter);
  searchRef.current = searchTerm;
  statusRef.current = statusFilter;
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(
    async (fromOffset: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const data = await listFunction(
          LIMIT,
          fromOffset,
          searchRef.current || undefined,
          statusRef.current || undefined
        );
        if (fromOffset === 0) {
          setUsers(data);
        } else {
          setUsers((prev) => {
            const merged = [...prev, ...data];
            return Array.from(new Map(merged.map((u) => [u.id, u])).values());
          });
        }
        offsetRef.current = fromOffset + data.length;
        setHasMore(data.length === LIMIT);
      } catch (err) {
        console.error("Erro ao carregar usuários", err);
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [listFunction]
  );

  // Reload whenever search or status changes (and on initial mount)
  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      loadPage(offsetRef.current);
    }
  }, [hasMore, loadPage]);

  const reset = useCallback(() => {
    offsetRef.current = 0;
    setHasMore(true);
    loadPage(0);
  }, [loadPage]);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.5, rootMargin: "120px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return { users, loading, hasMore, loadMore, reset, loaderRef };
}
