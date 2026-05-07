"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Paper, CircularProgress, IconButton, Chip,
  Divider, Avatar, Alert, Button,
} from "@mui/material";
import {
  ArrowBackIos, Email, CalendarToday, Login, Person, AdminPanelSettings,
  EditNote, People, VerifiedUser, Cancel, Cake, Wc, Badge, Gavel,
  MarkEmailRead, Campaign, Warning, Info, CheckCircle,
  PhotoCamera, FaceRetouchingNatural, History, Favorite, Comment, Article,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { getUserDetail, getUserActivity, UserDetailResponse, UserActivityItem } from "@/app/services/auth/authAdminService";
import {
  revokeSubadminAccess, revokeColunistaAccess, revokeUserAccess,
  reactivateSubadminAccess, reactivateColunistaAccess, reactivateUserAccess,
  resendInvite,
} from "@/app/services/auth/authAdminService";
import { getEventBackgroundSxByKey, getStoredEventBrandKey } from "@/app/utils/eventBranding";
import { extractApiError } from "@/app/services/apiError";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const ROLE_LABEL: Record<string, string> = {
  admin_master: "Admin Master",
  subadmin: "Subadmin",
  colunista: "Colunista",
  user: "Usuário",
};

const GENDER_LABEL: Record<string, string> = {
  male: "Masculino",
  female: "Feminino",
  other: "Outro",
  prefer_not_to_say: "Prefiro não dizer",
};

function getRoleIcon(role: string) {
  if (role === "admin_master") return <AdminPanelSettings sx={{ fontSize: 16 }} />;
  if (role === "subadmin") return <AdminPanelSettings sx={{ fontSize: 16 }} />;
  if (role === "colunista") return <EditNote sx={{ fontSize: 16 }} />;
  return <People sx={{ fontSize: 16 }} />;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

// ─── row helpers ─────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.25 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: "9px", flexShrink: 0, mt: 0.1,
        backgroundColor: "rgba(255,204,1,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Box sx={{ color: "#ffcc01", display: "flex", "& svg": { fontSize: 16 } }}>{icon}</Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1 }}>
          {label}
        </Typography>
        <Box sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", mt: 0.4, lineHeight: 1.4 }}>
          {value}
        </Box>
      </Box>
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", px: 0.5, mb: 0.5, mt: 2.5 }}>
      {children}
    </Typography>
  );
}

function BoolRow({ icon, label, value, trueLabel = "Sim", falseLabel = "Não" }: {
  icon: React.ReactNode; label: string; value: boolean; trueLabel?: string; falseLabel?: string;
}) {
  return (
    <InfoRow
      icon={icon}
      label={label}
      value={
        <Chip
          label={value ? trueLabel : falseLabel}
          size="small"
          sx={{
            backgroundColor: value ? "rgba(76,175,80,0.15)" : "rgba(255,68,68,0.12)",
            color: value ? "#81c784" : "#ef9a9a",
            fontWeight: 600, fontSize: "0.75rem",
            border: `1px solid ${value ? "rgba(76,175,80,0.3)" : "rgba(255,68,68,0.25)"}`,
          }}
        />
      }
    />
  );
}

const ACTIVITY_LIMIT = 10;

