import { Box, Button } from "@mui/material";
import { useRef, useEffect, useCallback } from "react";

type Tab = "home" | "eventos" | "mapa" | "lineup" | "foto" | "enredo";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  /** Tipo do evento atual — altera o label da aba "enredo" para "Jogos" quando world_cup */
  eventType?: string;
  activeColor?: string;
}

const DRAG_THRESHOLD_PX = 5;

export default function HomeTabs({ active, onChange, eventType, activeColor = "#ffc91f" }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartScrollLeftRef = useRef<number>(0);
  const dragOccurredRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const pendingScrollLeftRef = useRef<number>(0);

  const tabs: { label: string; value: Tab }[] = [
    { label: "Home", value: "home" },
    { label: "Eventos", value: "eventos" },
    { label: "Mapa", value: "mapa" },
    { label: "Line Up", value: "lineup" },
    { label: "Photo Finder", value: "foto" },
    { label: eventType === "world_cup" ? "Jogos" : "Enredo", value: "enredo" },
  ];

  // Mesma largura e padding do conteúdo abaixo (ex.: lineup/datas) para alinhar início e fim

  // Arrastar com o mouse no desktop: scroll instantâneo + rAF para fluidez
  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragStartXRef.current === null || !container) return;
      const dx = dragStartXRef.current - e.clientX;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX) dragOccurredRef.current = true;
      const targetScroll = dragStartScrollLeftRef.current + dx;
      pendingScrollLeftRef.current = Math.max(0, Math.min(targetScroll, container.scrollWidth - container.clientWidth));
      e.preventDefault();
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!scrollContainerRef.current) return;
        scrollContainerRef.current.scrollLeft = pendingScrollLeftRef.current;
      });
    };

    const handleMouseUp = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const el = scrollContainerRef.current;
      if (el) el.style.scrollBehavior = "";
      dragStartXRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { capture: true });
    window.addEventListener("mouseup", handleMouseUp, { capture: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove, { capture: true });
      window.removeEventListener("mouseup", handleMouseUp, { capture: true });
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.style.scrollBehavior = "auto"; // scroll instantâneo durante o arraste
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    dragOccurredRef.current = false;
  }, []);

  // Scroll horizontal com a roda do mouse
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      if (!hasHorizontalScroll) return;

      const rect = container.getBoundingClientRect();
      const isOverContainer =
        e.clientX >= rect.left - 50 &&
        e.clientX <= rect.right + 50 &&
        e.clientY >= rect.top - 50 &&
        e.clientY <= rect.bottom + 50;

      if (isOverContainer) {
        e.preventDefault();
        e.stopPropagation();
        const scrollAmount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += scrollAmount;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => {
      container.removeEventListener("wheel", handleWheel, { capture: true } as EventListenerOptions);
    };
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        px: { xs: 1, sm: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        ref={scrollContainerRef}
        onMouseDown={handleContainerMouseDown}
        sx={{
          display: "flex",
          gap: { xs: 1, md: 1.5, lg: 2 },
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none", // Chrome, Safari, Edge
          },
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          scrollBehavior: "smooth", // restaurado no mouseup após arraste
          cursor: "grab",
          "&:active": {
            cursor: "grabbing",
          },
          userSelect: "none",
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.value;

          return (
            <Button
              key={tab.value}
              onClick={() => {
                if (dragOccurredRef.current) return;
                onChange(tab.value);
              }}
              sx={{
                borderRadius: 0,
                textTransform: "none",
                fontWeight: isActive ? 700 : 400,
                lineHeight: 1,
                px: { xs: 1, md: 1.5, lg: 2 },
                py: 1.5,
                minWidth: "unset",
                flexShrink: 0,
                fontSize: { xs: "0.875rem", md: "1rem", lg: "1.0625rem" },
                backgroundColor: "transparent",
                color: isActive ? "#ffc91f" : "rgba(255,201,31,0.5)",
                border: "none",
                borderBottom: `2px solid ${isActive ? "#ffc91f" : "transparent"}`,
                transition: "color 0.2s ease, border-color 0.2s ease, font-weight 0.2s ease",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: isActive ? "#ffc91f" : "rgba(255,201,31,0.8)",
                  borderBottomColor: isActive ? "#ffc91f" : "rgba(255,201,31,0.3)",
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
