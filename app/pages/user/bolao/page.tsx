"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Typography, Tabs, Tab, Skeleton } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import { PointsBadge } from "@/app/components/shared/PointsBadge";
import { useBolaoFixtures, useBolaoMyPoints } from "@/app/hooks/useBolao";
import type { BolaoFixture } from "@/app/types/bolao";

type TabValue = "open" | "closed";

function FixtureRowSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      height={76}
      sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A" }}
    />
  );
}

function FixtureRow({ fixture }: { fixture: BolaoFixture }) {
  const isClosed = new Date() >= new Date(fixture.betting_closes_at);
  const pred = fixture.user_prediction;

  return (
    <Link href={`/pages/user/bolao/${fixture.fixture_id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          backgroundColor: "#1A1A1A",
          borderRadius: "12px",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: pred ? "1px solid rgba(245,201,0,0.2)" : "1px solid transparent",
          cursor: "pointer",
          transition: "background-color 0.15s ease",
          "&:hover": { backgroundColor: "#222" },
        }}
      >
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.9375rem" }}>
            {fixture.home_team} × {fixture.away_team}
          </Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem", mt: 0.25 }}>
            {new Date(fixture.match_date).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right", flexShrink: 0, ml: 2 }}>
          {pred ? (
            <>
              <Typography
                sx={{
                  color: "#F5C900",
                  fontFamily: '"Montserrat", Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {pred.home_score} × {pred.away_score}
              </Typography>
              {pred.points_earned > 0 && (
                <Typography sx={{ color: "#F5C900", fontSize: "0.7rem" }}>
                  +{pred.points_earned}pts
                </Typography>
              )}
            </>
          ) : !isClosed ? (
            <Typography sx={{ color: "#F5C900", fontSize: "0.8rem", fontWeight: 600 }}>
              Apostar →
            </Typography>
          ) : (
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem" }}>Encerrado</Typography>
          )}
        </Box>
      </Box>
    </Link>
  );
}

export default function BolaoPage() {
  const [tab, setTab] = useState<TabValue>("open");
  const { data: fixtures, isLoading, isError } = useBolaoFixtures();
  const { data: myPoints, isLoading: loadingPoints } = useBolaoMyPoints();

  const now = new Date();
  const open = fixtures?.filter((f) => new Date(f.betting_closes_at) > now) ?? [];
  const closed = fixtures?.filter((f) => new Date(f.betting_closes_at) <= now) ?? [];
  const displayed = tab === "open" ? open : closed;

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Bolão da Copa" />

      <Box sx={{ px: 2, pt: 2 }}>
        <PointsBadge points={myPoints} isLoading={loadingPoints} />

        {/* Quick nav */}
        <Box sx={{ display: "flex", gap: 1.5, mt: 2, mb: 3 }}>
          <Link href="/pages/user/bolao/ranking" style={{ flex: 1, textDecoration: "none" }}>
            <Box
              sx={{
                backgroundColor: "#1A1A1A",
                borderRadius: "12px",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid #2A2A2A",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "#F5C900" },
              }}
            >
              <EmojiEventsOutlinedIcon sx={{ color: "#F5C900", fontSize: "1.25rem" }} />
              <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.875rem" }}>
                Ranking
              </Typography>
            </Box>
          </Link>

          <Link href="/pages/user/bolao/premios" style={{ flex: 1, textDecoration: "none" }}>
            <Box
              sx={{
                backgroundColor: "#1A1A1A",
                borderRadius: "12px",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid #2A2A2A",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "#F5C900" },
              }}
            >
              <CardGiftcardIcon sx={{ color: "#F5C900", fontSize: "1.25rem" }} />
              <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.875rem" }}>
                Prêmios
              </Typography>
            </Box>
          </Link>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v: TabValue) => setTab(v)}
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": { backgroundColor: "#F5C900" },
            "& .MuiTab-root": {
              color: "#9E9E9E",
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "none",
            },
            "& .Mui-selected": { color: "#F5C900" },
          }}
        >
          <Tab value="open" label={`Abertas (${open.length})`} />
          <Tab value="closed" label={`Encerradas (${closed.length})`} />
        </Tabs>

        {/* List */}
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <FixtureRowSkeleton key={i} />
            ))}
          </Box>
        ) : isError ? (
          <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
            Algo deu errado. Tenta de novo! 😅
          </Typography>
        ) : displayed.length === 0 ? (
          <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
            {tab === "open"
              ? "Nenhuma aposta aberta. Fique ligado! ⚽"
              : "Nenhuma aposta encerrada ainda."}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {displayed.map((f) => (
              <FixtureRow key={f.fixture_id} fixture={f} />
            ))}
          </Box>
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
