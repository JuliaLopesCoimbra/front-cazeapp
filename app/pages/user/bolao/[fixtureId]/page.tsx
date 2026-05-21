"use client";

import { use } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import { PredictionInput } from "@/app/components/bolao/PredictionInput";
import { useBolaoFixtures } from "@/app/hooks/useBolao";

interface Props {
  params: Promise<{ fixtureId: string }>;
}

function PageSkeleton() {
  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Skeleton
        variant="rectangular"
        height={130}
        sx={{ borderRadius: "16px", backgroundColor: "#1A1A1A" }}
      />
      <Skeleton
        variant="rectangular"
        height={80}
        sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A" }}
      />
      <Skeleton
        variant="rectangular"
        height={220}
        sx={{ borderRadius: "16px", backgroundColor: "#1A1A1A" }}
      />
    </Box>
  );
}

export default function BolaoFixturePage({ params }: Props) {
  const { fixtureId } = use(params);
  const router = useRouter();
  const { data: fixtures, isLoading } = useBolaoFixtures();

  const fixture = fixtures?.find((f) => f.fixture_id === Number(fixtureId));

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
        <TopBar title="Fazer Aposta" showBack />
        <PageSkeleton />
        <BottomNav />
      </Box>
    );
  }

  if (!fixture) {
    return (
      <Box sx={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopBar title="Fazer Aposta" showBack />
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "#9E9E9E" }}>Jogo não encontrado 😅</Typography>
        </Box>
        <BottomNav />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Fazer Aposta" showBack />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Match header */}
        <Box
          sx={{
            backgroundColor: "#1A1A1A",
            borderRadius: "16px",
            p: 3,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {fixture.home_logo ? (
              <Image
                src={fixture.home_logo}
                alt={fixture.home_team}
                width={52}
                height={52}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <Box sx={{ width: 52, height: 52, backgroundColor: "#333", borderRadius: "50%" }} />
            )}
            <Typography
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.8rem",
                textAlign: "center",
                maxWidth: 80,
              }}
            >
              {fixture.home_team}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem", mb: 0.5 }}>
              {new Date(fixture.match_date).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
            <Typography
              sx={{
                color: "#9E9E9E",
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              VS
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {fixture.away_logo ? (
              <Image
                src={fixture.away_logo}
                alt={fixture.away_team}
                width={52}
                height={52}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <Box sx={{ width: 52, height: 52, backgroundColor: "#333", borderRadius: "50%" }} />
            )}
            <Typography
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.8rem",
                textAlign: "center",
                maxWidth: 80,
              }}
            >
              {fixture.away_team}
            </Typography>
          </Box>
        </Box>

        {/* Scoring guide */}
        <Box
          sx={{
            backgroundColor: "#1A1A1A",
            borderRadius: "12px",
            p: 2,
            mb: 3,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                color: "#F5C900",
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: 900,
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              10pts
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", mt: 0.5 }}>
              Placar exato
            </Typography>
          </Box>

          <Box sx={{ width: 1, height: 36, backgroundColor: "#2A2A2A" }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                color: "#0055B8",
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: 900,
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              5pts
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", mt: 0.5 }}>
              Resultado certo
            </Typography>
          </Box>

          <Box sx={{ width: 1, height: 36, backgroundColor: "#2A2A2A" }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                color: "#9E9E9E",
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: 900,
                fontSize: "1.5rem",
                lineHeight: 1,
              }}
            >
              0pts
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", mt: 0.5 }}>
              Errou
            </Typography>
          </Box>
        </Box>

        {/* Prediction input */}
        <PredictionInput
          fixture={fixture}
          onSuccess={() => router.push("/pages/user/bolao")}
        />
      </Box>

      <BottomNav />
    </Box>
  );
}
