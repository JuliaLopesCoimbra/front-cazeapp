"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
  Divider,
  Chip,
  Select,
  MenuItem,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  DevicesOther as DevicesIcon,
  LockOpen as AnonIcon,
  Login as LoginIcon,
  BarChart as BarChartIcon,
  Schedule as PeakIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  TouchApp as TouchAppIcon,
  CameraAlt as CameraAltIcon,
  FaceRetouchingNatural as FaceIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  FiberManualRecord as DotIcon,
  Article as ArticleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Casino as RouletteIcon,
  Group as GroupIcon,
  Notifications as NotifIcon,
  MarkEmailRead as ReadIcon,
  PhoneAndroid as PushIcon,
  Memory as CpuIcon,
  NetworkCheck as NetworkIcon,
  CheckCircle as HealthOkIcon,
  Error as HealthErrorIcon,
  Hub as AlbIcon,
} from "@mui/icons-material";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import {
  getAnalyticsSummary,
  getInfraMetrics,
  AnalyticsSummary,
  AnalyticsPeriod,
  InfraMetrics,
} from "@/app/services/analytics/analyticsService";
import { getEvents } from "@/app/services/events/eventAppService";
import { getEventBackgroundSxByKey, getStoredEventBrandKey } from "@/app/utils/eventBranding";
import { useAnalyticsStream } from "@/app/hooks/useAnalyticsStream";

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  todayValue?: number;
  todayLabel?: string;
  accent?: string;
}

function MetricCard({ icon, label, value, todayValue, todayLabel, accent = "#ffcc01" }: MetricCardProps) {
  return (
    <Paper
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "14px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "9px",
            backgroundColor: `${accent}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: accent, display: "flex", fontSize: 18 }}>{icon}</Box>
        </Box>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Box>

      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.75rem", lineHeight: 1 }}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </Typography>

      {todayValue !== undefined && (
        <Typography sx={{ color: accent, fontSize: "0.75rem", fontWeight: 500 }}>
          +{todayValue.toLocaleString("pt-BR")} {todayLabel ?? "hoje"}
        </Typography>
      )}
    </Paper>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, color = "#ffcc01" }: { title: string; color?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, mt: 2.5 }}>
      <Box sx={{ width: 4, height: 20, borderRadius: 2, backgroundColor: color }} />
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
        {title}
      </Typography>
    </Box>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatPeakHour(utcHour: number | null): string {
  if (utcHour === null) return "—";
  const d = new Date();
  d.setUTCHours(utcHour, 0, 0, 0);
  return `às ${d.getHours()}h`;
}

function formatPath(path: string): string {
  const labels: Record<string, string> = {
    "/pages/user/home": "Home",
    "/pages/user/feed": "Feed",
    "/pages/user/notifications": "Notificações",
    "/pages/user/profile": "Perfil",
    "/pages/user/photo-finder": "Photo Finder",
    "/pages/user/my-photos": "Minhas fotos",
    "/pages/admin/dashboard": "Dashboard",
  };
  return labels[path] ?? path.split("/").filter(Boolean).pop() ?? path;
}

// ─── Top Paths Card ───────────────────────────────────────────────────────────

interface TopPathsCardProps {
  paths: { path: string; count: number }[];
  accent?: string;
}

function TopPathsCard({ paths, accent = "#81d4fa" }: TopPathsCardProps) {
  const max = paths[0]?.count || 1;
  return (
    <Paper
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "14px",
        p: 2,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: "9px",
            backgroundColor: `${accent}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <BarChartIcon sx={{ color: accent, fontSize: 18 }} />
        </Box>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
          Telas mais acessadas
        </Typography>
      </Box>
      {paths.length === 0 ? (
        <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
          Nenhum dado ainda
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {paths.map((p, i) => (
            <Box key={p.path}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: i === 0 ? 700 : 400 }}>
                  {formatPath(p.path)}
                </Typography>
                <Typography sx={{ color: accent, fontSize: "0.72rem", fontWeight: 600 }}>
                  {p.count.toLocaleString("pt-BR")}
                </Typography>
              </Box>
              <Box sx={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)" }}>
                <Box
                  sx={{
                    height: "100%", borderRadius: 2,
                    backgroundColor: accent,
                    width: `${(p.count / max) * 100}%`,
                    opacity: i === 0 ? 1 : 0.5,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Paper
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "14px",
        p: 2,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "9px", bgcolor: "rgba(255,255,255,0.08)" }} />
        <Skeleton variant="text" width="60%" sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
      </Box>
      <Skeleton variant="text" width="40%" height={40} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
      <Skeleton variant="text" width="30%" sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
    </Paper>
  );
}

function SkeletonRow({ count }: { count: number }) {
  const half = `calc(50% - 6px)`;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
      {count >= 1 && <Box sx={{ width: half }}><CardSkeleton /></Box>}
      {count >= 2 && <Box sx={{ width: half }}><CardSkeleton /></Box>}
      {count >= 3 && <Box sx={{ width: half }}><CardSkeleton /></Box>}
      {count >= 4 && <Box sx={{ width: half }}><CardSkeleton /></Box>}
    </Box>
  );
}

function SectionSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, mt: 2.5 }}>
        <Skeleton variant="rounded" width={4} height={20} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.12)" }} />
        <Skeleton variant="text" width={120} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
      </Box>
      <SkeletonRow count={cards} />
    </>
  );
}

