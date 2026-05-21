import api from "@/app/services/auth/axiosConfig";
import type {
  BolaoFixture,
  CreatePredictionPayload,
  BolaoPredicitionResponse,
  BolaoRankingEntry,
  BolaoMyPoints,
  BolaoPrize,
  BolaoRedemption,
} from "@/app/types/bolao";

export async function getFixtures(): Promise<BolaoFixture[]> {
  const { data } = await api.get<BolaoFixture[]>("/bolao/fixtures");
  return data;
}

export async function createPrediction(
  payload: CreatePredictionPayload
): Promise<BolaoPredicitionResponse> {
  const { data } = await api.post<BolaoPredicitionResponse>(
    "/bolao/predictions",
    payload
  );
  return data;
}

export async function getRanking(
  limit = 50,
  offset = 0
): Promise<BolaoRankingEntry[]> {
  const { data } = await api.get<BolaoRankingEntry[]>("/bolao/ranking", {
    params: { limit, offset },
  });
  return data;
}

export async function getMyPoints(): Promise<BolaoMyPoints> {
  const { data } = await api.get<BolaoMyPoints>("/bolao/my-points");
  return data;
}

export async function getPrizes(): Promise<BolaoPrize[]> {
  const { data } = await api.get<BolaoPrize[]>("/bolao/prizes");
  return data;
}

export async function redeemPrize(
  prize_id: number
): Promise<BolaoRedemption> {
  const { data } = await api.post<BolaoRedemption>("/bolao/redeem", {
    prize_id,
  });
  return data;
}

export async function getMyRedemptions(): Promise<BolaoRedemption[]> {
  const { data } = await api.get<BolaoRedemption[]>("/bolao/my-redemptions");
  return data;
}

export async function devSettle(
  fixture_id: number,
  actual_home: number,
  actual_away: number
): Promise<void> {
  await api.post("/bolao/dev/settle", { fixture_id, actual_home, actual_away });
}

export async function devReset(fixture_id: number): Promise<void> {
  await api.post(`/bolao/dev/reset/${fixture_id}`);
}
