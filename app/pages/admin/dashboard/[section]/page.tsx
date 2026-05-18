"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Typography, Container, CircularProgress, IconButton,
  Grid, Paper, Chip, Select, MenuItem, LinearProgress,
} from "@mui/material";
import {
  ArrowBackIos as ArrowBackIosIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  TouchApp as TouchAppIcon,
  TrendingUp as TrendingUpIcon,
  CameraAlt as CameraAltIcon,
  FaceRetouchingNatural as FaceIcon,
  Download as DownloadIcon,
  Article as ArticleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Casino as RouletteIcon,
  Group as GroupIcon,
  Notifications as NotifIcon,
  MarkEmailRead as ReadIcon,
  PhoneAndroid as PushIcon,
  AccessTime as TimeIcon,
  DevicesOther as DevicesIcon,
  LockOpen as AnonIcon,
  Login as LoginIcon,
  Schedule as PeakIcon,
  BarChart as BarChartIcon,
  Memory as CpuIcon,
  NetworkCheck as NetworkIcon,
  CheckCircle as HealthOkIcon,
  Error as HealthErrorIcon,
  Hub as AlbIcon,
  CloudSync as CloudSyncIcon,
  FolderOpen as DriveIcon,
  CloudUpload as S3Icon,
  FiberManualRecord as DotIcon,
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
import { getPhotoSyncStatus, PhotoSyncStatus } from "@/app/services/admin/photoSyncService";

// ─── Shared UI ───────────────────────────────────────────────────────────────

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
    <Paper sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px", p: 2, display: "flex", flexDirection: "column", gap: 0.5, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: "9px", backgroundColor: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ color: accent, display: "flex", fontSize: 18 }}>{icon}</Box>
        </Box>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", lineHeight: 1.2 }}>{label}</Typography>
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

function SectionHeader({ title, color = "#ffcc01" }: { title: string; color?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, mt: 2.5 }}>
      <Box sx={{ width: 4, height: 20, borderRadius: 2, backgroundColor: color }} />
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{title}</Typography>
    </Box>
  );
}

