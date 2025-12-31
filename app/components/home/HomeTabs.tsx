import { Box, Button } from "@mui/material";

type Tab = "home" | "eventos" | "foto" | "enredo";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function HomeTabs({ active, onChange }: Props) {
  const tabs: { label: string; value: Tab }[] = [
    { label: "Home", value: "home" },
    { label: "Eventos", value: "eventos" },
    { label: "Foto IA", value: "foto" },
    { label: "Enredo", value: "enredo" },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1, padding: 2, }}>
      {tabs.map((tab) => {
        const isActive = active === tab.value;

        return (
          <Button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            sx={{
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 600,
              px: 1.5,
              minHeight: 36,
              width:100,
              // Ativo
              backgroundColor: isActive ? "#ffc91f" : "transparent",
              color: isActive ? "#000" : "#fff",
              border: `1px solid ${
                isActive ? "#ffc91f" : "#fff"
              }`,

              "&:hover": {
                backgroundColor: isActive
                  ? "#f5bf12"
                  : "rgba(255,255,255,0.1)",
                borderColor: isActive ? "#f5bf12" : "#fff",
                fontWeight: 900,
              },
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
  );
}