const ACTIVITY_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  photo_download: { icon: <PhotoCamera sx={{ fontSize: 16 }} />, color: "#7c4dff" },
  face_search: { icon: <FaceRetouchingNatural sx={{ fontSize: 16 }} />, color: "#00bcd4" },
  like: { icon: <Favorite sx={{ fontSize: 16 }} />, color: "#e91e63" },
  comment: { icon: <Comment sx={{ fontSize: 16 }} />, color: "#ff9800" },
  post: { icon: <Article sx={{ fontSize: 16 }} />, color: "#ffcc01" },
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [activity, setActivity] = useState<UserActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityOffset, setActivityOffset] = useState(0);
  const [activityHasMore, setActivityHasMore] = useState(true);

  const [storedBrandKey, setStoredBrandKey] = useState<"default" | "n1_torcida">(
    () => getStoredEventBrandKey() ?? "default"
  );

  useEffect(() => {
    if (authReady && !isAdminMaster && !isSubadmin) router.push("/pages/user/home");
  }, [authReady, isAdminMaster, isSubadmin, router]);

  useEffect(() => {
    const refreshBrand = () => setStoredBrandKey(getStoredEventBrandKey() ?? "default");
    refreshBrand();
    window.addEventListener("storage", refreshBrand);
    return () => window.removeEventListener("storage", refreshBrand);
  }, []);

  useEffect(() => {
    if (!authReady || !userId) return;
    getUserDetail(Number(userId))
      .then(setUser)
      .catch((err) => {
        showToast(err.message, "error");
        router.back();
      })
      .finally(() => setLoading(false));
  }, [authReady, userId]);

  const loadActivity = useCallback(async (offset: number, reset = false) => {
    if (!userId) return;
    setActivityLoading(true);
    try {
      const items = await getUserActivity(Number(userId), ACTIVITY_LIMIT, offset);
      setActivity((prev) => reset ? items : [...prev, ...items]);
      setActivityHasMore(items.length === ACTIVITY_LIMIT);
      setActivityOffset(offset + items.length);
    } catch {
      // silently ignore — activity is non-critical
    } finally {
      setActivityLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    loadActivity(0, true);
  }, [user]);

  const bgSx = getEventBackgroundSxByKey(storedBrandKey);

  const handleAction = async (type: "revoke" | "reactivate" | "resend") => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (type === "resend") {
        await resendInvite(user.id);
        showToast("Convite reenviado!", "success");
      } else if (type === "revoke") {
        if (user.role === "subadmin") await revokeSubadminAccess(user.id);
        else if (user.role === "colunista") await revokeColunistaAccess(user.id);
        else await revokeUserAccess(user.id);
        showToast("Acesso revogado!", "success");
        setUser((u) => u ? { ...u, status: "inactive" } : u);
      } else {
        if (user.role === "subadmin") await reactivateSubadminAccess(user.id);
        else if (user.role === "colunista") await reactivateColunistaAccess(user.id);
        else await reactivateUserAccess(user.id);
        showToast("Acesso reativado!", "success");
        setUser((u) => u ? { ...u, status: "active" } : u);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (!authReady || loading) {
    return (
      <Box sx={{ minHeight: "100vh", ...bgSx, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#ffcc01" }} />
      </Box>
    );
  }

  if (!user) return null;

  const isActive = user.status === "active";
  const canResend = isActive && !user.is_email_verified && user.role !== "user";

  return (
    <Box sx={{ minHeight: "100vh", ...bgSx, pb: "72px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 1 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "white" }}>
          <ArrowBackIos sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name || user.email}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", lineHeight: 1.2 }}>
            Perfil do usuário
          </Typography>
        </Box>
        <Chip
          icon={getRoleIcon(user.role)}
          label={ROLE_LABEL[user.role] || user.role}
          size="small"
          sx={{ backgroundColor: "rgba(255,204,1,0.12)", color: "#ffcc01", border: "1px solid rgba(255,204,1,0.3)", fontWeight: 600, fontSize: "0.72rem" }}
        />
      </Box>

      <Box sx={{ maxWidth: 640, mx: "auto", px: { xs: 2, sm: 3 }, pt: 3 }}>
        {/* Avatar + status */}
        <Paper sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", p: 3, mb: 2, display: "flex", alignItems: "center", gap: 2.5 }}>
          <Avatar
            src={user.profile_photo || undefined}
            sx={{ width: 72, height: 72, backgroundColor: "rgba(255,204,1,0.2)", color: "#ffcc01", fontWeight: 700, fontSize: "1.5rem", border: "2px solid rgba(255,204,1,0.3)", flexShrink: 0 }}
          >
            {getInitials(user.name, user.email)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", mb: 0.5, wordBreak: "break-word" }}>
              {user.name || "Sem nome"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", mb: 1, wordBreak: "break-all" }}>
              {user.email}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={isActive ? (user.is_email_verified ? "Ativo" : "Aguardando confirmação") : "Inativo"}
                size="small"
                sx={{
                  backgroundColor: isActive ? (user.is_email_verified ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.15)") : "rgba(255,68,68,0.12)",
                  color: isActive ? (user.is_email_verified ? "#81c784" : "#ffb74d") : "#ef9a9a",
                  border: `1px solid ${isActive ? (user.is_email_verified ? "rgba(76,175,80,0.3)" : "rgba(255,152,0,0.3)") : "rgba(255,68,68,0.25)"}`,
                  fontWeight: 600, fontSize: "0.72rem",
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Deactivation/reactivation alerts */}
        {user.deactivated_at && (
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2, backgroundColor: "rgba(255,152,0,0.12)", border: "1px solid rgba(255,152,0,0.3)", borderRadius: "12px", "& .MuiAlert-icon": { color: "#ff9800" } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "white" }}>
              Desativado em {fmt(user.deactivated_at)}
              {user.deactivated_by && ` por ${user.deactivated_by.name || user.deactivated_by.email}`}
            </Typography>
          </Alert>
        )}
        {user.reactivated_at && (
          <Alert severity="info" icon={<Info />} sx={{ mb: 2, backgroundColor: "rgba(33,150,243,0.12)", border: "1px solid rgba(33,150,243,0.3)", borderRadius: "12px", "& .MuiAlert-icon": { color: "#2196f3" } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "white" }}>
              Reativado em {fmt(user.reactivated_at)}
              {user.reactivated_by && ` por ${user.reactivated_by.name || user.reactivated_by.email}`}
            </Typography>
          </Alert>
        )}

        {/* Main info */}
        <Paper sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", px: 2.5, pb: 2.5 }}>

          <SectionTitle>Conta</SectionTitle>
          <InfoRow icon={<Badge />} label="ID" value={`#${user.id}`} />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <InfoRow icon={<Email />} label="Email" value={user.email} />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <InfoRow
            icon={<VerifiedUser />}
            label="Email verificado"
            value={
              <Chip
                label={user.is_email_verified ? "Verificado" : "Não verificado"}
                size="small"
                sx={{
                  backgroundColor: user.is_email_verified ? "rgba(76,175,80,0.15)" : "rgba(255,152,0,0.12)",
                  color: user.is_email_verified ? "#81c784" : "#ffb74d",
                  border: `1px solid ${user.is_email_verified ? "rgba(76,175,80,0.3)" : "rgba(255,152,0,0.3)"}`,
                  fontWeight: 600, fontSize: "0.72rem",
                }}
              />
            }
          />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <InfoRow icon={<CalendarToday />} label="Cadastrado em" value={fmt(user.created_at)} />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <InfoRow icon={<Login />} label="Último acesso" value={fmt(user.last_login)} />
          {user.invited_by && (
            <>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <InfoRow icon={<Person />} label="Convidado por" value={user.invited_by.name || user.invited_by.email} />
            </>
          )}

          <SectionTitle>Dados Pessoais</SectionTitle>
          {user.birth_date && (
            <>
              <InfoRow icon={<Cake />} label="Data de nascimento" value={fmtDate(user.birth_date)} />
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
            </>
          )}
          <InfoRow icon={<Wc />} label="Gênero" value={user.gender ? (GENDER_LABEL[user.gender] || user.gender) : "—"} />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <InfoRow icon={<Badge />} label="CPF" value={user.cpf_masked || "—"} />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <BoolRow icon={<VerifiedUser />} label="Idade verificada" value={user.age_verified} />

          <SectionTitle>Termos e LGPD</SectionTitle>
          <InfoRow
            icon={<Gavel />}
            label="LGPD"
            value={user.lgpd_accepted
              ? <Typography component="span" sx={{ color: "#81c784", fontSize: "0.875rem" }}>Aceito em {fmt(user.lgpd_accepted_at)}</Typography>
              : <Typography component="span" sx={{ color: "#ef9a9a", fontSize: "0.875rem" }}>Não aceito</Typography>}
          />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <InfoRow
            icon={<Gavel />}
            label="Termos de maioridade"
            value={user.age_terms_accepted
              ? <Typography component="span" sx={{ color: "#81c784", fontSize: "0.875rem" }}>Aceito em {fmt(user.age_terms_accepted_at)}</Typography>
              : <Typography component="span" sx={{ color: "#ef9a9a", fontSize: "0.875rem" }}>Não aceito</Typography>}
          />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <BoolRow icon={<MarkEmailRead />} label="Aceita emails de marketing" value={user.marketing_email_accepted} />

        </Paper>

        {/* Actions */}
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {isActive ? (
            <Box
              onClick={() => !actionLoading && handleAction("revoke")}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                py: 1.5, borderRadius: "999px",
                backgroundColor: actionLoading ? "rgba(255,68,68,0.05)" : "rgba(255,68,68,0.1)",
                border: "1px solid rgba(255,68,68,0.3)",
                cursor: actionLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                "&:hover": { backgroundColor: "rgba(255,68,68,0.18)" },
              }}
            >
              {actionLoading ? <CircularProgress size={18} sx={{ color: "#ff4444" }} /> : <Cancel sx={{ color: "#ff4444", fontSize: 20 }} />}
              <Typography sx={{ color: "#ff4444", fontWeight: 700, fontSize: "0.9rem" }}>
                Revogar acesso
              </Typography>
            </Box>
          ) : (
            <Box
              onClick={() => !actionLoading && handleAction("reactivate")}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                py: 1.5, borderRadius: "999px",
                backgroundColor: actionLoading ? "rgba(76,175,80,0.05)" : "rgba(76,175,80,0.1)",
                border: "1px solid rgba(76,175,80,0.3)",
                cursor: actionLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                "&:hover": { backgroundColor: "rgba(76,175,80,0.18)" },
              }}
            >
              {actionLoading ? <CircularProgress size={18} sx={{ color: "#4caf50" }} /> : <CheckCircle sx={{ color: "#4caf50", fontSize: 20 }} />}
              <Typography sx={{ color: "#4caf50", fontWeight: 700, fontSize: "0.9rem" }}>
                Reativar acesso
              </Typography>
            </Box>
          )}

          {canResend && (
            <Box
              onClick={() => !actionLoading && handleAction("resend")}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                py: 1.5, borderRadius: "999px",
                backgroundColor: actionLoading ? "rgba(255,204,1,0.05)" : "rgba(255,204,1,0.1)",
                border: "1px solid rgba(255,204,1,0.3)",
                cursor: actionLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                "&:hover": { backgroundColor: "rgba(255,204,1,0.18)" },
              }}
            >
              {actionLoading ? <CircularProgress size={18} sx={{ color: "#ffcc01" }} /> : <Campaign sx={{ color: "#ffcc01", fontSize: 20 }} />}
              <Typography sx={{ color: "#ffcc01", fontWeight: 700, fontSize: "0.9rem" }}>
                Reenviar convite
              </Typography>
            </Box>
          )}
        </Box>

        {/* Activity history */}
        <Paper sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", px: 2.5, pb: 2.5, mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 2.5, pb: 1 }}>
            <History sx={{ color: "#ffcc01", fontSize: 18 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Histórico de atividades
            </Typography>
          </Box>

          {activity.length === 0 && !activityLoading && (
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textAlign: "center", py: 3 }}>
              Nenhuma atividade registrada
            </Typography>
          )}

          <Box sx={{ position: "relative" }}>
            {activity.map((item, i) => {
              const cfg = ACTIVITY_CONFIG[item.type] ?? { icon: <History sx={{ fontSize: 16 }} />, color: "#90a4ae" };
              return (
                <Box key={i} sx={{ display: "flex", gap: 2, position: "relative" }}>
                  {/* vertical line */}
                  {i < activity.length - 1 && (
                    <Box sx={{ position: "absolute", left: 15, top: 32, bottom: 0, width: "1px", backgroundColor: "rgba(255,255,255,0.07)" }} />
                  )}
                  {/* icon dot */}
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0, mt: 1.5,
                    backgroundColor: `${cfg.color}22`,
                    border: `1px solid ${cfg.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1,
                  }}>
                    <Box sx={{ color: cfg.color, display: "flex" }}>{cfg.icon}</Box>
                  </Box>
                  {/* content */}
                  <Box sx={{ flex: 1, py: 1.5, borderBottom: i < activity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.3 }}>
                      {item.label}
                    </Typography>
                    {item.detail && (
                      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", mt: 0.25 }}>
                        {item.detail}
                      </Typography>
                    )}
                    {item.event_name && (
                      <Chip
                        label={item.event_name}
                        size="small"
                        sx={{ mt: 0.5, height: 18, fontSize: "0.68rem", backgroundColor: "rgba(255,204,1,0.1)", color: "#ffcc01", border: "1px solid rgba(255,204,1,0.2)" }}
                      />
                    )}
                    <Typography sx={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", mt: 0.5 }}>
                      {fmt(item.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {activityLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} sx={{ color: "#ffcc01" }} />
            </Box>
          )}

          {activityHasMore && !activityLoading && activity.length > 0 && (
            <Button
              onClick={() => loadActivity(activityOffset)}
              sx={{
                width: "100%", mt: 1, color: "#ffcc01", borderColor: "rgba(255,204,1,0.3)",
                textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
                "&:hover": { borderColor: "rgba(255,204,1,0.5)", backgroundColor: "rgba(255,204,1,0.05)" },
              }}
              variant="outlined"
              size="small"
            >
              Carregar mais
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