function TopPathsCard({ paths, accent = "#81d4fa" }: { paths: { path: string; count: number }[]; accent?: string }) {
  const max = paths[0]?.count || 1;
  const labels: Record<string, string> = {
    "/pages/user/home": "Home", "/pages/user/feed": "Feed",
    "/pages/user/notifications": "Notificações", "/pages/user/profile": "Perfil",
    "/pages/user/photo-finder": "Photo Finder", "/pages/user/my-photos": "Minhas fotos",
    "/pages/admin/dashboard": "Dashboard",
  };
  return (
    <Paper sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px", p: 2, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: "9px", backgroundColor: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChartIcon sx={{ color: accent, fontSize: 18 }} />
        </Box>
        <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>Telas mais acessadas</Typography>
      </Box>
      {paths.length === 0 ? (
        <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>Nenhum dado ainda</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {paths.map((p, i) => (
            <Box key={p.path}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: i === 0 ? 700 : 400 }}>
                  {labels[p.path] ?? p.path.split("/").filter(Boolean).pop() ?? p.path}
                </Typography>
                <Typography sx={{ color: accent, fontSize: "0.72rem", fontWeight: 600 }}>{p.count.toLocaleString("pt-BR")}</Typography>
              </Box>
              <Box sx={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)" }}>
                <Box sx={{ height: "100%", borderRadius: 2, backgroundColor: accent, width: `${(p.count / max) * 100}%`, opacity: i === 0 ? 1 : 0.5 }} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
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

// Converte timestamp UTC do backend para horário local
function toLocalTime(isoString: string): Date {
  return new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");
}

// ─── Config das seções ───────────────────────────────────────────────────────

const SECTION_CONFIG: Record<string, { title: string; color: string; needsAnalytics: boolean; needsInfra: boolean; needsSync: boolean }> = {
  "usuarios":      { title: "Usuários",       color: "#ffcc01", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "interacoes":    { title: "Interações",      color: "#f48fb1", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "anuncios":      { title: "Anúncios",        color: "#80cbc4", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "photo-finder":  { title: "Photo Finder",    color: "#ce93d8", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "robo-fotos":    { title: "Robô de Fotos",   color: "#a78bfa", needsAnalytics: false, needsInfra: false, needsSync: true  },
  "posts":         { title: "Posts",           color: "#ffb74d", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "roleta":        { title: "Roleta",          color: "#aed581", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "notificacoes":  { title: "Notificações",    color: "#4fc3f7", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "acessos":       { title: "Acessos",         color: "#81d4fa", needsAnalytics: true,  needsInfra: false, needsSync: false },
  "infraestrutura":{ title: "Infraestrutura",  color: "#ef9a9a", needsAnalytics: false, needsInfra: true,  needsSync: false },
};

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = { all: "Tudo", day: "Dia", week: "Semana", month: "Mês" };
const PERIODS: AnalyticsPeriod[] = ["all", "day", "week", "month"];

// ─── Section renderers ───────────────────────────────────────────────────────

function UsuariosSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<PeopleIcon sx={{ fontSize: 18 }} />} label="Total de usuários" value={data.users.total} todayValue={showToday ? data.users.new_today : undefined} /></Grid>
      <Grid size={6}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Novos esta semana" value={data.users.new_this_week} todayValue={showToday ? data.users.new_this_month : undefined} todayLabel="este mês" /></Grid>
    </Grid>
  );
}

function InteracoesSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<FavoriteIcon sx={{ fontSize: 18 }} />} label="Curtidas totais" value={data.interactions.total_likes} todayValue={showToday ? data.interactions.new_likes_today : undefined} accent="#f48fb1" /></Grid>
      <Grid size={6}><MetricCard icon={<CommentIcon sx={{ fontSize: 18 }} />} label="Comentários totais" value={data.interactions.total_comments} todayValue={showToday ? data.interactions.new_comments_today : undefined} accent="#f48fb1" /></Grid>
      <Grid size={12}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Total de interações" value={data.interactions.total_interactions} accent="#f48fb1" /></Grid>
    </Grid>
  );
}

function AnunciosSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<VisibilityIcon sx={{ fontSize: 18 }} />} label="Visualizações" value={data.ads.total_views} todayValue={showToday ? data.ads.views_today : undefined} accent="#80cbc4" /></Grid>
      <Grid size={6}><MetricCard icon={<TouchAppIcon sx={{ fontSize: 18 }} />} label="Cliques" value={data.ads.total_clicks} todayValue={showToday ? data.ads.clicks_today : undefined} accent="#80cbc4" /></Grid>
      <Grid size={12}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="CTR — clique por visualização" value={`${data.ads.ctr_percent}%`} accent="#80cbc4" /></Grid>
    </Grid>
  );
}

function PhotoFinderSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<CameraAltIcon sx={{ fontSize: 18 }} />} label="Imagens enviadas" value={data.photo_finder.total_uploads} todayValue={showToday ? data.photo_finder.uploads_today : undefined} accent="#ce93d8" /></Grid>
      <Grid size={6}><MetricCard icon={<FaceIcon sx={{ fontSize: 18 }} />} label="Reconhecimentos" value={data.photo_finder.total_recognitions} todayValue={showToday ? data.photo_finder.recognitions_today : undefined} accent="#ce93d8" /></Grid>
      <Grid size={6}><MetricCard icon={<DownloadIcon sx={{ fontSize: 18 }} />} label="Downloads" value={data.photo_finder.total_downloads} todayValue={showToday ? data.photo_finder.downloads_today : undefined} accent="#ce93d8" /></Grid>
      <Grid size={6}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Taxa de reconhecimento" value={`${data.photo_finder.recognition_rate_percent}%`} accent="#ce93d8" /></Grid>
    </Grid>
  );
}

function PostsSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<ArticleIcon sx={{ fontSize: 18 }} />} label="Publicados" value={data.posts.total_published} todayValue={showToday ? data.posts.published_today : undefined} accent="#ffb74d" /></Grid>
      <Grid size={6}><MetricCard icon={<PendingIcon sx={{ fontSize: 18 }} />} label="Aguardando aprovação" value={data.posts.pending_approval} accent="#ffb74d" /></Grid>
      <Grid size={6}><MetricCard icon={<RejectedIcon sx={{ fontSize: 18 }} />} label="Rejeitados" value={data.posts.rejected} accent="#ffb74d" /></Grid>
      <Grid size={6}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Publicados hoje" value={data.posts.published_today} accent="#ffb74d" /></Grid>
    </Grid>
  );
}

function RoletaSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<RouletteIcon sx={{ fontSize: 18 }} />} label="Total de giros" value={data.roulette.total_spins} todayValue={showToday ? data.roulette.spins_today : undefined} accent="#aed581" /></Grid>
      <Grid size={6}><MetricCard icon={<GroupIcon sx={{ fontSize: 18 }} />} label="Participantes únicos" value={data.roulette.unique_players} accent="#aed581" /></Grid>
      <Grid size={12}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Giros hoje" value={data.roulette.spins_today} accent="#aed581" /></Grid>
    </Grid>
  );
}

function NotificacoesSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<NotifIcon sx={{ fontSize: 18 }} />} label="Total enviadas" value={data.notifications.total_sent} todayValue={showToday ? data.notifications.sent_today : undefined} accent="#4fc3f7" /></Grid>
      <Grid size={6}><MetricCard icon={<ReadIcon sx={{ fontSize: 18 }} />} label="Taxa de leitura" value={`${data.notifications.read_rate_percent}%`} accent="#4fc3f7" /></Grid>
      <Grid size={6}><MetricCard icon={<PushIcon sx={{ fontSize: 18 }} />} label="Push habilitado" value={data.notifications.push_subscriptions} accent="#4fc3f7" /></Grid>
      <Grid size={6}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Enviadas hoje" value={data.notifications.sent_today} accent="#4fc3f7" /></Grid>
    </Grid>
  );
}

function AcessosSection({ data, showToday }: { data: AnalyticsSummary; showToday: boolean }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={6}><MetricCard icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} label="Total de acessos" value={data.page_views.total_views} todayValue={showToday ? data.page_views.views_today : undefined} accent="#81d4fa" /></Grid>
      <Grid size={6}><MetricCard icon={<DevicesIcon sx={{ fontSize: 18 }} />} label="Dispositivos únicos" value={data.page_views.unique_devices} accent="#81d4fa" /></Grid>
      <Grid size={6}><MetricCard icon={<LoginIcon sx={{ fontSize: 18 }} />} label="Com login" value={data.page_views.authenticated_views} accent="#81d4fa" /></Grid>
      <Grid size={6}><MetricCard icon={<AnonIcon sx={{ fontSize: 18 }} />} label="Sem login" value={data.page_views.anonymous_views} accent="#81d4fa" /></Grid>
      <Grid size={6}><MetricCard icon={<PeakIcon sx={{ fontSize: 18 }} />} label="Pico de acesso" value={formatPeakHour(data.page_views.peak_hour_utc)} accent="#81d4fa" /></Grid>
      <Grid size={6}><MetricCard icon={<TimeIcon sx={{ fontSize: 18 }} />} label="Tempo médio na tela" value={formatDuration(data.page_views.avg_duration_seconds)} accent="#81d4fa" /></Grid>
      <Grid size={12}><TopPathsCard paths={data.page_views.top_paths} accent="#81d4fa" /></Grid>
    </Grid>
  );
}

