export interface UserPredictionSummary {
  home_score: number;
  away_score: number;
  points_earned: number;
  status: "pending" | "exact" | "outcome" | "wrong" | "cancelled";
}

export interface BolaoFixture {
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  match_date: string;
  status: string;
  betting_closes_at: string;
  user_prediction: UserPredictionSummary | null;
}

export interface CreatePredictionPayload {
  fixture_id: number;
  home_score_prediction: number;
  away_score_prediction: number;
}

export interface BolaoPredicitionResponse {
  id: number;
  fixture_id: number;
  home_score_prediction: number;
  away_score_prediction: number;
  points_earned: number;
  status: UserPredictionSummary["status"];
  settled_at: string | null;
  created_at: string;
}

export interface BolaoRankingEntry {
  rank: number;
  user_id: number;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  exact_predictions: number;
  correct_outcomes: number;
}

export interface BolaoMyPoints {
  total_points: number;
  rank: number;
  exact_predictions: number;
  correct_outcomes: number;
}

export interface BolaoPrize {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  total_quantity: number;
  remaining_qty: number;
  points_required: number;
  prize_type: "shirt" | "ticket" | "merch" | "digital";
  is_active: boolean;
}

export interface BolaoRedemption {
  id: number;
  prize_id: number;
  points_spent: number;
  status: "pending" | "approved" | "delivered" | "cancelled";
  redeemed_at: string;
}
