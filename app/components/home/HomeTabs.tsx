import { Box, Button } from "@mui/material";
import { useRef, useEffect } from "react";

type Tab = "home" | "eventos" | "mapa" | "lineup" | "foto" | "enredo";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function HomeTabs({ active, onChange }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs: { label: string; value: Tab }[] = [
    { label: "Home", value: "home" },
    { label: "Eventos", value: "eventos" },
    { label: "Mapa do Evento", value: "mapa" },
    { label: "Line Up", value: "lineup" },
    { label: "Foto IA", value: "foto" },
    { label: "Enredo", value: "enredo" },
  ];

  // Calcula a largura do container para mostrar 3 botões completos + quase todo o 4º
  // 3 botões + 2 gaps + quase todo o 4º botão (cerca de 80-90% visível)
  // xs: 3*100 + 2*8 + 85 = 401px
  // md: 3*120 + 2*12 + 105 = 489px
  // lg: 3*140 + 2*16 + 125 = 577px
  const containerWidth = { xs: "401px", md: "489px", lg: "577px" };

  // Adiciona suporte para scroll horizontal com a roda do mouse
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Verifica se há scroll horizontal disponível
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      
      if (!hasHorizontalScroll) return;

      // Verifica se o mouse está sobre o container
      const rect = container.getBoundingClientRect();
      const isOverContainer = 
        e.clientX >= rect.left - 50 && // Margem de 50px para facilitar
        e.clientX <= rect.right + 50 &&
        e.clientY >= rect.top - 50 &&
        e.clientY <= rect.bottom + 50;

      if (isOverContainer) {
        // Previne o scroll vertical padrão apenas se houver scroll horizontal
        e.preventDefault();
        e.stopPropagation();
        
        // Usa deltaX se disponível (scroll horizontal nativo), senão converte deltaY
        const scrollAmount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += scrollAmount;
      }
    };

    // Adiciona o listener no container com capture para garantir que seja capturado
    container.addEventListener("wheel", handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener("wheel", handleWheel, { capture: true } as EventListenerOptions);
    };
  }, []);

  return (
    <Box 
      sx={{ 
        padding: { xs: 2, md: 3, lg: 4 },
        display: "flex",
        justifyContent: { xs: "flex-start", md: "center" },
        maxWidth: { md: "1200px", lg: "1400px" },
        margin: { md: "0 auto" },
      }}
    >
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          gap: { xs: 1, md: 1.5, lg: 2 },
          width: containerWidth,
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none", // Chrome, Safari, Edge
          },
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          // Garante que o scroll funcione
          scrollBehavior: "smooth",
          cursor: "grab", // Indica que é scrollável
          "&:active": {
            cursor: "grabbing", // Muda o cursor quando está arrastando
          },
          // Permite scroll com mouse mesmo quando não está diretamente sobre o elemento
          userSelect: "none",
        }}
      >
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
                px: { xs: 1.5, md: 2, lg: 2.5 },
                minHeight: { xs: 40, md: 44, lg: 48 },
                height: { xs: 40, md: 44, lg: 48 },
                width: { xs: 100, md: 120, lg: 140 },
                minWidth: { xs: 100, md: 120, lg: 140 }, // Garante largura mínima
                flexShrink: 0, // Previne que os botões encolham
                fontSize: tab.value === "mapa" 
                  ? { xs: "0.75rem", md: "0.875rem", lg: "0.9375rem" }
                  : { xs: "0.875rem", md: "1rem", lg: "1.125rem" },
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
    </Box>
  );
}