function InfraestruturaSection({ infraData }: { infraData: InfraMetrics }) {
  if (!infraData.available) {
    return <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>Dados de infraestrutura indisponíveis.</Typography>;
  }
  return (
    <>
      {infraData.instances.map((inst) => (
        <Paper key={inst.instance_id} sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px", p: 2, mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            {inst.status_ok === false ? <HealthErrorIcon sx={{ color: "#ef5350", fontSize: 16 }} /> : <HealthOkIcon sx={{ color: "#66bb6a", fontSize: 16 }} />}
            <Box>
              <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 700, textTransform: "capitalize" }}>{inst.label}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", fontFamily: "monospace" }}>{inst.instance_id}</Typography>
            </Box>
            {inst.status_ok !== null && (
              <Chip label={inst.status_ok ? "healthy" : "degraded"} size="small" sx={{ fontSize: "0.6rem", height: 18, backgroundColor: inst.status_ok ? "rgba(102,187,106,0.15)" : "rgba(239,83,80,0.15)", color: inst.status_ok ? "#66bb6a" : "#ef5350", fontWeight: 700 }} />
            )}
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CpuIcon sx={{ color: "#ef9a9a", fontSize: 14 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.73rem" }}>CPU</Typography>
              </Box>
              <Typography sx={{ color: "#ef9a9a", fontSize: "0.73rem", fontWeight: 700 }}>{inst.cpu_percent !== null ? `${inst.cpu_percent}%` : "—"}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={inst.cpu_percent ?? 0} sx={{ height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", "& .MuiLinearProgress-bar": { backgroundColor: (inst.cpu_percent ?? 0) > 80 ? "#ef5350" : (inst.cpu_percent ?? 0) > 60 ? "#ffb74d" : "#ef9a9a", borderRadius: 3 } }} />
          </Box>
          <Grid container spacing={1}>
            <Grid size={6}>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>Net In</Typography>
              <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{inst.network_in_bytes !== null ? `${(inst.network_in_bytes / 1024).toFixed(1)} KB/s` : "—"}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>Net Out</Typography>
              <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{inst.network_out_bytes !== null ? `${(inst.network_out_bytes / 1024).toFixed(1)} KB/s` : "—"}</Typography>
            </Grid>
          </Grid>
        </Paper>
      ))}
      {infraData.alb && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <AlbIcon sx={{ color: "#ef9a9a", fontSize: 16 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>Load Balancer · últimos {infraData.period_minutes} min</Typography>
          </Box>
          <Grid container spacing={1.5}>
            <Grid size={4}><MetricCard icon={<NetworkIcon sx={{ fontSize: 18 }} />} label="Requisições" value={infraData.alb.request_count ?? 0} accent="#ef9a9a" /></Grid>
            <Grid size={4}><MetricCard icon={<HealthErrorIcon sx={{ fontSize: 18 }} />} label="Erros 5xx" value={infraData.alb.errors_5xx ?? 0} accent={infraData.alb.errors_5xx ? "#ef5350" : "#ef9a9a"} /></Grid>
            <Grid size={4}><MetricCard icon={<TimeIcon sx={{ fontSize: 18 }} />} label="Latência média" value={infraData.alb.avg_response_ms !== null ? `${infraData.alb.avg_response_ms}ms` : "—"} accent="#ef9a9a" /></Grid>
          </Grid>
        </>
      )}
    </>
  );
}

function RoboFotosSection({ syncStatus, eventId, onRefresh, refreshing }: { syncStatus: PhotoSyncStatus; eventId?: string; onRefresh: () => void; refreshing: boolean }) {
  const accent = "#a78bfa";
  const driveTotal = syncStatus.total_drive_files;
  const s3Total = syncStatus.total_s3_files;

  // Apenas ciclos com fotos novas
  const activeCycles = syncStatus.upload_logs ?? [];

  return (
    <>
      {/* Cards de status */}
      <Grid container spacing={1.5}>
        <Grid size={6}>
          <Paper sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "14px", p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: "9px", backgroundColor: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloudSyncIcon sx={{ color: accent, fontSize: 18 }} />
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem" }}>Status</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: syncStatus.is_alive ? "#66bb6a" : "#ef5350", boxShadow: syncStatus.is_alive ? "0 0 6px #66bb6a" : "none", flexShrink: 0 }} />
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>{syncStatus.is_alive ? "Online" : "Offline"}</Typography>
            </Box>
            {syncStatus.seconds_since_last_cycle !== null && (
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", mt: 0.5 }}>
                último ciclo há {formatDuration(syncStatus.seconds_since_last_cycle)}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={6}>
          <MetricCard icon={<FaceIcon sx={{ fontSize: 18 }} />} label="Indexadas hoje" value={syncStatus.total_indexed_today} todayValue={syncStatus.total_cycles_today} todayLabel="ciclos hoje" accent={accent} />
        </Grid>

        <Grid size={6}>
          <MetricCard icon={<DriveIcon sx={{ fontSize: 18 }} />} label="Fotos no Drive" value={driveTotal} accent={accent} />
        </Grid>

        <Grid size={6}>
          <MetricCard icon={<S3Icon sx={{ fontSize: 18 }} />} label="Subidas pro S3" value={s3Total} accent={accent} />
        </Grid>
      </Grid>

      {/* Histórico — apenas ciclos com fotos */}
      <SectionHeader title="Histórico de uploads" color={accent} />
      {activeCycles.length === 0 ? (
        <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>Nenhuma foto subida ainda.</Typography>
      ) : (
        <Paper sx={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", p: 1.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activeCycles.map((entry) => {
              const d = toLocalTime(entry.cycle_at);
              return (
                <Box key={entry.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.9, borderBottom: "1px solid rgba(255,255,255,0.04)", "&:last-child": { borderBottom: "none" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", fontFamily: "monospace", minWidth: 70 }}>
                      {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                    {entry.server_name && (
                      <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem" }}>{entry.server_name}</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Typography sx={{ color: accent, fontSize: "0.75rem", fontWeight: 700 }}>
                      +{entry.new_files} foto{entry.new_files > 1 ? "s" : ""}
                    </Typography>
                    {entry.indexed > 0 && (
                      <Typography sx={{ color: "#66bb6a", fontSize: "0.72rem" }}>{entry.indexed} face{entry.indexed > 1 ? "s" : ""}</Typography>
                    )}
                    {entry.no_face > 0 && (
                      <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem" }}>{entry.no_face} sem rosto</Typography>
                    )}
                    {entry.errors > 0 && (
                      <Typography sx={{ color: "#ef5350", fontSize: "0.72rem" }}>{entry.errors} erro{entry.errors > 1 ? "s" : ""}</Typography>
                    )}
                    <Typography sx={{ color: "rgba(255,255,255,0.18)", fontSize: "0.65rem" }}>{formatDuration(entry.duration_seconds)}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();

  const section = params.section as string;
  const config = SECTION_CONFIG[section];

  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [infraData, setInfraData] = useState<InfraMetrics | null>(null);
  const [syncStatus, setSyncStatus] = useState<PhotoSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<AnalyticsPeriod>("all");
  const [eventId, setEventId] = useState<number | undefined>();
  const [events, setEvents] = useState<{ id: number; title: string }[]>([]);

  const [backgroundSx, setBackgroundSx] = useState(getEventBackgroundSxByKey("default"));

  useEffect(() => {
    const brandKey = getStoredEventBrandKey() ?? "default";
    setBackgroundSx(getEventBackgroundSxByKey(brandKey));
  }, []);
  const hasLoaded = useRef(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!config) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      if (config.needsAnalytics) {
        const summary = await getAnalyticsSummary(eventId, period);
        setData(summary);
      }
      if (config.needsInfra) {
        const infra = await getInfraMetrics();
        setInfraData(infra);
      }
      if (config.needsSync) {
        const sync = await getPhotoSyncStatus(eventId?.toString());
        setSyncStatus(sync);
      }
      hasLoaded.current = true;
    } catch {
      showToast("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [config, eventId, period, showToast]);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdminMaster && !isSubadmin) { router.replace("/pages/user/home"); return; }
    if (!config) { router.replace("/pages/admin/dashboard"); return; }
    fetchData(false);
    if (config.needsAnalytics || config.needsSync) {
      getEvents(100, 0).then((evs) => setEvents(evs.map((e) => ({ id: e.id, title: e.title }))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, isAdminMaster, isSubadmin]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, eventId]);

  // Auto-refresh a cada 5 min para o robô
  useEffect(() => {
    if (!config?.needsSync) return;
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, config]);

  if (!authReady || loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
        <CircularProgress sx={{ color: config?.color ?? "#ffcc01" }} />
      </Box>
    );
  }

  if (!config) return null;

  const showToday = period !== "day";
  const accentColor = config.color;

  return (
    <Box sx={{ minHeight: "100vh", paddingBottom: "80px", ...backgroundSx }}>
      <Container maxWidth="md" sx={{ pt: 0, pb: 4, px: { xs: 0, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 1 }}>
          <IconButton onClick={() => router.push("/pages/admin/dashboard")} sx={{ color: "white" }}>
            <ArrowBackIosIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, flex: 1, fontSize: "1.1rem" }}>
            {config.title}
          </Typography>
          <IconButton onClick={() => fetchData(true)} disabled={refreshing} sx={{ color: accentColor, p: 0.75 }}>
            {refreshing ? <CircularProgress size={18} sx={{ color: accentColor }} /> : <RefreshIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>

        {/* Filtros */}
        {(config.needsAnalytics || config.needsSync) && (
          <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            {config.needsAnalytics && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {PERIODS.map((p) => (
                  <Chip key={p} label={PERIOD_LABELS[p]} onClick={() => setPeriod(p)} size="small"
                    sx={{ fontSize: "0.72rem", height: 26, backgroundColor: period === p ? accentColor : "rgba(255,255,255,0.08)", color: period === p ? "#000" : "rgba(255,255,255,0.5)", fontWeight: period === p ? 700 : 400, cursor: "pointer" }} />
                ))}
              </Box>
            )}
            {events.length > 0 && (
              <Select value={eventId?.toString() ?? ""} onChange={(e) => setEventId(e.target.value === "" ? undefined : Number(e.target.value))} displayEmpty size="small"
                sx={{ fontSize: "0.75rem", color: eventId ? accentColor : "rgba(255,255,255,0.5)", ".MuiOutlinedInput-notchedOutline": { borderColor: eventId ? `${accentColor}40` : "rgba(255,255,255,0.12)" }, ".MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)", fontSize: 18 }, height: 28, minWidth: 160 }}>
                <MenuItem value="" sx={{ fontSize: "0.8rem" }}>Todos os eventos</MenuItem>
                {events.map((ev) => <MenuItem key={ev.id} value={ev.id.toString()} sx={{ fontSize: "0.8rem" }}>{ev.title}</MenuItem>)}
              </Select>
            )}
          </Box>
        )}

        {/* Conteúdo */}
        <Box sx={{ px: 2, pt: 2 }}>
          {section === "usuarios"       && data && <UsuariosSection data={data} showToday={showToday} />}
          {section === "interacoes"     && data && <InteracoesSection data={data} showToday={showToday} />}
          {section === "anuncios"       && data && <AnunciosSection data={data} showToday={showToday} />}
          {section === "photo-finder"   && data && <PhotoFinderSection data={data} showToday={showToday} />}
          {section === "posts"          && data && <PostsSection data={data} showToday={showToday} />}
          {section === "roleta"         && data && <RoletaSection data={data} showToday={showToday} />}
          {section === "notificacoes"   && data && <NotificacoesSection data={data} showToday={showToday} />}
          {section === "acessos"        && data && <AcessosSection data={data} showToday={showToday} />}
          {section === "infraestrutura" && infraData && <InfraestruturaSection infraData={infraData} />}
          {section === "robo-fotos"     && syncStatus && (
            <RoboFotosSection syncStatus={syncStatus} eventId={eventId?.toString()} onRefresh={() => fetchData(true)} refreshing={refreshing} />
          )}
        </Box>
      </Container>
    </Box>
  );
}
