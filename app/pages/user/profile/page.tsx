"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  CircularProgress,
  Avatar,
  Skeleton,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import LogoutButton from "@/app/components/auth/LogoutButton";
import { getProfile, updateProfilePhoto, updateProfile, ProfileResponse } from "@/app/services/profile/profileService";
import { useToast } from "@/app/context/ToastContext";

// ── helpers ───────────────────────────────────────────────────────────────────

function extractDateOnly(dateString: string): string {
  if (!dateString) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const m = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    }
  } catch { /* ignore */ }
  return "";
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Não informado";
  const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }
  return new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatGender(g: string | null): string {
  if (!g) return "Não informado";
  return ({ male: "Masculino", female: "Feminino", other: "Outro", prefer_not_to_say: "Prefiro não informar" } as Record<string, string>)[g] ?? g;
}

function extractErrorMessage(error: unknown): string {
  const err = error as { response?: { status?: number; data?: { detail?: unknown; message?: string } }; message?: string };
  if (err?.response?.status === 422 && Array.isArray(err?.response?.data?.detail)) {
    const errs = err.response!.data!.detail as Array<{ msg: string }>;
    if (errs.length > 0) return errs[0].msg;
  }
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return err?.response?.data?.message ?? err?.message ?? "Algo deu errado. Tenta de novo.";
}

// ── sub-components ────────────────────────────────────────────────────────────

const GLASS_CARD = {
  backgroundColor: "rgba(21,28,46,0.92)",
  borderRadius: CAZE_RADIUS.md,
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
};

