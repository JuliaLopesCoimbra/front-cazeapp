"use client";

import { Box, Typography, Chip } from "@mui/material";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import RedeemIcon from "@mui/icons-material/Redeem";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import type { SvgIconComponent } from "@mui/icons-material";
import Image from "next/image";
import CazeButton from "@/app/components/shared/CazeButton";
import type { BolaoPrize } from "@/app/types/bolao";

const PRIZE_TYPE_LABEL: Record<BolaoPrize["prize_type"], string> = {
  shirt:   "Camisa",
  ticket:  "Ingresso",
  merch:   "Produto",
  digital: "Digital",
};

const PRIZE_TYPE_ICON: Record<BolaoPrize["prize_type"], SvgIconComponent> = {
  shirt: CheckroomIcon,
  ticket: ConfirmationNumberIcon,
  merch: ShoppingBagIcon,
  digital: PhoneIphoneIcon,
};

interface PrizeCardProps {
  prize: BolaoPrize;
  userPoints: number;
  onRedeem: (prizeId: number) => void;
  isRedeeming: boolean;
}

export function PrizeCard({ prize, userPoints, onRedeem, isRedeeming }: PrizeCardProps) {
  const canAfford = userPoints >= prize.points_required;
  const outOfStock = prize.remaining_qty === 0;
  const disabled = !canAfford || outOfStock || isRedeeming || !prize.is_active;
  const PrizeTypeIcon = PRIZE_TYPE_ICON[prize.prize_type];

  return (
    <Box
      sx={{
        backgroundColor: "#1A1A1A",
        borderRadius: "16px",
        overflow: "hidden",
        border:
          canAfford && !outOfStock
            ? "1px solid rgba(245,201,0,0.3)"
            : "1px solid #2A2A2A",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 140,
          backgroundColor: "#2A2A2A",
          flexShrink: 0,
        }}
      >
        {prize.image_url ? (
          <Image
            src={prize.image_url}
            alt={prize.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <EmojiEventsIcon sx={{ color: "#F5C900", fontSize: "2.5rem" }} />
          </Box>
        )}

        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <Chip
            icon={<PrizeTypeIcon sx={{ color: "#F5C900 !important", fontSize: "0.85rem" }} />}
            label={PRIZE_TYPE_LABEL[prize.prize_type]}
            size="small"
            sx={{
              backgroundColor: "rgba(0,0,0,0.75)",
              color: "#F5C900",
              fontSize: "0.6rem",
              fontWeight: 700,
              height: 20,
            }}
          />
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          sx={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.8rem",
            mb: 0.5,
            lineHeight: 1.3,
          }}
        >
          {prize.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Typography
            sx={{
              color: "#F5C900",
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 900,
              fontSize: "1.1rem",
            }}
          >
            {prize.points_required}pts
          </Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem" }}>
            {outOfStock ? "Esgotado" : `${prize.remaining_qty} restantes`}
          </Typography>
        </Box>

        {!canAfford && !outOfStock && (
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", mb: 0.5 }}>
            Faltam {prize.points_required - userPoints}pts
          </Typography>
        )}

        <Box sx={{ mt: "auto", pt: 1 }}>
          <CazeButton
            fullWidth
            disabled={disabled}
            loading={isRedeeming}
            onClick={() => onRedeem(prize.id)}
            variant={canAfford && !outOfStock ? "primary" : "ghost"}
          >
            {outOfStock
              ? "Esgotado"
              : !canAfford
              ? "Pts insuficientes"
              : (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <RedeemIcon sx={{ fontSize: "1rem" }} />
                  Resgatar
                </Box>
              )}
          </CazeButton>
        </Box>
      </Box>
    </Box>
  );
}
