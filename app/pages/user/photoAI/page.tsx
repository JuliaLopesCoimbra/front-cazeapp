"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import FaceIcon from "@mui/icons-material/Face";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useFeedCache } from "@/app/context/FeedCacheContext";
import { searchFace } from "@/app/services/ai/searchFaceService";
import {
  getMyFaceStatus,
  getMyPhotos,
  registerFace,
  deleteMyFace,
  MyPhoto,
} from "@/app/services/ai/userFaceService";
import { useToast } from "@/app/context/ToastContext";
import api from "@/app/services/auth/axiosConfig";

type Stage =
  | "intro"
  | "camera"
  | "results"
  | "torcida-checking"
  | "torcida-no-face"
  | "torcida-registering"
  | "torcida-my-photos";

interface SearchResult {
  url: string;
  similarity?: number;
  label?: string;
}

interface PhotoAIPageProps {
  eventId: number;
  accentColor?: string;
  isTorcida?: boolean;
}

export default function PhotoAIPage({ eventId, accentColor = "#ffc91f", isTorcida = false }: PhotoAIPageProps) {
  const { getCache, setCache } = useFeedCache();
  const cacheKey = `photo-ai-results-event-${eventId}`;

  const [stage, setStage] = useState<Stage>(isTorcida ? "torcida-checking" : "intro");
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<SearchResult | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [myPhotos, setMyPhotos] = useState<MyPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeletingFace, setIsDeletingFace] = useState(false);
  const { showToast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousEventIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Torcida: check face registration status on mount
  useEffect(() => {
    if (!isTorcida) return;
    (async () => {
      try {
        const status = await getMyFaceStatus(eventId);
        if (status.registered) {
          const photos = await getMyPhotos(eventId);
          setMyPhotos(photos);
          setStage("torcida-my-photos");
        } else {
          setStage("torcida-no-face");
        }
      } catch {
        setStage("torcida-no-face");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isTorcida]);

  useEffect(() => {
    const isEventChange = previousEventIdRef.current !== null && previousEventIdRef.current !== eventId;

    if (isEventChange) {
      setStage(isTorcida ? "torcida-checking" : "intro");
      setResults([]);
      setSearchMessage(null);
      // setCart([]); // sistema de compra desativado
      setSelectedPhoto(null);
      setIsUploading(false);
      setCountdown(null);
      setCameraError(null);
      stopCamera();
      previousEventIdRef.current = eventId;
      return;
    }

    // Torcida users go through the face-status check — don't restore manual search cache
    if (isTorcida) {
      previousEventIdRef.current = eventId;
      return;
    }

    const cached = getCache(cacheKey);

    if (cached && cached.data.length > 0) {
      setResults(cached.data);
      setStage("results");
      
      const targetPosition = cached.scrollPosition;
      
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      let attempts = 0;
      const maxAttempts = 20;
      
      const attemptRestore = () => {
        attempts++;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'instant' as ScrollBehavior
        });
        
        const currentScroll = window.scrollY;
        const diff = Math.abs(currentScroll - targetPosition);
        
        if (diff >= 10 && attempts < maxAttempts) {
          requestAnimationFrame(attemptRestore);
        }
      };
      
      requestAnimationFrame(attemptRestore);
      
      [50, 100, 200, 400, 800, 1600].forEach(delay => {
        setTimeout(() => {
          window.scrollTo({
            top: targetPosition,
            behavior: 'instant' as ScrollBehavior
          });
        }, delay);
      });
    }

    previousEventIdRef.current = eventId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // ===== CACHE: Salvar scroll position quando em results =====
  const lastScrollPositionRef = useRef(0);
  
  useEffect(() => {
    if (stage !== "results" || results.length === 0) return;
    
    let throttleTimeout: NodeJS.Timeout | null = null;
    const THROTTLE_MS = 400; // Otimizado para performance
    
    const updateScrollPosition = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      lastScrollPositionRef.current = currentScroll;
      
      if (throttleTimeout) clearTimeout(throttleTimeout);
      
      throttleTimeout = setTimeout(() => {
        if (results.length > 0) {
          setCache(cacheKey, results, currentScroll);
        }
      }, THROTTLE_MS);
    };
    
    const handleScroll = () => {
      updateScrollPosition();
    };
    
    const handlePageHide = () => {
      if (results.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, results, finalScroll);
      }
    };
    
    const handleBeforeUnload = () => {
      if (results.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, results, finalScroll);
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && results.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, results, finalScroll);
      }
    };
    
    const handleBlur = () => {
      if (results.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, results, finalScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      
      if (results.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, results, finalScroll);
      }
    };
  }, [stage, results, cacheKey, setCache]);

  // Garantir que o stream seja atribuído quando mudar para câmera
  useEffect(() => {
    if ((stage === "camera" || stage === "torcida-registering") && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stage]);

  const extractErrorMessage = (error: any) => {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Não foi possível concluir a operação. Tente novamente."
    );
  };

  const getCameraUnavailableMessage = () => {
    const isSecure = typeof window !== "undefined" && window.location?.protocol === "https:";
    if (!isSecure) {
      return "A câmera só funciona em conexão segura (HTTPS). Acesse o app pelo link com cadeado ou use a mesma rede em modo seguro.";
    }
    return "Câmera não disponível neste navegador ou dispositivo. Tente abrir no Chrome ou Safari (não use navegador dentro de rede social ou app de mensagem).";
  };

  const requestCamera = async (nextStage: Stage = "camera") => {
    setIsRequestingCamera(true);
    setCameraError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      console.error("[PhotoAI/Camera] navigator.mediaDevices.getUserMedia não disponível", {
        hasNavigator: typeof navigator !== "undefined",
        hasMediaDevices: typeof navigator?.mediaDevices !== "undefined",
        protocol: typeof window !== "undefined" ? window.location?.protocol : null,
      });
      const message = getCameraUnavailableMessage();
      setCameraError(message);
      showToast(message, "error");
      setIsRequestingCamera(false);
      return;
    }

    try {
      console.log("[PhotoAI/Camera] Solicitando permissão da câmera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      console.log("[PhotoAI/Camera] Câmera permitida. Stream:", stream.id);
      streamRef.current = stream;
      setStage(nextStage);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // play() pode rejeitar no primeiro momento (autoplay policy / vídeo ainda não pronto).
          // Não mostrar erro aqui: o vídeo costuma iniciar no onLoadedMetadata ou sozinho.
          videoRef.current.play().catch((err) => {
            console.warn("[PhotoAI/Camera] play() rejeitou (pode ser temporário):", err);
          });
        }
      }, 100);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      console.error("[PhotoAI/Camera] Erro getUserMedia:", e?.name, e?.message, err);

      const isMediaDevicesError =
        e?.message?.includes("navigator.mediaDevices") ||
        e?.message?.includes("getUserMedia") ||
        e?.message?.includes("undefined is not an object");

      const message = isMediaDevicesError
        ? getCameraUnavailableMessage()
        : `Não foi possível acessar a câmera. ${e?.message?.includes("Permission") ? "Permita o acesso à câmera nas configurações do navegador." : "Tente novamente ou use outro navegador (Chrome/Safari)."}`;

      setCameraError(message);
      showToast(message, "error");
    } finally {
      setIsRequestingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleSearch = async () => {
    // Inicia a contagem regressiva
    setCountdown(3);
    
    // Contagem regressiva: 3, 2, 1
    let currentCount = 3;
    const countdownInterval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);
        // Inicia a busca após a contagem
        performSearch();
      }
    }, 1000);
  };

  const performSearch = async () => {
    setIsUploading(true);
    setSearchMessage(null);
    
    try {
      const file = await capturePhoto();
      if (!file) {
        const message = "Não foi possível capturar a foto. Tente novamente.";
        setSearchMessage(message);
        showToast(message, "error");
        setIsUploading(false);
        return;
      }

      const response = await searchFace(file, String(eventId), eventId);
      console.log("Resposta completa da API:", response);
      console.log("Matches:", response.matches);

      const imagesFromApi: SearchResult[] =
        response.images?.map((url: string) => ({ url })) ||
        response.matches
          ?.map((m: any) => {
            console.log("Processando match:", m);
            return {
              url: m.image_url || m.url || m.image || "",
              similarity: m.similarity,
              label: m.name || m.external_image_id,
            };
          })
          .filter((r: SearchResult) => {
            console.log("Resultado após filtro:", r);
            return r.url;
          }) ||
        [];

      console.log("Imagens finais para exibir:", imagesFromApi);
      setResults(imagesFromApi);
      setSearchMessage(response.message || null);
      if (response.message) {
        showToast(response.message, "info");
      }
      setStage("results");
    } catch (error: any) {
      const message = extractErrorMessage(error);
      setSearchMessage(message);
      showToast(message, "error");
    } finally {
      stopCamera();
      setIsUploading(false);
    }
  };

  // ===== TORCIDA: register face from camera capture =====
  const handleRegisterFace = async () => {
    setCountdown(3);
    let currentCount = 3;
    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(interval);
        setCountdown(null);
        performRegisterFace();
      }
    }, 1000);
  };

  const performRegisterFace = async () => {
    setIsUploading(true);
    try {
      const file = await capturePhoto();
      if (!file) {
        showToast("Não foi possível capturar a foto. Tente novamente.", "error");
        setIsUploading(false);
        return;
      }
      const result = await registerFace(file, eventId);
      showToast(result.message, "success");
      stopCamera();
      const photos = await getMyPhotos(eventId);
      setMyPhotos(photos);
      setStage("torcida-my-photos");
    } catch (error: any) {
      const msg = error?.message || "Erro ao cadastrar rosto.";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFace = async () => {
    setIsDeletingFace(true);
    try {
      await deleteMyFace(eventId);
      showToast("Rosto removido com sucesso.", "success");
      setMyPhotos([]);
      setStage("torcida-no-face");
    } catch (error: any) {
      showToast(error?.message || "Erro ao remover rosto.", "error");
    } finally {
      setIsDeletingFace(false);
      setConfirmDeleteOpen(false);
    }
  };

  const refreshPhotos = async () => {
    setIsLoadingPhotos(true);
    try {
      const photos = await getMyPhotos(eventId);
      setMyPhotos(photos);
    } catch {
      showToast("Não foi possível atualizar as fotos.", "error");
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const renderTorcidaChecking = () => (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: accentColor }} />
    </Box>
  );

  const renderTorcidaNoFace = () => (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3 }}>
      <Box sx={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Box sx={{ width: 100, height: 100, borderRadius: "50%", background: `${accentColor}15`, border: `2px solid ${accentColor}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaceIcon sx={{ fontSize: 52, color: accentColor }} />
        </Box>
        <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#fff" }}>
            Cadastre seu rosto
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Tire uma selfie e receba notificação automática quando suas fotos chegarem no evento.
          </Typography>
        </Box>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ background: accentColor, borderRadius: 3, py: 1.5, color: "#fff", fontWeight: 700, fontSize: 15, textTransform: "none", boxShadow: `0 4px 24px ${accentColor}45`, "&:hover": { background: accentColor, opacity: 0.9 } }}
            onClick={() => requestCamera("torcida-registering")}
            disabled={isRequestingCamera}
          >
            {isRequestingCamera ? <CircularProgress size={22} color="inherit" /> : "Cadastrar rosto"}
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ color: "rgba(255,255,255,0.3)", textTransform: "none", fontSize: 13 }}
            onClick={() => setStage("intro")}
          >
            Prefiro buscar manualmente
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderTorcidaRegistering = () => (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", pt: 4, px: 3 }}>
      <Box sx={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>Posicione seu rosto</Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", mt: 0.5, fontSize: 13 }}>
            Sozinho, bem iluminado e de frente para a câmera.
          </Typography>
        </Box>

        <Box sx={{ width: 280, height: 280, borderRadius: "50%", border: `3px solid ${accentColor}`, overflow: "hidden", background: "#111", position: "relative", flexShrink: 0 }}>
          <video ref={videoRef} playsInline autoPlay muted
            onLoadedMetadata={() => { if (videoRef.current) videoRef.current.play().catch(() => {}); }}
            onPlaying={() => setCameraError(null)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {countdown !== null && (
            <Box sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <Typography sx={{ color: "white", fontSize: 100, fontWeight: 700, lineHeight: 1 }}>{countdown}</Typography>
            </Box>
          )}
          {isUploading && countdown === null && (
            <Box sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, gap: 1.5 }}>
              <CircularProgress size={48} sx={{ color: accentColor }} />
              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>Cadastrando...</Typography>
            </Box>
          )}
        </Box>

        {cameraError && <Typography color="error" textAlign="center" sx={{ fontSize: 13 }}>{cameraError}</Typography>}

        {countdown === null && !isUploading && (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleRegisterFace}
              sx={{ background: accentColor, borderRadius: 3, py: 1.5, color: "#fff", fontWeight: 700, fontSize: 15, textTransform: "none", boxShadow: `0 4px 24px ${accentColor}45`, "&:hover": { background: accentColor, opacity: 0.9 } }}
            >
              Cadastrar
            </Button>
            <Button
              variant="text"
              fullWidth
              sx={{ color: "rgba(255,255,255,0.3)", textTransform: "none", fontSize: 13 }}
              onClick={() => { stopCamera(); setStage("torcida-no-face"); }}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderTorcidaMyPhotos = () => (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>
            Minhas fotos
          </Typography>
          <IconButton
            size="small"
            onClick={refreshPhotos}
            disabled={isLoadingPhotos}
            sx={{ color: "rgba(255,255,255,0.3)", p: 0.5 }}
          >
            {isLoadingPhotos
              ? <CircularProgress size={14} sx={{ color: "rgba(255,255,255,0.3)" }} />
              : <RefreshIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
        <Button
          size="small"
          startIcon={<DeleteOutlineIcon sx={{ fontSize: "15px !important" }} />}
          onClick={() => setConfirmDeleteOpen(true)}
          sx={{ color: "rgba(255,255,255,0.3)", textTransform: "none", fontSize: 12, minWidth: 0 }}
        >
          Remover rosto
        </Button>
      </Box>

      {/* Status */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, background: `${accentColor}18`, border: `1px solid ${accentColor}35`, borderRadius: 10, px: 1.5, py: 0.6 }}>
          <FaceIcon sx={{ fontSize: 14, color: accentColor }} />
          <Typography sx={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>Rosto cadastrado</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)", mt: 0.75, fontSize: 12 }}>
          Novas fotos aparecerão aqui automaticamente.
        </Typography>
      </Box>

      {/* Grid */}
      <Box sx={{ px: 2, flex: 1 }}>
        {myPhotos.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 1.5 }}>
            <ImageOutlinedIcon sx={{ fontSize: 44, color: "rgba(255,255,255,0.12)" }} />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.6 }}>
              Nenhuma foto encontrada ainda.{"\n"}Você será notificado quando chegarem.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
            {myPhotos.map((photo, idx) => (
              <Box
                key={idx}
                onClick={() => { setSelectedPhoto({ url: photo.image_url, similarity: photo.similarity ?? undefined }); setCartModalOpen(true); }}
                sx={{ borderRadius: 2, overflow: "hidden", cursor: "pointer", background: "rgba(255,255,255,0.04)", transition: "transform 0.15s", "&:active": { transform: "scale(0.98)" }, "&:hover": { transform: "scale(1.01)" } }}
              >
                <img src={photo.image_url} alt={`Foto ${idx + 1}`} style={{ width: "100%", display: "block", aspectRatio: "3 / 4", objectFit: "cover" }} />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
        <Button
          variant="text"
          sx={{ color: "rgba(255,255,255,0.3)", textTransform: "none", fontSize: 13 }}
          onClick={() => setStage("intro")}
        >
          Buscar manualmente
        </Button>
      </Box>
    </Box>
  );

  const renderIntro = () => (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Container centralizado para desktop */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box px={4} py={3} display="flex" flexDirection="column" gap={3} sx={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <Box
            sx={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              display: "flex",
              gap: 2,
              p: 2,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                border: `2px solid ${accentColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accentColor,
                background: "rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            >
              <ImageOutlinedIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                Encontre suas fotos por reconhecimento facial. Tire uma selfie ou envie sua foto de rosto.
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>
              Encontre suas fotos tiradas durante o evento
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Utilizamos reconhecimento facial para localizar suas fotos com rapidez e segurança.
              Basta tirar uma selfie ou enviar uma foto do seu rosto, e o sistema encontrará automaticamente todas as imagens em que você aparece.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ background: accentColor, borderRadius: 5, py: 1.5 }}
            onClick={() => requestCamera()}
            disabled={isRequestingCamera}
          >
            {isRequestingCamera ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Procurar agora"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderCamera = () => (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Container centralizado para desktop */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box px={2} py={2} display="flex" flexDirection="column" gap={2} sx={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 320,
              margin: "0 auto",
              aspectRatio: "3 / 4",
              border: `3px solid ${accentColor}`,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#d9d9d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }}
          onPlaying={() => {
            // Vídeo realmente iniciou; remove mensagem de erro se foi exibida por engano
            setCameraError(null);
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
        
        {countdown !== null && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: "white",
                fontSize: 120,
                fontWeight: 700,
              }}
            >
              {countdown}
            </Typography>
          </Box>
        )}

        {isUploading && countdown === null && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              gap: 2,
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <CircularProgress size={60} sx={{ color: "#fff" }} />
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: 600,
              }}
            >
              Buscando fotos...
            </Typography>
          </Box>
        )}

        {countdown === null && !isUploading && (
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            disabled={isUploading || countdown !== null}
            sx={{ 
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: accentColor,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: 14,
              fontWeight: 600,
              textTransform: "none",
              zIndex: 5,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              "&:hover": {
                background: accentColor,
              },
            }}
          >
            Pronto
          </Button>
        )}
      </Box>

      {cameraError && (
        <Typography color="error" textAlign="center" sx={{ fontSize: 14 }}>
          {cameraError}
        </Typography>
      )}

      {countdown === null && !isUploading && (
        <Stack gap={0.5} sx={{ px: 1, py: 1 }}>
          <Typography 
            variant="body1" 
            textAlign="center" 
            fontWeight={700}
            sx={{ 
              color: "white",
              fontSize: 16,
              lineHeight: 1.4,
            }}
          >
            Primeiro, posicione seu rosto dentro da marcação.
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              lineHeight: 1.4,
            }}
          >
            Clique em "Pronto" quando estiver enquadrado.
          </Typography>
        </Stack>
      )}

      {countdown !== null && (
        <Typography
          variant="body1"
          textAlign="center"
          sx={{
            color: "white",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Preparando captura...
        </Typography>
      )}
        </Box>
      </Box>
    </Box>
  );

  const handlePhotoClick = (photo: SearchResult) => {
    setSelectedPhoto(photo);
    setCartModalOpen(true);
  };

  const handleDownloadPhoto = async () => {
    if (!selectedPhoto) return;
    try {
      // Preparar parâmetros para o download
      const params: any = { url: selectedPhoto.url };
      
      // Adicionar event_id se disponível
      if (eventId) {
        params.event_id = Number(eventId);
      }
      
      // Adicionar similaridade se disponível
      if (selectedPhoto.similarity !== undefined) {
        params.similarity = `${selectedPhoto.similarity.toFixed(1)}%`;
      }

      const res = await api.get("/photo-ai/download-image", {
        params,
        responseType: "blob",
      });
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `foto-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Foto baixada com sucesso!", "success");
      setCartModalOpen(false);
      setSelectedPhoto(null);
    } catch {
      showToast("Não foi possível baixar a foto. Tente novamente.", "error");
    }
  };

  // Sistema de compra (carrinho) desativado por enquanto
  // const handleCartClick = () => {
  //   if (cart.length > 0) {
  //     router.push(`/pages/user/roulette/${eventId}`);
  //   }
  // };

  const renderResults = () => (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Container centralizado para desktop */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box px={2} py={3} display="flex" flexDirection="column" gap={2} sx={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>
              Minhas fotos
            </Typography>
          </Box>

          {searchMessage && (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
              {searchMessage}
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{
              background: accentColor,
              color: "#000",
              fontWeight: 700,
              borderRadius: 2,
              py: 1.5,
              "&:hover": { background: accentColor, opacity: 0.9 },
            }}
            onClick={() => {
              setResults([]);
              setSearchMessage(null);
              setStage("intro");
            }}
          >
            Procurar novamente
          </Button>

          {results.length === 0 ? (
            <Typography textAlign="center" sx={{ color: "#fff" }}>
              Nenhuma foto encontrada. Tente novamente com outra imagem.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {results.map((item, idx) => (
                <Box
                  key={idx}
                  onClick={() => handlePhotoClick(item)}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    background: "#fff",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.label || `Foto ${idx + 1}`}
                    style={{
                      width: "100%",
                      display: "block",
                      aspectRatio: "3 / 4",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {stage === "torcida-checking" && renderTorcidaChecking()}
      {stage === "torcida-no-face" && renderTorcidaNoFace()}
      {stage === "torcida-registering" && renderTorcidaRegistering()}
      {stage === "torcida-my-photos" && renderTorcidaMyPhotos()}
      {stage === "camera" && renderCamera()}
      {stage === "results" && renderResults()}
      {stage === "intro" && renderIntro()}

      {/* Confirm delete face dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { backgroundColor: "#1a1a1a", color: "#fff", borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Remover rosto cadastrado?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Você não receberá mais notificações automáticas de novas fotos. Suas fotos vinculadas anteriormente continuarão disponíveis.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ color: "rgba(255,255,255,0.7)" }}>Cancelar</Button>
          <Button onClick={handleDeleteFace} variant="contained" color="error" disabled={isDeletingFace}>
            {isDeletingFace ? <CircularProgress size={18} color="inherit" /> : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal da foto: visualizar e baixar */}
      <Dialog
        open={cartModalOpen}
        onClose={() => {
          setCartModalOpen(false);
          setSelectedPhoto(null);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {},
          root: {
            sx: {
              zIndex: 1600,
            },
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            pb: 2,
            fontWeight: 600,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "rgba(90, 60, 241, 0.1)",
            }}
          >
            <ImageOutlinedIcon sx={{ color: accentColor, fontSize: 28 }} />
          </Box>
          Foto
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            {selectedPhoto && (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.label || "Foto selecionada"}
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              setCartModalOpen(false);
              setSelectedPhoto(null);
            }}
            sx={{
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDownloadPhoto}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              backgroundColor: accentColor,
              color: "#fff",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: accentColor,
              },
            }}
          >
            Baixar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