function InfoRow({
  icon,
  label,
  value,
  onEdit,
  editMode,
  editContent,
  verified,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit?: () => void;
  editMode?: boolean;
  editContent?: React.ReactNode;
  verified?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: editMode ? "flex-start" : "center", gap: 1.5, px: 2, py: 1.75 }}>
      <Box
        sx={{
          width: 36, height: 36, borderRadius: CAZE_RADIUS.sm,
          backgroundColor: "rgba(0,133,66,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          mt: editMode ? 0.25 : 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 600, mb: 0.2 }}>{label}</Typography>
        {editMode ? editContent : (
          <Typography sx={{ color: "#FFFFFF", fontWeight: 500, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value}
          </Typography>
        )}
      </Box>
      {!editMode && onEdit && (
        <IconButton size="small" onClick={onEdit} sx={{ color: "rgba(255,255,255,0.45)", flexShrink: 0, "&:hover": { color: "#008542" } }}>
          <EditOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
      {!editMode && verified && (
        <VerifiedIcon sx={{ fontSize: 18, color: "#008542", flexShrink: 0 }} />
      )}
    </Box>
  );
}

function InfoDivider() {
  return <Box sx={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", mx: 2 }} />;
}

// ── página ────────────────────────────────────────────────────────────────────

type GenderValue = "male" | "female" | "other" | "prefer_not_to_say" | "";

export default function ProfilePage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile]               = useState<ProfileResponse | null>(null);
  const [loading, setLoading]               = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [editingGender, setEditingGender]   = useState(false);
  const [birthDateValue, setBirthDateValue] = useState("");
  const [genderValue, setGenderValue]       = useState<GenderValue>("");

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        if (data.birth_date) setBirthDateValue(extractDateOnly(data.birth_date));
        if (data.gender) setGenderValue(data.gender as GenderValue);
      })
      .catch(() => showToast("Erro ao carregar perfil", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Selecione uma imagem", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("Imagem muito grande. Máx 5MB.", "error"); return; }
    setUploading(true);
    try {
      const updated = await updateProfilePhoto(file);
      setProfile(updated);
      showToast("Foto atualizada.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveBirthDate = async () => {
    if (!birthDateValue) { showToast("Informe uma data de nascimento", "error"); return; }
    setSaving(true);
    try {
      const updated = await updateProfile({ birth_date: birthDateValue });
      setProfile(updated);
      if (updated.birth_date) setBirthDateValue(extractDateOnly(updated.birth_date));
      setEditingBirthDate(false);
      showToast("Data atualizada.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally { setSaving(false); }
  };

  const handleSaveGender = async () => {
    if (!genderValue) { showToast("Selecione um sexo", "error"); return; }
    setSaving(true);
    try {
      const updated = await updateProfile({ gender: genderValue });
      setProfile(updated);
      setEditingGender(false);
      showToast("Sexo atualizado.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally { setSaving(false); }
  };

  const editActions = (onSave: () => void, onCancel: () => void) => (
    <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
      <Button
        size="small" onClick={onSave} disabled={saving}
        startIcon={saving ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 15 }} />}
        sx={{
          flex: 1, backgroundColor: "#009440", color: "#fff", borderRadius: CAZE_RADIUS.sm,
          textTransform: "none", fontWeight: 700, fontSize: "0.8rem",
          "&:hover": { backgroundColor: "#007a33" },
        }}
      >
        Salvar
      </Button>
      <Button
        size="small" onClick={onCancel} disabled={saving}
        startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
        sx={{
          flex: 1, border: "1px solid rgba(255,255,255,0.20)", color: "rgba(255,255,255,0.72)", borderRadius: CAZE_RADIUS.sm,
          textTransform: "none", fontWeight: 600, fontSize: "0.8rem",
          "&:hover": { borderColor: "#008542", color: "#008542", backgroundColor: "rgba(255,255,255,0.06)" },
        }}
      >
        Cancelar
      </Button>
    </Box>
  );

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: CAZE_RADIUS.sm,
      backgroundColor: "rgba(255,255,255,0.06)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "#008542" },
      "&.Mui-focused fieldset": { borderColor: "#008542" },
    },
    "& .MuiInputBase-input": { color: "#FFFFFF", fontSize: "0.9rem" },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.72)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#008542" },
    "& input[type='date']::-webkit-calendar-picker-indicator": { opacity: 0.5, filter: "invert(1)" },
  };

  const selectSx = {
    borderRadius: CAZE_RADIUS.sm,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#008542" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#008542" },
    "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.72)" },
  };

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <PageAmbientBackground />
        <Sidebar />
        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            backgroundColor: "#0A1128",
          }}
        >
          <TopBar title="Meu Perfil" />

          <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>
            <Box
              sx={{
                ...GLASS_CARD,
                p: 2,
                mb: 2,
                background:
                  "linear-gradient(135deg, rgba(0,85,184,0.22), rgba(21,28,46,0.96) 52%, rgba(245,201,0,0.14))",
              }}
            >
              <Typography sx={{ color: "#F5C900", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Sua conta
              </Typography>
              <Typography sx={{ color: "#FFFFFF", fontFamily: '"Montserrat"', fontSize: "1.35rem", fontWeight: 900, lineHeight: 1.1, mt: 0.5 }}>
                Perfil Casa CazéTV
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.68)", fontSize: "0.82rem", mt: 0.75 }}>
                Mantenha seus dados atualizados para participar das ativações.
              </Typography>
            </Box>

            {/* ── Avatar hero ─────────────────────────────────── */}
            <Box
              sx={{
                ...GLASS_CARD,
                mb: 2,
                overflow: "hidden",
              }}
            >
              {/* faixa verde sutil no topo */}
              <Box
                sx={{
                  height: 72,
                  background: "linear-gradient(135deg, rgba(0,133,66,0.24) 0%, rgba(0,85,184,0.20) 100%)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              />

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: -5, pb: 2.5, px: 2 }}>
                {/* Avatar */}
                <Box sx={{ position: "relative", mb: 1.5 }}>
                  {loading ? (
                    <Skeleton variant="circular" width={88} height={88} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
                  ) : (
                    <Box
                      sx={{
                        width: 88, height: 88, borderRadius: "50%",
                        border: "3px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover .cam-overlay": { opacity: 1 },
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Avatar
                        src={profile?.profile_photo ?? "/assets/figma/logo-top.png"}
                        sx={{ width: "100%", height: "100%", fontSize: "2rem", bgcolor: "rgba(0,133,66,0.15)", color: "#008542" }}
                      >
                        {(profile?.name ?? "U")[0].toUpperCase()}
                      </Avatar>
                      <Box
                        className="cam-overlay"
                        sx={{
                          position: "absolute", inset: 0,
                          bgcolor: "rgba(0,0,0,0.45)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: 0, transition: "opacity 0.2s",
                          borderRadius: "50%",
                        }}
                      >
                        {uploading
                          ? <CircularProgress size={22} sx={{ color: "#fff" }} />
                          : <CameraAltOutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />
                        }
                      </Box>
                    </Box>
                  )}
                </Box>

                {loading ? (
                  <>
                    <Skeleton width={140} height={22} sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
                    <Skeleton width={180} height={16} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1, mt: 0.5 }} />
                  </>
                ) : (
                  <>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.1rem", textAlign: "center" }}>
                      {profile?.name ?? "Usuário"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                      <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.78rem" }}>
                        {profile?.email}
                      </Typography>
                      {profile?.is_email_verified && (
                        <VerifiedIcon sx={{ fontSize: 14, color: "#008542" }} />
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* ── Info card ────────────────────────────────────── */}
            <Box sx={{ ...GLASS_CARD, mb: 2, overflow: "hidden" }}>
              <InfoRow
                icon={<EmailOutlinedIcon sx={{ fontSize: 18, color: "#008542" }} />}
                label="Email"
                value={profile?.email ?? "—"}
                verified={profile?.is_email_verified}
              />
              <InfoDivider />
              <InfoRow
                icon={<CakeOutlinedIcon sx={{ fontSize: 18, color: "#008542" }} />}
                label="Data de nascimento"
                value={formatDate(profile?.birth_date ?? null)}
                onEdit={() => setEditingBirthDate(true)}
                editMode={editingBirthDate}
                editContent={
                  <>
                    <TextField
                      type="date"
                      value={birthDateValue}
                      onChange={(e) => setBirthDateValue(e.target.value)}
                      fullWidth size="small" sx={inputSx}
                      inputProps={{ max: new Date().toISOString().split("T")[0] }}
                    />
                    {editActions(handleSaveBirthDate, () => {
                      if (profile?.birth_date) setBirthDateValue(extractDateOnly(profile.birth_date));
                      else setBirthDateValue("");
                      setEditingBirthDate(false);
                    })}
                  </>
                }
              />
              <InfoDivider />
              <InfoRow
                icon={<WcOutlinedIcon sx={{ fontSize: 18, color: "#008542" }} />}
                label="Sexo"
                value={formatGender(profile?.gender ?? null)}
                onEdit={() => setEditingGender(true)}
                editMode={editingGender}
                editContent={
                  <>
                    <FormControl fullWidth size="small">
                      <Select
                        value={genderValue}
                        onChange={(e) => setGenderValue(e.target.value as GenderValue)}
                        sx={selectSx}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              borderRadius: CAZE_RADIUS.md, mt: 0.5,
                              backgroundColor: "#151c2e",
                              border: "1px solid rgba(255,255,255,0.08)",
                              "& .MuiMenuItem-root": {
                                fontSize: "0.9rem",
                                color: "#FFFFFF",
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                                "&.Mui-selected": { backgroundColor: "rgba(0,133,66,0.18)", color: "#008542" },
                                "&.Mui-selected:hover": { backgroundColor: "rgba(0,133,66,0.24)" },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="male">Masculino</MenuItem>
                        <MenuItem value="female">Feminino</MenuItem>
                        <MenuItem value="other">Outro</MenuItem>
                        <MenuItem value="prefer_not_to_say">Prefiro não informar</MenuItem>
                      </Select>
                    </FormControl>
                    {editActions(handleSaveGender, () => {
                      if (profile?.gender) setGenderValue(profile.gender as GenderValue);
                      else setGenderValue("");
                      setEditingGender(false);
                    })}
                  </>
                }
              />
              <InfoDivider />
              <InfoRow
                icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.45)" }} />}
                label="Membro desde"
                value={formatDate(profile?.created_at ?? null)}
              />
            </Box>

            {/* ── Logout ───────────────────────────────────────── */}
            <Box sx={{ mb: 2 }}>
              <LogoutButton variant="profile" />
            </Box>
          </Box>
        </Box>
      </Box>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />

      <BottomNav />
    </>
  );
}
