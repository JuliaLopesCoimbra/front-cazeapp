"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
  Divider,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import {
  updateEvent,
  UpdateEventData,
  getEventById,
} from "@/app/services/events/eventAppService";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import ImageCarousel from "@/app/components/news/ImageCarousel";
import { dashboardBackgroundSx } from "@/app/utils/backgroundStyles";

interface EditEventFormProps {
  eventId: number;
  onSuccess?: () => void;
}

// ─── Shared field styles ────────────────────────────────────────────────────
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    "& input": {
      color: "#fff",
      padding: "13px 16px",
      "&::-webkit-calendar-picker-indicator": { filter: "invert(1)", cursor: "pointer" },
    },
    "& textarea": { color: "#fff", padding: "13px 16px" },
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ffc91f", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.6)",
    "&.Mui-focused": { color: "#ffc91f" },
  },
  "& .MuiFormHelperText-root": {
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.78rem",
    marginTop: "4px",
  },
};

// ─── Section card ────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, background: "rgba(255,201,31,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Box sx={{ color: "#ffc91f", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.95rem", letterSpacing: "0.02em" }}>{title}</Typography>
      </Box>
      <Box sx={{ p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>{children}</Box>
    </Paper>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({ inputId, label, sublabel, hasFile, fileLabel, disabled, accept, multiple, onChange }: {
  inputId: string; label: string; sublabel: string; hasFile: boolean; fileLabel?: string;
  disabled: boolean; accept: string; multiple?: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <input accept={accept} style={{ display: "none" }} id={inputId} type="file" multiple={multiple} onChange={onChange} disabled={disabled} />
      <label htmlFor={inputId} style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
        <Box
          sx={{
            border: "2px dashed",
            borderColor: hasFile ? "rgba(255,201,31,0.5)" : "rgba(255,255,255,0.15)",
            borderRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            transition: "all 0.2s ease",
            opacity: disabled ? 0.5 : 1,
            "&:hover": disabled ? {} : { borderColor: "#ffc91f", backgroundColor: "rgba(255,201,31,0.04)" },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 36, color: hasFile ? "#ffc91f" : "rgba(255,255,255,0.35)" }} />
          <Typography sx={{ color: hasFile ? "#ffc91f" : "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.9rem" }}>
            {hasFile ? fileLabel : label}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>{sublabel}</Typography>
        </Box>
      </label>
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EditEventForm({ eventId, onSuccess }: EditEventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mapImages, setMapImages] = useState<File[]>([]);
  const [mapImagePreviews, setMapImagePreviews] = useState<string[]>([]);
  const [existingMapImages, setExistingMapImages] = useState<Array<{ id: number; image_url: string; image_order: number }>>([]);
  const [replaceMapImages, setReplaceMapImages] = useState(false);
  const [eventDates, setEventDates] = useState("");
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState("");
  const [vanArrivalTimeStart, setVanArrivalTimeStart] = useState("");
  const [vanArrivalTimeEnd, setVanArrivalTimeEnd] = useState("");
  const [vanDepartureTimeStart, setVanDepartureTimeStart] = useState("");
  const [vanDepartureTimeEnd, setVanDepartureTimeEnd] = useState("");
  const [meetingPointLocation, setMeetingPointLocation] = useState("");
  const [meetingPointSchedule, setMeetingPointSchedule] = useState<Array<{ days: number[]; start_time: string; end_time: string }>>([]);
  const [daysInputValues, setDaysInputValues] = useState<{ [key: number]: string }>({});
  const [eventType, setEventType] = useState<"carnival" | "world_cup">("carnival");
  const [brandKey, setBrandKey] = useState<"default" | "n1_torcida">("default");
  const [ticketUrl, setTicketUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoadingEvent(true);
        const event = await getEventById(eventId);
        setTitle(event.title);
        setDescription(event.description || "");
        setLocation(event.location || "");

        if (event.starts_at) {
          const d = new Date(event.starts_at);
          setStartDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        }
        if (event.ends_at) {
          const d = new Date(event.ends_at);
          setEndDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        }

        if (event.banner_image) setPreview(event.banner_image);

        if (event.map_images && event.map_images.length > 0) {
          const sorted = [...event.map_images].sort((a, b) => a.image_order - b.image_order);
          setExistingMapImages(sorted);
          setMapImagePreviews(sorted.map((img) => img.image_url));
        } else {
          setExistingMapImages([]);
          setMapImagePreviews([]);
        }

        if (event.spotify_playlist_url) setSpotifyPlaylistUrl(event.spotify_playlist_url);
        setEventDates(event.event_dates || "");
        setVanArrivalTimeStart(event.van_arrival_time_start ? event.van_arrival_time_start.substring(0, 5) : "");
        setVanArrivalTimeEnd(event.van_arrival_time_end ? event.van_arrival_time_end.substring(0, 5) : "");
        setVanDepartureTimeStart(event.van_departure_time_start ? event.van_departure_time_start.substring(0, 5) : "");
        setVanDepartureTimeEnd(event.van_departure_time_end ? event.van_departure_time_end.substring(0, 5) : "");
        setMeetingPointLocation(event.meeting_point_location || "");
        setMeetingPointSchedule(Array.isArray(event.meeting_point_schedule) ? event.meeting_point_schedule : []);
        if (event.event_type === "world_cup") setEventType("world_cup");
        else setEventType("carnival");
        if (event.brand_key === "n1_torcida") setBrandKey("n1_torcida");
        else setBrandKey("default");
        setTicketUrl(event.ticket_url || "");
      } catch (err) {
        showToast("Erro ao carregar evento", "error");
        router.back();
      } finally {
        setLoadingEvent(false);
      }
    };
    loadEvent();
  }, [eventId, showToast, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("A imagem é muito grande. Máximo de 5MB.", "error");
      return;
    }
    setBannerImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMapImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const total = existingMapImages.length + mapImages.length + files.length;
    if (total > 5) {
      showToast("Máximo de 5 imagens do mapa permitidas", "error");
      return;
    }
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} é muito grande. Máximo de 5MB.`, "error");
        return;
      }
      newFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setMapImages((prev) => [...prev, ...newFiles]);
          setMapImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMapImage = (index: number) => {
    if (index < existingMapImages.length) {
      setExistingMapImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIdx = index - existingMapImages.length;
      setMapImages((prev) => prev.filter((_, i) => i !== newIdx));
    }
    setMapImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast("O título é obrigatório", "error"); return; }
    if (!description.trim()) { showToast("A descrição é obrigatória", "error"); return; }
    if (!location.trim()) { showToast("A localização é obrigatória", "error"); return; }
    if (!startDate) { showToast("A data de início é obrigatória", "error"); return; }
    if (!endDate) { showToast("A data de término é obrigatória", "error"); return; }
    const now = new Date();
    if (new Date(startDate) <= now) { showToast("A data de início deve ser no futuro", "error"); return; }
    if (new Date(endDate) <= now) { showToast("A data de término deve ser no futuro", "error"); return; }
    if (new Date(endDate) <= new Date(startDate)) { showToast("A data de término deve ser posterior à data de início", "error"); return; }
    setLoading(true);
    try {
      const data: UpdateEventData = {
        title: title.trim(),
        event_type: eventType,
        brand_key: brandKey,
        ticket_url: ticketUrl.trim() || undefined,
        description: description.trim(),
        location: location.trim(),
        start_date: startDate,
        end_date: endDate,
        event_dates: eventDates.trim() || undefined,
        van_arrival_time_start: vanArrivalTimeStart || undefined,
        van_arrival_time_end: vanArrivalTimeEnd || undefined,
        van_departure_time_start: vanDepartureTimeStart || undefined,
        van_departure_time_end: vanDepartureTimeEnd || undefined,
        meeting_point_location: meetingPointLocation.trim() || undefined,
        meeting_point_schedule: meetingPointSchedule.length > 0 ? meetingPointSchedule : undefined,
        banner_image: bannerImage || undefined,
        map_images: mapImages.length > 0 ? mapImages : undefined,
        replace_map_images: replaceMapImages,
        spotify_playlist_url: spotifyPlaylistUrl.trim() || undefined,
      };
      await updateEvent(eventId, data);
      showToast("Evento atualizado com sucesso!", "success");
      if (onSuccess) onSuccess();
      else router.push(`/pages/admin/events/${eventId}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar evento", "error");
    } finally {
      setLoading(false);
    }
  };

  // Parse event dates chips
  const parsedEventDates = eventDates
    .split(",")
    .map((d) => d.trim())
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

  const totalMapImages = existingMapImages.length + mapImages.length;

  if (loadingEvent) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ ...dashboardBackgroundSx, minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* ── Sticky header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          py: 2,
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          size="medium"
          sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
        >
          <ArrowBackIosIcon fontSize="small" sx={{ ml: 0.5 }} />
        </IconButton>
        <Box>
          <Typography fontWeight={700} sx={{ color: "#fff", lineHeight: 1.2, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
            Editar Evento
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>
            Atualize as informações do evento
          </Typography>
        </Box>
      </Box>

      {/* ── Form ── */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 3, maxWidth: 740, width: "100%", mx: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {/* 1 — Informações Básicas */}
        <SectionCard title="Informações Básicas" icon={<EventNoteIcon fontSize="small" />}>
          <TextField fullWidth label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} required sx={fieldSx} />
          <TextField fullWidth label="Descrição *" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} disabled={loading} required sx={fieldSx} />
          <TextField fullWidth label="Localização *" value={location} onChange={(e) => setLocation(e.target.value)} disabled={loading} required sx={fieldSx} />
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Tipo de Evento</InputLabel>
            <Select
              value={eventType}
              label="Tipo de Evento"
              onChange={(e) => setEventType(e.target.value as "carnival" | "world_cup")}
              disabled={loading}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.6)" } }}
            >
              <MenuItem value="carnival">Carnaval</MenuItem>
              <MenuItem value="world_cup">Copa do Mundo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Tema Visual</InputLabel>
            <Select
              value={brandKey}
              label="Tema Visual"
              onChange={(e) => setBrandKey(e.target.value as "default" | "n1_torcida")}
              disabled={loading}
              sx={{ color: "#fff", "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.6)" } }}
            >
              <MenuItem value="default">Padrao</MenuItem>
              <MenuItem value="n1_torcida">N1 Torcida</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Link de Compra de Ingressos"
            placeholder="https://..."
            value={ticketUrl}
            onChange={(e) => setTicketUrl(e.target.value)}
            disabled={loading}
            helperText="URL exibida no botão 'Comprar Ingressos' da página pública"
            sx={fieldSx}
          />
        </SectionCard>

        {/* 2 — Datas & Horários */}
        <SectionCard title="Datas & Horários" icon={<ScheduleIcon fontSize="small" />}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              fullWidth label="Data de Início *" type="datetime-local" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} disabled={loading} required
              inputProps={{ min: new Date().toISOString().slice(0, 16) }}
              InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
            <TextField
              fullWidth label="Data de Término *" type="datetime-local" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} disabled={loading} required
              inputProps={{ min: startDate || new Date().toISOString().slice(0, 16) }}
              InputLabelProps={{ shrink: true }} sx={fieldSx}
            />
          </Box>

          <Box>
            <TextField
              fullWidth label="Dias do Evento" value={eventDates}
              onChange={(e) => setEventDates(e.target.value)} disabled={loading}
              placeholder="Ex: 2024-01-09,2024-01-10,2024-01-20"
              helperText="Separe múltiplas datas por vírgula — formato AAAA-MM-DD"
              sx={fieldSx}
            />
            {parsedEventDates.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
                {parsedEventDates.map((date, i) => (
                  <Chip
                    key={i}
                    label={new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    size="small"
                    sx={{ backgroundColor: "rgba(255,201,31,0.12)", color: "#ffc91f", border: "1px solid rgba(255,201,31,0.3)", fontWeight: 600, fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </SectionCard>

        {/* 3 — Vans */}
        <SectionCard title="Transporte — Vans" icon={<DirectionsBusIcon fontSize="small" />}>
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 600, mb: 1.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ida</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField fullWidth label="Início da Ida" type="time" value={vanArrivalTimeStart} onChange={(e) => setVanArrivalTimeStart(e.target.value)} disabled={loading} InputLabelProps={{ shrink: true }} sx={fieldSx} />
              <TextField fullWidth label="Fim da Ida" type="time" value={vanArrivalTimeEnd} onChange={(e) => setVanArrivalTimeEnd(e.target.value)} disabled={loading} InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Box>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 600, mb: 1.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>Volta</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField fullWidth label="Início da Volta" type="time" value={vanDepartureTimeStart} onChange={(e) => setVanDepartureTimeStart(e.target.value)} disabled={loading} InputLabelProps={{ shrink: true }} sx={fieldSx} />
              <TextField fullWidth label="Fim da Volta" type="time" value={vanDepartureTimeEnd} onChange={(e) => setVanDepartureTimeEnd(e.target.value)} disabled={loading} InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Box>
          </Box>
        </SectionCard>

        {/* 4 — Meeting Point */}
        <SectionCard title="Meeting Point" icon={<LocationOnIcon fontSize="small" />}>
          <TextField
            fullWidth label="Local do Meeting Point" value={meetingPointLocation}
            onChange={(e) => e.target.value.length <= 255 && setMeetingPointLocation(e.target.value)}
            disabled={loading} inputProps={{ maxLength: 255 }}
            helperText={`${meetingPointLocation.length}/255`} sx={fieldSx}
          />

          {meetingPointSchedule.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {meetingPointSchedule.map((schedule, index) => (
                <Paper key={index} elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 2, p: 2.5, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Grupo {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setMeetingPointSchedule((prev) => prev.filter((_, i) => i !== index));
                        setDaysInputValues((prev) => {
                          const next: { [key: number]: string } = {};
                          Object.keys(prev).forEach((k) => {
                            const n = parseInt(k);
                            if (n < index) next[n] = prev[n];
                            else if (n > index) next[n - 1] = prev[n];
                          });
                          return next;
                        });
                      }}
                      sx={{ color: "#ff6b6b", "&:hover": { backgroundColor: "rgba(255,107,107,0.1)" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <TextField
                    fullWidth label="Dias do mês (ex: 13,14,20)"
                    value={daysInputValues[index] !== undefined ? daysInputValues[index] : schedule.days.join(",")}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9,]/g, "");
                      setDaysInputValues((prev) => ({ ...prev, [index]: sanitized }));
                      const days = sanitized.split(",").map((d) => d.trim()).filter((d) => d !== "").map((d) => parseInt(d)).filter((d) => !isNaN(d) && d >= 1 && d <= 31);
                      setMeetingPointSchedule((prev) => { const next = [...prev]; next[index] = { ...next[index], days }; return next; });
                    }}
                    onBlur={() => setDaysInputValues((prev) => { const n = { ...prev }; delete n[index]; return n; })}
                    disabled={loading}
                    placeholder="13,14,20"
                    inputProps={{ inputMode: "numeric", pattern: "[0-9,]*" }}
                    sx={{ ...fieldSx, mb: 2 }}
                  />

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <TextField
                      fullWidth label="Horário de Início" type="time"
                      value={schedule.start_time}
                      onChange={(e) => { setMeetingPointSchedule((prev) => { const next = [...prev]; next[index] = { ...next[index], start_time: e.target.value }; return next; }); }}
                      disabled={loading} InputLabelProps={{ shrink: true }} sx={fieldSx}
                    />
                    <TextField
                      fullWidth label="Horário de Fim" type="time"
                      value={schedule.end_time}
                      onChange={(e) => { setMeetingPointSchedule((prev) => { const next = [...prev]; next[index] = { ...next[index], end_time: e.target.value }; return next; }); }}
                      disabled={loading} InputLabelProps={{ shrink: true }} sx={fieldSx}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              const newIndex = meetingPointSchedule.length;
              setMeetingPointSchedule((prev) => [...prev, { days: [], start_time: "", end_time: "" }]);
              setDaysInputValues((prev) => ({ ...prev, [newIndex]: "" }));
            }}
            disabled={loading}
            fullWidth
            sx={{
              borderColor: "rgba(255,255,255,0.15)", borderWidth: "1.5px", borderStyle: "dashed",
              color: "rgba(255,255,255,0.7)", py: 1.25, fontSize: "0.875rem", fontWeight: 600,
              textTransform: "none", borderRadius: 2,
              "&:hover": { borderColor: "#ffc91f", borderStyle: "dashed", color: "#ffc91f", backgroundColor: "rgba(255,201,31,0.05)" },
            }}
          >
            Adicionar Grupo de Horários
          </Button>
        </SectionCard>

        {/* 5 — Mídia */}
        <SectionCard title="Mídia" icon={<PhotoLibraryIcon fontSize="small" />}>
          {/* Banner */}
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 700, mb: 1.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Banner do Evento
            </Typography>
            <UploadZone
              inputId="banner-image-upload-edit"
              label={preview ? "Alterar banner" : "Clique para selecionar o banner"}
              sublabel="PNG, JPG, WEBP — máximo 5MB"
              hasFile={!!bannerImage}
              fileLabel={bannerImage?.name ?? "Alterar banner"}
              disabled={loading}
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <Box component="img" src={preview} alt="Preview" sx={{ mt: 2, width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)" }} />
            )}
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

          {/* Map images */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Imagens do Mapa
              </Typography>
              <Chip
                label={`${totalMapImages}/5`}
                size="small"
                sx={{
                  backgroundColor: totalMapImages >= 5 ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.08)",
                  color: totalMapImages >= 5 ? "#ff6b6b" : "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                  height: 22,
                }}
              />
            </Box>
            <UploadZone
              inputId="map-image-upload-edit"
              label="Clique para adicionar imagens do mapa"
              sublabel="Até 5 imagens — PNG, JPG, WEBP — máx. 5MB cada"
              hasFile={totalMapImages > 0}
              fileLabel={`${totalMapImages} imagem(ns) — adicionar mais`}
              disabled={loading || totalMapImages >= 5}
              accept="image/*"
              multiple
              onChange={handleMapImageChange}
            />

            {existingMapImages.length > 0 && (
              <FormControlLabel
                sx={{ mt: 1.5 }}
                control={
                  <Checkbox
                    checked={replaceMapImages}
                    onChange={(e) => setReplaceMapImages(e.target.checked)}
                    disabled={loading}
                    size="small"
                    sx={{ color: "rgba(255,255,255,0.4)", "&.Mui-checked": { color: "#ffc91f" } }}
                  />
                }
                label={
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                    Substituir todas as imagens existentes
                  </Typography>
                }
              />
            )}

            {(existingMapImages.length > 0 || mapImagePreviews.length > 0) && (
              <Box sx={{ mt: 2 }}>
                {existingMapImages.length > 0 && (
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", mb: 1 }}>
                    {existingMapImages.length} existente(s) · {mapImages.length} nova(s)
                  </Typography>
                )}
                <ImageCarousel images={mapImagePreviews} onRemove={handleRemoveMapImage} showRemoveButton disabled={loading} />
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

          {/* Spotify */}
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 700, mb: 1.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Playlist Spotify
            </Typography>
            <TextField
              fullWidth label="Link do iframe da playlist" value={spotifyPlaylistUrl}
              onChange={(e) => e.target.value.length <= 500 && setSpotifyPlaylistUrl(e.target.value)}
              disabled={loading}
              placeholder="https://open.spotify.com/embed/playlist/..."
              inputProps={{ maxLength: 500 }}
              helperText={`Cole o link completo do iframe — ${spotifyPlaylistUrl.length}/500`}
              sx={fieldSx}
            />
          </Box>
        </SectionCard>

        {/* ── Action buttons ── */}
        <Box sx={{ display: "flex", gap: 2, pt: 1, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={loading}
            sx={{
              flex: 1, borderRadius: "999px", borderColor: "rgba(255,255,255,0.18)", borderWidth: "1.5px",
              color: "rgba(255,255,255,0.8)", py: 1.5, fontWeight: 600, textTransform: "none", fontSize: "0.95rem",
              "&:hover": { borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.04)" },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !title.trim() || !description.trim() || !location.trim() || !startDate || !endDate}
            sx={{
              flex: 2, borderRadius: "999px", backgroundColor: "#ffc91f", color: "#000", fontWeight: 700,
              py: 1.5, fontSize: "0.95rem", textTransform: "none",
              boxShadow: "0 4px 20px rgba(255,201,31,0.25)",
              "&:hover": { backgroundColor: "#e6b800", boxShadow: "0 4px 24px rgba(255,201,31,0.35)" },
              "&:disabled": { backgroundColor: "rgba(255,201,31,0.25)", color: "rgba(0,0,0,0.3)" },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#000" }} /> : "Salvar Alterações"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
