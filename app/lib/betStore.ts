export interface SavedBet {
  fixture_id: number;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  home_score: number;
  away_score: number;
  confirmed_at: string;
}

const KEY = "caze_saved_bets";

export function getSavedBets(): SavedBet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveBet(bet: Omit<SavedBet, "confirmed_at">): void {
  const existing = getSavedBets().filter((b) => b.fixture_id !== bet.fixture_id);
  existing.unshift({ ...bet, confirmed_at: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(existing));
}

export function removeBet(fixtureId: number): void {
  const existing = getSavedBets().filter((b) => b.fixture_id !== fixtureId);
  localStorage.setItem(KEY, JSON.stringify(existing));
}
