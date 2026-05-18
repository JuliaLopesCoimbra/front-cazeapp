import axiosInstance from "@/app/services/auth/axiosConfig";

// ─── Tipos da API-Sports ──────────────────────────────────────────────────────

export interface FixtureStatus {
  long: string;
  short: string;   // "NS" | "1H" | "HT" | "2H" | "ET" | "P" | "FT" | "AET" | "PEN"
  elapsed: number | null;
}

export interface FixtureTeam {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface BrazilFixture {
  fixture: {
    id: number;
    date: string;
    status: FixtureStatus;
    venue: { name: string; city: string };
  };
  league: {
    round: string;  // "Group Stage - 1" | "Round of 16" | "Quarter-finals" | "Semi-finals" | "Final"
    season: number;
  };
  teams: {
    home: FixtureTeam;
    away: FixtureTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: "Goal" | "Card" | "subst" | "Var";
  detail: string;
  comments: string | null;
}

export interface StandingTeam {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
export const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

export function isLive(fixture: BrazilFixture) {
  return LIVE_STATUSES.has(fixture.fixture.status.short);
}

export function isFinished(fixture: BrazilFixture) {
  return FINISHED_STATUSES.has(fixture.fixture.status.short);
}

// Mapeia o round (já traduzido pelo backend) para a fase interna
export const ROUND_TO_PHASE: Record<string, string> = {
  // PT-BR (retornado pelo backend após tradução)
  "Fase de Grupos": "grupos",
  "16 avos de Final": "dezesseis",
  "Oitavas de Final": "oitavas",
  "Quartas de Final": "quartas",
  "Semifinais": "semi",
  "Disputa do 3º Lugar": "terceiro",
  "Final": "final",
  // Inglês como fallback (caso o cache ainda tenha dados antigos)
  "Group Stage - 1": "grupos",
  "Group Stage - 2": "grupos",
  "Group Stage - 3": "grupos",
  "Round of 32": "dezesseis",
  "Round of 16": "oitavas",
  "Quarter-finals": "quartas",
  "Semi-finals": "semi",
  "3rd Place Final": "terceiro",
};

// ─── Funções de API ───────────────────────────────────────────────────────────

export async function getBrazilFixtures(): Promise<BrazilFixture[]> {
  const { data } = await axiosInstance.get<BrazilFixture[]>("/football/brazil/fixtures");
  return data;
}

export async function getBrazilLive(): Promise<BrazilFixture[]> {
  const { data } = await axiosInstance.get<BrazilFixture[]>("/football/brazil/live");
  return data;
}

export async function getFixtureEvents(fixtureId: number): Promise<FixtureEvent[]> {
  const { data } = await axiosInstance.get<FixtureEvent[]>(`/football/fixtures/${fixtureId}/events`);
  return data;
}

export async function getWcStandings(): Promise<StandingTeam[][]> {
  const { data } = await axiosInstance.get<Array<{ league: { standings: StandingTeam[][] } }>>("/football/standings");
  return data.flatMap((entry) => entry?.league?.standings ?? []);
}

export interface BrazilStats {
  jogos: number;
  vitorias: number;
  empates: number;
  gols: number;
  grupo: string;
  pontos: number;
}

export async function getBrazilStats(): Promise<BrazilStats | null> {
  try {
    const { data } = await axiosInstance.get<BrazilStats>("/football/brazil/stats");
    return data;
  } catch {
    return null;
  }
}

export interface LiveNowGame {
  id: number;
  league: string;
  home: string;
  away: string;
  home_goals: number | null;
  away_goals: number | null;
  elapsed: number | null;
  status: string;
}

export async function getLiveNowGames(): Promise<LiveNowGame[]> {
  const { data } = await axiosInstance.get<LiveNowGame[]>("/football/debug/live-now");
  return data;
}

export async function mockLiveOn(elapsed = 32, homeGoals = 1, awayGoals = 0): Promise<void> {
  await axiosInstance.post(
    `/football/debug/mock-live?elapsed=${elapsed}&home_goals=${homeGoals}&away_goals=${awayGoals}`
  );
}

export async function mockLiveWithFixture(fixtureId: number): Promise<void> {
  await axiosInstance.post(`/football/debug/mock-live?fixture_id=${fixtureId}`);
}

export async function mockLiveOff(): Promise<void> {
  await axiosInstance.delete("/football/debug/mock-live");
}
