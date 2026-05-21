"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/app/lib/queryKeys";
import {
  getFixtures,
  createPrediction,
  getRanking,
  getMyPoints,
  getPrizes,
  redeemPrize,
  getMyRedemptions,
} from "@/app/services/bolao/bolao.service";
import type { CreatePredictionPayload } from "@/app/types/bolao";

export function useBolaoFixtures() {
  return useQuery({
    queryKey: QueryKeys.bolaoFixtures,
    queryFn: getFixtures,
    staleTime: 60_000,
  });
}

export function useBolaoMyPoints() {
  return useQuery({
    queryKey: QueryKeys.bolaoMyPoints,
    queryFn: getMyPoints,
    staleTime: 30_000,
  });
}

export function useBolaoRanking(limit = 50, offset = 0) {
  return useQuery({
    queryKey: [...QueryKeys.bolaoRanking, limit, offset],
    queryFn: () => getRanking(limit, offset),
    staleTime: 60_000,
  });
}

export function useBolaoPrizes() {
  return useQuery({
    queryKey: QueryKeys.bolaoPrizes,
    queryFn: getPrizes,
    staleTime: 5 * 60_000,
  });
}

export function useBolaoMyRedemptions() {
  return useQuery({
    queryKey: ["bolao", "my-redemptions"] as const,
    queryFn: getMyRedemptions,
    staleTime: 30_000,
  });
}

export function useCreatePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePredictionPayload) => createPrediction(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoFixtures });
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoMyPoints });
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoMyPrediction(variables.fixture_id) });
    },
  });
}

export function useRedeemPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prizeId: number) => redeemPrize(prizeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoPrizes });
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoMyPoints });
      qc.invalidateQueries({ queryKey: ["bolao", "my-redemptions"] });
    },
  });
}
