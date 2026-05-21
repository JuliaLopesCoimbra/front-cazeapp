"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getBrazilFixtures,
  getBrazilLive,
  getFixtureEvents,
  getWcStandings,
  isLive,
  isFinished,
  ROUND_TO_PHASE,
  type BrazilFixture,
} from "@/app/services/football/footballService";
import { QueryKeys } from "@/app/lib/queryKeys";

export function useBrazilFixtures() {
  return useQuery({
    queryKey: QueryKeys.fixtures,
    queryFn: getBrazilFixtures,
    staleTime: 5 * 60_000,
  });
}

export function useBrazilLive() {
  return useQuery({
    queryKey: QueryKeys.liveFixtures,
    queryFn: getBrazilLive,
    staleTime: 0,
    refetchInterval: (query) => {
      const hasLive = (query.state.data?.length ?? 0) > 0;
      return hasLive ? 30_000 : 60_000;
    },
  });
}

export function useFixtureEvents(fixtureId: number | null) {
  return useQuery({
    queryKey: QueryKeys.fixtureById(fixtureId ?? 0),
    queryFn: () => getFixtureEvents(fixtureId!),
    enabled: fixtureId != null,
    staleTime: 0,
    refetchInterval: (query) => {
      // Only poll if the fixture is currently live
      return 30_000;
    },
  });
}

export function useWcStandings() {
  return useQuery({
    queryKey: ["wc-standings"],
    queryFn: getWcStandings,
    staleTime: 10 * 60_000,
  });
}

/** Returns the next upcoming or currently live Brazil fixture */
export function useNextFixture(): BrazilFixture | null {
  const { data: fixtures } = useBrazilFixtures();
  const { data: liveFixtures } = useBrazilLive();

  if (!fixtures) return null;
  if (liveFixtures && liveFixtures.length > 0) return liveFixtures[0];

  const upcoming = fixtures
    .filter((f) => !isFinished(f))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );

  return upcoming[0] ?? null;
}

/** Groups fixtures by phase key */
export function useFixturesByPhase() {
  const { data: fixtures, isLoading, isError } = useBrazilFixtures();

  const grouped: Record<string, BrazilFixture[]> = {};
  if (fixtures) {
    for (const f of fixtures) {
      const phase = ROUND_TO_PHASE[f.league.round] ?? "grupos";
      if (!grouped[phase]) grouped[phase] = [];
      grouped[phase].push(f);
    }
    // Sort each phase by date
    for (const phase of Object.keys(grouped)) {
      grouped[phase].sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
      );
    }
  }

  return { grouped, isLoading, isError };
}