function DashboardSkeleton({ backgroundSx }: { backgroundSx: object }) {
  return (
    <Box sx={{ minHeight: "100vh", paddingBottom: "80px", ...backgroundSx }}>
      <Container maxWidth="md" sx={{ pt: 0, pb: 4, px: { xs: 0, sm: 2 } }}>
        {/* Header skeleton */}
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 1 }}>
          <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
          <Skeleton variant="text" width={120} height={28} sx={{ bgcolor: "rgba(255,255,255,0.1)", flex: 1 }} />
          <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }} />
          <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
        </Box>

        {/* Filter bar skeleton */}
        <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={26} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }} />
          <Skeleton variant="rounded" width={48} height={26} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }} />
          <Skeleton variant="rounded" width={72} height={26} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }} />
          <Skeleton variant="rounded" width={52} height={26} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.08)" }} />
        </Box>

        <Box sx={{ px: 2, pt: 1 }}>
          <Box sx={{ mt: 1.5, mb: 0.5 }}>
            <CardSkeleton />
          </Box>
          <SectionSkeleton cards={2} />
          <SectionSkeleton cards={3} />
          <SectionSkeleton cards={2} />
          <SectionSkeleton cards={4} />
        </Box>
      </Container>
    </Box>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  all: "Tudo",
  day: "Dia",
  week: "Semana",
  month: "Mês",
};

