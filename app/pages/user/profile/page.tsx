"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Paper,
  Container,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  Divider,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { getProfile, updateProfilePhoto, updateProfile, ProfileResponse } from "@/app/services/profile/profileService";
import { EventResponse, getEvents } from "@/app/services/events/eventAppService";
import {
  EventBrandKey,
  getBrandIconColor,
  getEventBackgroundSx,
  getEventThemeByKey,
  getStoredEventBrandKey,
  setStoredEventBrandKey,
} from "@/app/utils/eventBranding";
import { useToast } from "@/app/context/ToastContext";
import LogoutButton from "@/app/components/auth/LogoutButton";
import BottomNav from "@/app/components/layout/BottomNav";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#FFD600" },
  },
  "& .MuiInputBase-input": { color: "white" },
  "& input[type='date']::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const selectSx = {
  color: "white",
  backgroundColor: "rgba(255,255,255,0.07)",
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD600" },
  "& .MuiSvgIcon-root": { color: "white" },
};

const menuPropsSx = {
  PaperProps: {
    sx: {
      backgroundColor: "rgba(10,10,10,0.95)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px",
      mt: 1,
      "& .MuiMenuItem-root": {
        color: "#fff",
        "&:hover": { backgroundColor: "rgba(255,215,0,0.15)" },
        "&.Mui-selected": { backgroundColor: "rgba(255,215,0,0.25)", color: "#FFD600" },
      },
    },
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);
  const [storedBrandKey, setStoredBrandKeyState] = useState<EventBrandKey>(
    () => getStoredEventBrandKey() ?? "default"
  );
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [editingGender, setEditingGender] = useState(false);
  const [birthDateValue, setBirthDateValue] = useState("");
  const [genderValue, setGenderValue] = useState<"male" | "female" | "other" | "prefer_not_to_say" | "">("");
  const [saving, setSaving] = useState(false);
  const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractDateOnly = (dateString: string): string => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const isoDateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) return isoDateMatch[1];
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        if (data.birth_date) setBirthDateValue(extractDateOnly(data.birth_date));
        if (data.gender) setGenderValue(data.gender as "male" | "female" | "other" | "prefer_not_to_say");
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        showToast("Erro ao carregar perfil", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadCurrentEvent = async () => {
      try {
        const allEvents = await getEvents();
        const savedEventId = localStorage.getItem("selectedEventId");
        const savedId = savedEventId ? parseInt(savedEventId, 10) : NaN;
        const selectedEvent = allEvents.find((event) => event.id === savedId);
        if (selectedEvent) {
          setCurrentEvent(selectedEvent);
          setStoredEventBrandKey(selectedEvent);
          setStoredBrandKeyState(selectedEvent.brand_key === "n1_torcida" ? "n1_torcida" : "default");
        }
      } catch (error) {
        console.error("Erro ao carregar evento atual", error);
      }
    };
    loadCurrentEvent();
  }, []);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Por favor, selecione uma imagem", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("A imagem é muito grande. Máximo de 5MB por imagem.", "error"); return; }
    setUploading(true);
    try {
      const updatedProfile = await updateProfilePhoto(file);
      setProfile(updatedProfile);
      showToast("Foto de perfil atualizada com sucesso!", "success");
    } catch (error: any) {
      let msg = "Erro ao atualizar foto de perfil";
      if (error?.response?.data?.detail) msg = error.response.data.detail;
      else if (error?.response?.status === 413) msg = "A imagem é muito grande. Tente uma imagem menor.";
      else if (error?.response?.status === 400) msg = error?.response?.data?.message || "Formato de imagem inválido";
      else if (error?.response?.status === 401) msg = "Sessão expirada. Faça login novamente.";
      showToast(msg, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const extractErrorMessage = (error: any): string => {
    if (error?.response?.status === 422 && Array.isArray(error?.response?.data?.detail)) {
      const errs = error.response.data.detail as Array<{ loc: string[]; msg: string; type: string }>;
      if (errs.length > 0) return errs[0].msg;
    }
    const detail = error?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first === "object" && first !== null && "msg" in first) return first.msg;
      return String(first);
    }
    if (typeof detail === "object" && detail !== null && "msg" in detail) return detail.msg;
    return error?.response?.data?.message || error?.message || "Erro ao processar solicitação";
  };

  const handleSaveBirthDate = async () => {
    if (!birthDateValue) { showToast("Por favor, informe uma data de nascimento", "error"); return; }
    setSaving(true);
    try {
      const updated = await updateProfile({ birth_date: birthDateValue });
      setProfile(updated);
      if (updated.birth_date) setBirthDateValue(extractDateOnly(updated.birth_date));
      setEditingBirthDate(false);
      showToast("Data de nascimento atualizada com sucesso!", "success");
    } catch (error: any) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBirthDate = () => {
    if (profile?.birth_date) setBirthDateValue(extractDateOnly(profile.birth_date));
    else setBirthDateValue("");
    setEditingBirthDate(false);
  };

  const handleSaveGender = async () => {
    if (!genderValue) { showToast("Por favor, selecione um sexo", "error"); return; }
    setSaving(true);
    try {
      const updated = await updateProfile({ gender: genderValue });
      setProfile(updated);
      setEditingGender(false);
      showToast("Sexo atualizado com sucesso!", "success");
    } catch (error: any) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelGender = () => {
    if (profile?.gender) setGenderValue(profile.gender as "male" | "female" | "other" | "prefer_not_to_say");
    else setGenderValue("");
    setEditingGender(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    }
    return new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return "Não informado";
    return ({ male: "Masculino", female: "Feminino", other: "Outro", prefer_not_to_say: "Prefiro não informar" } as Record<string, string>)[gender] || gender;
  };

  const fallbackTheme = getEventThemeByKey(storedBrandKey);
  const pageBackgroundSx = currentEvent
    ? getEventBackgroundSx(currentEvent)
    : {
        backgroundImage: `url(${fallbackTheme.backgroundMobile})`,
        backgroundSize: "100% 100vh",
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
        backgroundAttachment: "scroll",
        width: "100%",
        boxSizing: "border-box",
      };
  const iconAccent = currentEvent ? getBrandIconColor(currentEvent) : fallbackTheme.footerActiveColor;

  if (loading) {
    return (
      <Box sx={{ ...pageBackgroundSx, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: iconAccent }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ ...pageBackgroundSx, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: "white" }}>Erro ao carregar perfil</Typography>
      </Box>
    );
  }

  const iconBox = (icon: React.ReactNode, accent = true) => (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        backgroundColor: accent ? "rgba(255,204,1,0.1)" : "rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
  );

  const rowLabel = (text: string) => (
    <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", mb: 0.25 }}>{text}</Typography>
  );

  const rowValue = (text: string) => (
    <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: "0.9rem" }}>{text}</Typography>
  );

  const editActions = (onSave: () => void, onCancel: () => void) => (
    <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={saving ? <CircularProgress size={14} sx={{ color: "#000" }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
        onClick={onSave}
        disabled={saving}
        sx={{ backgroundColor: "#FFD600", color: "#000", flex: 1, borderRadius: "8px", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#FFC107" } }}
      >
        Salvar
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
        onClick={onCancel}
        disabled={saving}
        sx={{ borderColor: "rgba(255,255,255,0.25)", color: "white", flex: 1, borderRadius: "8px", textTransform: "none", "&:hover": { borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.05)" } }}
      >
        Cancelar
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", ...pageBackgroundSx, pb: "100px" }}>
      <Container maxWidth="md" sx={{ pt: { xs: 0, sm: 2 }, pb: 4, px: { xs: 0, sm: 2 }, maxWidth: "100%" }}>
        <Box className={shouldAnimate ? "slide-up-animation" : ""}>
          {/* Compact header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 1.25,
              gap: 1,
            }}
          >
            <IconButton onClick={() => router.back()} sx={{ color: "white" }}>
              <ArrowBackIosIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, flex: 1, fontSize: "1.1rem" }}>
              Meu Perfil
            </Typography>
          </Box>

          {/* Photo section */}
          <Box
            className={shouldAnimate ? "slide-up-delay-1" : ""}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 3, pb: 2.5, gap: 1.25 }}
          >
            <Box
              sx={{
                position: "relative",
                cursor: profile.profile_photo ? "zoom-in" : "pointer",
                "&:hover .camera-overlay": { opacity: 1 },
              }}
              onClick={() => profile.profile_photo ? setPhotoLightboxOpen(true) : handlePhotoClick()}
            >
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #FFD600",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  position: "relative",
                  "& > span": { width: "100% !important", height: "100% !important", display: "block !important", borderRadius: "50% !important", overflow: "hidden !important" },
                  "& img": { borderRadius: "50% !important", objectFit: "cover !important" },
                }}
              >
                {profile.profile_photo ? (
                  <img
                    src={profile.profile_photo}
                    alt="Foto de perfil"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                  />
                ) : (
                  <Box sx={{ width: "100%", height: "100%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                    <PersonIcon sx={{ fontSize: 44, color: "white" }} />
                  </Box>
                )}
                <Box
                  className="camera-overlay"
                  sx={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.3s", borderRadius: "50%",
                  }}
                  onClick={(e) => { e.stopPropagation(); handlePhotoClick(); }}
                >
                  {uploading
                    ? <CircularProgress sx={{ color: "#FFD600" }} size={26} />
                    : <CameraAltIcon sx={{ fontSize: 26, color: "#FFD600" }} />
                  }
                </Box>
              </Box>
            </Box>

            {photoLightboxOpen && profile.profile_photo && (
              <Box
                onClick={() => setPhotoLightboxOpen(false)}
                sx={{
                  position: "fixed", inset: 0, zIndex: 9999,
                  bgcolor: "rgba(0,0,0,0.9)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                }}
              >
                <Box
                  component="img"
                  src={profile.profile_photo}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    width: "72vw", height: "72vw", maxWidth: 320, maxHeight: 320,
                    borderRadius: "50%", objectFit: "cover",
                    border: "3px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                  }}
                />
                <Button
                  onClick={(e) => { e.stopPropagation(); setPhotoLightboxOpen(false); handlePhotoClick(); }}
                  startIcon={<CameraAltIcon />}
                  sx={{
                    color: "#FFD600", borderColor: "rgba(255,214,0,0.4)", border: "1px solid",
                    borderRadius: "20px", px: 3, py: 0.75, textTransform: "none", fontWeight: 600,
                    "&:hover": { bgcolor: "rgba(255,214,0,0.1)" },
                  }}
                >
                  Trocar foto
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 }}>
                {profile.name || "Usuário"}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", mt: 0.25 }}>
                {profile.email}
              </Typography>
            </Box>
          </Box>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />

          {/* Info rows */}
          <Box className={shouldAnimate ? "slide-up-delay-2" : ""} sx={{ px: 2, pb: 3 }}>
            <Paper
              sx={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Email */}
              <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.75, gap: 1.5 }}>
                {iconBox(<EmailIcon sx={{ fontSize: 20, color: "#ffcc01" }} />)}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {rowLabel("Email")}
                  <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile.email}
                  </Typography>
                </Box>
                {profile.is_email_verified && (
                  <VerifiedUserIcon sx={{ fontSize: 18, color: "#4CAF50", flexShrink: 0 }} />
                )}
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />

              {/* Birth Date */}
              <Box sx={{ px: 2, py: 1.75 }}>
                <Box sx={{ display: "flex", alignItems: editingBirthDate ? "flex-start" : "center", gap: 1.5 }}>
                  <Box sx={{ mt: editingBirthDate ? 0.25 : 0, flexShrink: 0 }}>
                    {iconBox(<CakeIcon sx={{ fontSize: 20, color: "#ffcc01" }} />)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {rowLabel("Data de Nascimento")}
                    {editingBirthDate ? (
                      <>
                        <TextField
                          type="date"
                          value={birthDateValue}
                          onChange={(e) => setBirthDateValue(e.target.value)}
                          fullWidth
                          size="small"
                          sx={textFieldSx}
                          inputProps={{ max: new Date().toISOString().split("T")[0] }}
                        />
                        {editActions(handleSaveBirthDate, handleCancelBirthDate)}
                      </>
                    ) : (
                      rowValue(profile.birth_date ? formatDate(profile.birth_date) : "Não informado")
                    )}
                  </Box>
                  {!editingBirthDate && (
                    <IconButton
                      size="small"
                      onClick={() => setEditingBirthDate(true)}
                      sx={{ color: "rgba(255,204,1,0.65)", flexShrink: 0, "&:hover": { backgroundColor: "rgba(255,204,1,0.1)" } }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />

              {/* Gender */}
              <Box sx={{ px: 2, py: 1.75 }}>
                <Box sx={{ display: "flex", alignItems: editingGender ? "flex-start" : "center", gap: 1.5 }}>
                  <Box sx={{ mt: editingGender ? 0.25 : 0, flexShrink: 0 }}>
                    {iconBox(<WcIcon sx={{ fontSize: 20, color: "#ffcc01" }} />)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {rowLabel("Sexo")}
                    {editingGender ? (
                      <>
                        <FormControl fullWidth size="small">
                          <Select
                            value={genderValue}
                            onChange={(e) => setGenderValue(e.target.value as typeof genderValue)}
                            sx={selectSx}
                            MenuProps={menuPropsSx}
                          >
                            <MenuItem value="male">Masculino</MenuItem>
                            <MenuItem value="female">Feminino</MenuItem>
                            <MenuItem value="other">Outro</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefiro não informar</MenuItem>
                          </Select>
                        </FormControl>
                        {editActions(handleSaveGender, handleCancelGender)}
                      </>
                    ) : (
                      rowValue(formatGender(profile.gender))
                    )}
                  </Box>
                  {!editingGender && (
                    <IconButton
                      size="small"
                      onClick={() => setEditingGender(true)}
                      sx={{ color: "rgba(255,204,1,0.65)", flexShrink: 0, "&:hover": { backgroundColor: "rgba(255,204,1,0.1)" } }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />

              {/* Member since */}
              <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.75, gap: 1.5 }}>
                {iconBox(<CalendarTodayIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.55)" }} />, false)}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {rowLabel("Membro desde")}
                  {rowValue(formatDate(profile.created_at))}
                </Box>
              </Box>

              {profile.last_login && (
                <>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />
                  <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.75, gap: 1.5 }}>
                    {iconBox(<CalendarTodayIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.55)" }} />, false)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {rowLabel("Último acesso")}
                      {rowValue(formatDate(profile.last_login))}
                    </Box>
                  </Box>
                </>
              )}
            </Paper>

            <Box sx={{ px: { xs: 2, sm: 0 }, mt: 1 }}>
              <LogoutButton variant="profile" />
            </Box>
          </Box>
        </Box>
      </Container>
      <BottomNav />
    </Box>
  );
}