const PERIODS: AnalyticsPeriod[] = ["all", "day", "week", "month"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<AnalyticsPeriod>("all");
  const [eventId, setEventId] = useState<number | undefined>();
  const [events, setEvents] = useState<{ id: number; title: string }[]>([]);
  const [live, setLive] = useState(false);
  const [infraData, setInfraData] = useState<InfraMetrics | null>(null);

  const storedBrandKey = getStoredEventBrandKey() ?? "default";
  const backgroundSx = getEventBackgroundSxByKey(storedBrandKey);
  const hasLoaded = useRef(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const summary = await getAnalyticsSummary(eventId, period);
        setData(summary);
        hasLoaded.current = true;
      } catch {
        showToast("Erro ao carregar métricas", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast, eventId, period]
  );

  // Auth guard + initial load
  useEffect(() => {
    if (!authReady) return;
    if (!isAdminMaster && !isSubadmin) {
      router.replace("/pages/user/home");
      return;
    }
    fetchData(false);
    getEvents(100, 0).then((evs) =>
      setEvents(evs.map((e) => ({ id: e.id, title: e.title })))
    );
    getInfraMetrics().then(setInfraData).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAdminMaster, isSubadmin]);

  // Filter changes → silent refresh (skip before initial load)
  useEffect(() => {
    if (!hasLoaded.current) return;
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, eventId]);

  // SSE stream — updates setData directly while live is on
  useAnalyticsStream(eventId, period, setData, live);

  if (!authReady || loading) {
    return <DashboardSkeleton backgroundSx={backgroundSx} />;
  }

  if (!data) return null;

  const generatedAt = new Date(data.generated_at).toLocaleTimeString("pt-BR");
  const showToday = period !== "day";

  return (
    <Box sx={{ minHeight: "100vh", paddingBottom: "80px", ...backgroundSx }}>
      <Container maxWidth="md" sx={{ pt: 0, pb: 4, px: { xs: 0, sm: 2 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            py: 1.25,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            gap: 1,
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ color: "white" }}>
            <ArrowBackIosIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, flex: 1, fontSize: "1.1rem" }}>
            Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {live ? (
              <Chip
                icon={<DotIcon sx={{ fontSize: "10px !important", color: "#f44336 !important" }} />}
                label="ao vivo"
                size="small"
                onClick={() => setLive(false)}
                sx={{
                  fontSize: "0.65rem",
                  height: 22,
                  backgroundColor: "rgba(244,67,54,0.15)",
                  color: "#f44336",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid rgba(244,67,54,0.3)",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.7 },
                  },
                }}
              />
            ) : (
              <>
                {data.cached && (
                  <Chip
                    label="cache"
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      height: 20,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  />
                )}
                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>
                  {generatedAt}
                </Typography>
              </>
            )}

            {!live && (
              <IconButton
                onClick={() => fetchData(true)}
                disabled={refreshing}
                sx={{ color: "#ffcc01", p: 0.75 }}
              >
                {refreshing ? (
                  <CircularProgress size={18} sx={{ color: "#ffcc01" }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            )}

            <IconButton
              onClick={() => setLive((v) => !v)}
              sx={{ color: live ? "#f44336" : "rgba(255,255,255,0.25)", p: 0.75 }}
              title={live ? "Desativar ao vivo" : "Ativar ao vivo (atualiza a cada 5s)"}
            >
              <DotIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Filter Bar */}
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {PERIODS.map((p) => (
              <Chip
                key={p}
                label={PERIOD_LABELS[p]}
                onClick={() => setPeriod(p)}
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  height: 26,
                  backgroundColor: period === p ? "#ffcc01" : "rgba(255,255,255,0.08)",
                  color: period === p ? "#000" : "rgba(255,255,255,0.5)",
                  fontWeight: period === p ? 700 : 400,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: period === p ? "#ffcc01" : "rgba(255,255,255,0.12)",
                  },
                }}
              />
            ))}
          </Box>

          {events.length > 0 && (
            <Select
              value={eventId?.toString() ?? ""}
              onChange={(e) =>
                setEventId(e.target.value === "" ? undefined : Number(e.target.value))
              }
              displayEmpty
              size="small"
              sx={{
                fontSize: "0.75rem",
                color: eventId ? "#ffcc01" : "rgba(255,255,255,0.5)",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: eventId ? "rgba(255,204,1,0.4)" : "rgba(255,255,255,0.12)",
                },
                ".MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)", fontSize: 18 },
                height: 28,
                minWidth: 160,
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.8rem" }}>
                Todos os eventos
              </MenuItem>
              {events.map((ev) => (
                <MenuItem key={ev.id} value={ev.id.toString()} sx={{ fontSize: "0.8rem" }}>
                  {ev.title}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, pt: 1 }}>

          {/* ── Total do sistema ── */}
          {(() => {
            const total =
              data.interactions.total_interactions +
              data.ads.total_views + data.ads.total_clicks +
              data.photo_finder.total_uploads + data.photo_finder.total_downloads +
              data.roulette.total_spins +
              data.page_views.total_views;
            return (
              <Box sx={{ mt: 1.5 }}>
                <MetricCard
                  icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                  label="Interações totais no sistema"
                  value={total}
                  accent="#ffcc01"
                />
              </Box>
            );
          })()}

          {/* ── Usuários ── */}
          <SectionHeader title="Usuários" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<PeopleIcon sx={{ fontSize: 18 }} />}
                label="Total de usuários"
                value={data.users.total}
                todayValue={showToday ? data.users.new_today : undefined}
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Novos esta semana"
                value={data.users.new_this_week}
                todayValue={showToday ? data.users.new_this_month : undefined}
                todayLabel="este mês"
              />
            </Grid>
          </Grid>

          {/* ── Interações ── */}
          <SectionHeader title="Interações" color="#f48fb1" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<FavoriteIcon sx={{ fontSize: 18 }} />}
                label="Curtidas totais"
                value={data.interactions.total_likes}
                todayValue={showToday ? data.interactions.new_likes_today : undefined}
                accent="#f48fb1"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<CommentIcon sx={{ fontSize: 18 }} />}
                label="Comentários totais"
                value={data.interactions.total_comments}
                todayValue={showToday ? data.interactions.new_comments_today : undefined}
                accent="#f48fb1"
              />
            </Grid>
            <Grid size={12}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Total de interações (curtidas + comentários)"
                value={data.interactions.total_interactions}
                accent="#f48fb1"
              />
            </Grid>
          </Grid>

          {/* ── Anúncios ── */}
          <SectionHeader title="Anúncios" color="#80cbc4" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<VisibilityIcon sx={{ fontSize: 18 }} />}
                label="Visualizações"
                value={data.ads.total_views}
                todayValue={showToday ? data.ads.views_today : undefined}
                accent="#80cbc4"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<TouchAppIcon sx={{ fontSize: 18 }} />}
                label="Cliques"
                value={data.ads.total_clicks}
                todayValue={showToday ? data.ads.clicks_today : undefined}
                accent="#80cbc4"
              />
            </Grid>
            <Grid size={12}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="CTR — taxa de clique por visualização"
                value={`${data.ads.ctr_percent}%`}
                accent="#80cbc4"
              />
            </Grid>
          </Grid>

          {/* ── Photo Finder ── */}
          <SectionHeader title="Photo Finder" color="#ce93d8" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<CameraAltIcon sx={{ fontSize: 18 }} />}
                label="Imagens enviadas"
                value={data.photo_finder.total_uploads}
                todayValue={showToday ? data.photo_finder.uploads_today : undefined}
                accent="#ce93d8"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<FaceIcon sx={{ fontSize: 18 }} />}
                label="Reconhecimentos"
                value={data.photo_finder.total_recognitions}
                todayValue={showToday ? data.photo_finder.recognitions_today : undefined}
                accent="#ce93d8"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<DownloadIcon sx={{ fontSize: 18 }} />}
                label="Downloads de fotos"
                value={data.photo_finder.total_downloads}
                todayValue={showToday ? data.photo_finder.downloads_today : undefined}
                accent="#ce93d8"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Taxa de reconhecimento"
                value={`${data.photo_finder.recognition_rate_percent}%`}
                accent="#ce93d8"
              />
            </Grid>
          </Grid>

          {/* ── Posts ── */}
          <SectionHeader title="Posts" color="#ffb74d" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<ArticleIcon sx={{ fontSize: 18 }} />}
                label="Posts publicados"
                value={data.posts.total_published}
                todayValue={showToday ? data.posts.published_today : undefined}
                accent="#ffb74d"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<PendingIcon sx={{ fontSize: 18 }} />}
                label="Aguardando aprovação"
                value={data.posts.pending_approval}
                accent="#ffb74d"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<RejectedIcon sx={{ fontSize: 18 }} />}
                label="Rejeitados"
                value={data.posts.rejected}
                accent="#ffb74d"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Publicados hoje"
                value={data.posts.published_today}
                accent="#ffb74d"
              />
            </Grid>
          </Grid>

          {/* ── Roleta ── */}
          <SectionHeader title="Roleta" color="#aed581" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<RouletteIcon sx={{ fontSize: 18 }} />}
                label="Total de giros"
                value={data.roulette.total_spins}
                todayValue={showToday ? data.roulette.spins_today : undefined}
                accent="#aed581"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<GroupIcon sx={{ fontSize: 18 }} />}
                label="Participantes únicos"
                value={data.roulette.unique_players}
                accent="#aed581"
              />
            </Grid>
            <Grid size={12}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Giros hoje"
                value={data.roulette.spins_today}
                accent="#aed581"
              />
            </Grid>
          </Grid>

          {/* ── Notificações ── */}
          <SectionHeader title="Notificações" color="#4fc3f7" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<NotifIcon sx={{ fontSize: 18 }} />}
                label="Total enviadas"
                value={data.notifications.total_sent}
                todayValue={showToday ? data.notifications.sent_today : undefined}
                accent="#4fc3f7"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<ReadIcon sx={{ fontSize: 18 }} />}
                label="Taxa de leitura"
                value={`${data.notifications.read_rate_percent}%`}
                accent="#4fc3f7"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<PushIcon sx={{ fontSize: 18 }} />}
                label="Push habilitado"
                value={data.notifications.push_subscriptions}
                accent="#4fc3f7"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Enviadas hoje"
                value={data.notifications.sent_today}
                accent="#4fc3f7"
              />
            </Grid>
          </Grid>

          {/* ── Acessos ── */}
          <SectionHeader title="Acessos" color="#81d4fa" />
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <MetricCard
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                label="Total de acessos"
                value={data.page_views.total_views}
                todayValue={showToday ? data.page_views.views_today : undefined}
                accent="#81d4fa"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<DevicesIcon sx={{ fontSize: 18 }} />}
                label="Dispositivos únicos"
                value={data.page_views.unique_devices}
                accent="#81d4fa"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<LoginIcon sx={{ fontSize: 18 }} />}
                label="Acessos com login"
                value={data.page_views.authenticated_views}
                accent="#81d4fa"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<AnonIcon sx={{ fontSize: 18 }} />}
                label="Acessos sem login"
                value={data.page_views.anonymous_views}
                accent="#81d4fa"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<PeakIcon sx={{ fontSize: 18 }} />}
                label="Pico de acesso"
                value={formatPeakHour(data.page_views.peak_hour_utc)}
                accent="#81d4fa"
              />
            </Grid>
            <Grid size={6}>
              <MetricCard
                icon={<TimeIcon sx={{ fontSize: 18 }} />}
                label="Tempo médio na tela"
                value={formatDuration(data.page_views.avg_duration_seconds)}
                accent="#81d4fa"
              />
            </Grid>
            <Grid size={12}>
              <TopPathsCard paths={data.page_views.top_paths} accent="#81d4fa" />
            </Grid>
          </Grid>

          {/* ── Infraestrutura (CloudWatch) ── */}
          {infraData?.available && (
            <>
              <SectionHeader title="Infraestrutura" color="#ef9a9a" />

              {infraData.instances.map((inst) => (
                <Paper
                  key={inst.instance_id}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "14px",
                    p: 2,
                    mb: 1.5,
                  }}
                >
                  {/* Instance header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      {inst.status_ok === false ? (
                        <HealthErrorIcon sx={{ color: "#ef5350", fontSize: 16 }} />
                      ) : (
                        <HealthOkIcon sx={{ color: "#66bb6a", fontSize: 16 }} />
                      )}
                      <Box>
                        <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700, textTransform: "capitalize" }}>
                          {inst.label}
                        </Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", fontFamily: "monospace" }}>
                          {inst.instance_id}
                        </Typography>
                      </Box>
                    </Box>
                    {inst.status_ok !== null && (
                      <Chip
                        label={inst.status_ok ? "healthy" : "degraded"}
                        size="small"
                        sx={{
                          fontSize: "0.6rem",
                          height: 18,
                          backgroundColor: inst.status_ok ? "rgba(102,187,106,0.15)" : "rgba(239,83,80,0.15)",
                          color: inst.status_ok ? "#66bb6a" : "#ef5350",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>

                  {/* CPU bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CpuIcon sx={{ color: "#ef9a9a", fontSize: 14 }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.73rem" }}>CPU</Typography>
                      </Box>
                      <Typography sx={{ color: "#ef9a9a", fontSize: "0.73rem", fontWeight: 700 }}>
                        {inst.cpu_percent !== null ? `${inst.cpu_percent}%` : "—"}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={inst.cpu_percent ?? 0}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            (inst.cpu_percent ?? 0) > 80
                              ? "#ef5350"
                              : (inst.cpu_percent ?? 0) > 60
                              ? "#ffb74d"
                              : "#ef9a9a",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  {/* Network In/Out */}
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <NetworkIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>Net In</Typography>
                      </Box>
                      <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
                        {inst.network_in_bytes !== null
                          ? `${(inst.network_in_bytes / 1024).toFixed(1)} KB/s`
                          : "—"}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <NetworkIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>Net Out</Typography>
                      </Box>
                      <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
                        {inst.network_out_bytes !== null
                          ? `${(inst.network_out_bytes / 1024).toFixed(1)} KB/s`
                          : "—"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              {/* ALB */}
              {infraData.alb && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                    <AlbIcon sx={{ color: "#ef9a9a", fontSize: 16 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>
                      Load Balancer · últimos {infraData.period_minutes} min
                    </Typography>
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid size={4}>
                      <MetricCard
                        icon={<NetworkIcon sx={{ fontSize: 18 }} />}
                        label="Requisições"
                        value={infraData.alb.request_count ?? 0}
                        accent="#ef9a9a"
                      />
                    </Grid>
                    <Grid size={4}>
                      <MetricCard
                        icon={<HealthErrorIcon sx={{ fontSize: 18 }} />}
                        label="Erros 5xx"
                        value={infraData.alb.errors_5xx ?? 0}
                        accent={infraData.alb.errors_5xx ? "#ef5350" : "#ef9a9a"}
                      />
                    </Grid>
                    <Grid size={4}>
                      <MetricCard
                        icon={<TimeIcon sx={{ fontSize: 18 }} />}
                        label="Latência média"
                        value={infraData.alb.avg_response_ms !== null ? `${infraData.alb.avg_response_ms}ms` : "—"}
                        accent="#ef9a9a"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mt: 3 }} />
          <Typography
            sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", textAlign: "center", mt: 1.5 }}
          >
            {live
              ? `Atualizando ao vivo a cada 5s · ${generatedAt}`
              : `Dados atualizados a cada 5 minutos · ${generatedAt}`}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
