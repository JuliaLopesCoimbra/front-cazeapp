"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HistoryIcon from "@mui/icons-material/History";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import {
  ALLOWED_SIZES,
  listTshirtStock,
  listTshirtStockMovements,
  registerTshirtStockMovement,
  createTshirtStockItem,
  updateTshirtStockItem,
  deleteTshirtStockItem,
  type TshirtStockItem,
  type TshirtStockMovement,
} from "@/app/services/admin/tshirtStockService";
import {
  listTshirtReservationsAdmin,
  type TshirtReservationAdminRow,
} from "@/app/services/admin/tshirtReservationAdminService";

const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");
const cellSx = { color: "#fff", borderColor: "rgba(255,255,255,0.07)" };
const headSx = {
  color: "rgba(255,204,1,0.85)",
  fontWeight: 700,
  borderColor: "rgba(255,255,255,0.12)",
  fontSize: "0.72rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  py: 1.5,
};
const tableSx = {
  bgcolor: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 2,
};

function formatMovementDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatCard({
  icon,
  label,
  value,
  color = "#ffcc01",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card
      sx={{
        bgcolor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 2,
        flex: 1,
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, "&:last-child": { pb: 2 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.75}>
          <Box sx={{ color, display: "flex", opacity: 0.8 }}>{icon}</Box>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ color, fontWeight: 700, lineHeight: 1 }}>
          {value.toLocaleString("pt-BR")}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SizeChip({ size }: { size: string }) {
  return (
    <Chip
      label={size}
      size="small"
      sx={{
        bgcolor: "rgba(255,204,1,0.14)",
        color: "#ffcc01",
        fontWeight: 700,
        border: "1px solid rgba(255,204,1,0.28)",
        fontSize: "0.78rem",
        minWidth: 42,
      }}
    />
  );
}

function StatusChip({ status }: { status: string }) {
  if (status === "pending_pickup")
    return (
      <Chip
        label="Aguardando"
        size="small"
        sx={{
          bgcolor: "rgba(255,204,1,0.13)",
          color: "#ffcc01",
          fontWeight: 600,
          border: "1px solid rgba(255,204,1,0.28)",
          fontSize: "0.7rem",
        }}
      />
    );
  if (status === "picked_up")
    return (
      <Chip
        label="Retirada"
        size="small"
        sx={{
          bgcolor: "rgba(123,237,159,0.13)",
          color: "#7bed9f",
          fontWeight: 600,
          border: "1px solid rgba(123,237,159,0.28)",
          fontSize: "0.7rem",
        }}
      />
    );
  return (
    <Chip
      label={status}
      size="small"
      sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "0.7rem" }}
    />
  );
}

function MovementChip({ direction, quantity }: { direction: "in" | "out"; quantity: number }) {
  const isIn = direction === "in";
  return (
    <Chip
      label={`${isIn ? "+" : "−"}${quantity.toLocaleString("pt-BR")}`}
      size="small"
      sx={{
        bgcolor: isIn ? "rgba(123,237,159,0.13)" : "rgba(255,138,128,0.13)",
        color: isIn ? "#7bed9f" : "#ff8a80",
        fontWeight: 700,
        border: `1px solid ${isIn ? "rgba(123,237,159,0.28)" : "rgba(255,138,128,0.28)"}`,
        fontSize: "0.75rem",
        minWidth: 54,
      }}
    />
  );
}

export default function TshirtStockAdminPage() {
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [rows, setRows] = useState<TshirtStockItem[]>([]);
  const [reservations, setReservations] = useState<TshirtReservationAdminRow[]>([]);
  const [movements, setMovements] = useState<TshirtStockMovement[]>([]);
  const [histOffset, setHistOffset] = useState(0);
  const [histHasMore, setHistHasMore] = useState(false);
  const [histLoadingMore, setHistLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<TshirtStockItem | null>(null);
  const [editQty, setEditQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteRow, setDeleteRow] = useState<TshirtStockItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addSize, setAddSize] = useState<string>(ALLOWED_SIZES[0]);
  const [addQty, setAddQty] = useState("0");
  const [movDialog, setMovDialog] = useState<{ row: TshirtStockItem; direction: "in" | "out" } | null>(null);
  const [movQty, setMovQty] = useState("1");
  const [nameFilter, setNameFilter] = useState("");
  const [reservationPage, setReservationPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stock, hist, resv] = await Promise.all([
        listTshirtStock(),
        listTshirtStockMovements(100, 0),
        listTshirtReservationsAdmin(500, 0),
      ]);
      setRows(stock);
      setReservations(resv);
      setMovements(hist);
      setHistOffset(hist.length);
      setHistHasMore(hist.length === 100);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro ao carregar", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadMoreMovements = useCallback(async () => {
    if (!histHasMore || histLoadingMore) return;
    setHistLoadingMore(true);
    try {
      const batch = await listTshirtStockMovements(100, histOffset);
      setMovements((prev) => [...prev, ...batch]);
      setHistOffset((o) => o + batch.length);
      setHistHasMore(batch.length === 100);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro ao carregar histórico", "error");
    } finally {
      setHistLoadingMore(false);
    }
  }, [histHasMore, histLoadingMore, histOffset, showToast]);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdminMaster && !isSubadmin) {
      router.push("/pages/user/home");
      return;
    }
    load();
  }, [authReady, isAdminMaster, isSubadmin, router, load]);

  const missingSizes = useMemo(() => {
    const present = new Set(rows.map((r) => r.size));
    return ALLOWED_SIZES.filter((s) => !present.has(s));
  }, [rows]);

  const PAGE_SIZE = 10;

  const filteredReservations = useMemo(() => {
    const q = nameFilter.trim().toLowerCase();
    const filtered = q
      ? reservations.filter((r) => r.user_name_snapshot.toLowerCase().includes(q))
      : reservations;
    return [...filtered].sort((a, b) =>
      a.user_name_snapshot.localeCompare(b.user_name_snapshot, "pt-BR", { sensitivity: "base" })
    );
  }, [reservations, nameFilter]);

  const reservationPageCount = Math.max(1, Math.ceil(filteredReservations.length / PAGE_SIZE));
  const reservationPageItems = filteredReservations.slice(
    reservationPage * PAGE_SIZE,
    reservationPage * PAGE_SIZE + PAGE_SIZE
  );

  const openEdit = (row: TshirtStockItem) => {
    setEditRow(row);
    setEditQty(String(row.quantity));
  };
  const closeEdit = () => {
    setEditRow(null);
    setEditQty("");
  };

  const submitEdit = async () => {
    if (!editRow) return;
    const q = parseInt(editQty, 10);
    if (Number.isNaN(q) || q < 0) { showToast("Quantidade inválida", "error"); return; }
    setSaving(true);
    try {
      await updateTshirtStockItem(editRow.id, q);
      showToast("Estoque atualizado", "success");
      closeEdit();
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally { setSaving(false); }
  };

  const submitDelete = async () => {
    if (!deleteRow) return;
    setSaving(true);
    try {
      await deleteTshirtStockItem(deleteRow.id);
      showToast("Item removido", "success");
      setDeleteRow(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally { setSaving(false); }
  };

  const submitAdd = async () => {
    const q = parseInt(addQty, 10);
    if (Number.isNaN(q) || q < 0) { showToast("Quantidade inválida", "error"); return; }
    setSaving(true);
    try {
      await createTshirtStockItem(addSize, q);
      showToast("Tamanho adicionado", "success");
      setAddOpen(false);
      setAddQty("0");
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally { setSaving(false); }
  };

  const closeMovDialog = () => { setMovDialog(null); setMovQty("1"); };

  const submitMovement = async () => {
    if (!movDialog) return;
    const q = parseInt(movQty, 10);
    if (Number.isNaN(q) || q < 1) { showToast("Informe uma quantidade de pelo menos 1", "error"); return; }
    setSaving(true);
    try {
      await registerTshirtStockMovement(movDialog.row.id, movDialog.direction, q);
      showToast(movDialog.direction === "in" ? "Entrada registrada" : "Retirada registrada", "success");
      closeMovDialog();
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally { setSaving(false); }
  };

  useEffect(() => {
    if (addOpen) setAddSize(ALLOWED_SIZES[0]);
  }, [addOpen]);

  if (!authReady || (!isAdminMaster && !isSubadmin)) return null;

  const totalQty = rows.reduce((acc, r) => acc + r.quantity, 0);
  const totalPending = rows.reduce((a, r) => a + (r.pending_reservations ?? 0), 0);
  const totalAvailable = rows.reduce((a, r) => a + (r.available_to_reserve ?? 0), 0);
  const totalPickedUp = rows.reduce((a, r) => a + (r.picked_up_count ?? 0), 0);

  return (
    <Box sx={{ ...torcidaBackgroundSx, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Inventory2Icon sx={{ color: "#ffcc01", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
              Estoque de Camisetas
            </Typography>
          </Box>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => router.push("/pages/admin/tshirt-scan")}
              sx={{
                borderColor: "rgba(255,204,1,0.5)",
                color: "#ffcc01",
                fontWeight: 700,
                "&:hover": { borderColor: "#ffcc01", bgcolor: "rgba(255,204,1,0.07)" },
              }}
            >
              Escanear QR
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
              sx={{ bgcolor: "#ffcc01", color: "#111", fontWeight: 700, "&:hover": { bgcolor: "#e6b800" } }}
            >
              Adicionar tamanho
            </Button>
          </Box>
        </Box>

        {/* KPI cards */}
        {!loading && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
            <StatCard icon={<Inventory2Icon fontSize="small" />} label="Total em estoque" value={totalQty} color="#ffcc01" />
            <StatCard icon={<PeopleAltIcon fontSize="small" />} label="Reservas pendentes" value={totalPending} color="#ff8a80" />
            <StatCard icon={<LocalShippingIcon fontSize="small" />} label="Retiradas" value={totalPickedUp} color="#a78bfa" />
            <StatCard icon={<CheckCircleOutlineIcon fontSize="small" />} label="Livre p/ reserva" value={totalAvailable} color="#7bed9f" />
          </Stack>
        )}


        {/* Stock table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: "#ffcc01" }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ ...tableSx, mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Tamanho</TableCell>
                  <TableCell align="center" sx={headSx}>Estoque</TableCell>
                  <TableCell align="center" sx={headSx}>Reservas</TableCell>
                  <TableCell align="center" sx={headSx}>Retiradas</TableCell>
                  <TableCell align="center" sx={headSx}>Disponível</TableCell>
                  <TableCell align="right" sx={{ ...headSx, width: 160 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } }}>
                    <TableCell sx={cellSx}>
                      <SizeChip size={row.size} />
                    </TableCell>
                    <TableCell align="center" sx={{ ...cellSx, fontWeight: 700, fontSize: "1rem" }}>
                      {row.quantity.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      {(row.pending_reservations ?? 0) > 0 ? (
                        <Typography sx={{ color: "#ff8a80", fontWeight: 700 }}>
                          {(row.pending_reservations ?? 0).toLocaleString("pt-BR")}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      {(row.picked_up_count ?? 0) > 0 ? (
                        <Typography sx={{ color: "#a78bfa", fontWeight: 700 }}>
                          {(row.picked_up_count ?? 0).toLocaleString("pt-BR")}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Typography
                        sx={{
                          color: (row.available_to_reserve ?? 0) > 0 ? "#7bed9f" : "rgba(255,255,255,0.3)",
                          fontWeight: 700,
                        }}
                      >
                        {(row.available_to_reserve ?? 0).toLocaleString("pt-BR")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      <Tooltip title="Registrar entrada">
                        <IconButton size="small" onClick={() => { setMovQty("1"); setMovDialog({ row, direction: "in" }); }} sx={{ color: "#7bed9f" }}>
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Registrar retirada">
                        <IconButton size="small" onClick={() => { setMovQty("1"); setMovDialog({ row, direction: "out" }); }} sx={{ color: "#ff8a80" }}>
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar quantidade">
                        <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: "#ffcc01" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir tamanho">
                        <IconButton size="small" onClick={() => setDeleteRow(row)} sx={{ color: "rgba(255,255,255,0.35)" }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length > 0 && (
                  <TableRow sx={{ bgcolor: "rgba(255,204,1,0.03)" }}>
                    <TableCell sx={{ ...cellSx, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Total
                    </TableCell>
                    <TableCell align="center" sx={{ ...cellSx, fontWeight: 700 }}>
                      {totalQty.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell align="center" sx={{ ...cellSx, fontWeight: 700, color: totalPending > 0 ? "#ff8a80" : "rgba(255,255,255,0.3)" }}>
                      {totalPending > 0 ? totalPending.toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell align="center" sx={{ ...cellSx, fontWeight: 700, color: totalPickedUp > 0 ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
                      {totalPickedUp > 0 ? totalPickedUp.toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell align="center" sx={{ ...cellSx, fontWeight: 700, color: "#7bed9f" }}>
                      {totalAvailable.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell sx={cellSx} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && rows.length === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={1.5}>
            <Inventory2Icon sx={{ color: "rgba(255,255,255,0.15)", fontSize: 52 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.45)" }}>
              Nenhum item cadastrado. Use &quot;Adicionar tamanho&quot; para começar.
            </Typography>
          </Box>
        )}

        {/* History section */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <HistoryIcon sx={{ color: "#ffcc01", fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
            Histórico de movimentações
          </Typography>
          {!loading && movements.length > 0 && (
            <Chip
              label={movements.length}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)", fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)" }}
            />
          )}
        </Box>

        {!loading && (
          <>
            <TableContainer component={Paper} sx={{ ...tableSx, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Data e hora</TableCell>
                    <TableCell sx={headSx}>Responsável</TableCell>
                    <TableCell align="center" sx={headSx}>Tamanho</TableCell>
                    <TableCell align="center" sx={headSx}>Movimento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ ...cellSx, py: 4, textAlign: "center", color: "rgba(255,255,255,0.35)" }}>
                        Nenhuma movimentação registrada ainda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((m) => (
                      <TableRow key={m.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } }}>
                        <TableCell sx={{ ...cellSx, color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>
                          {formatMovementDate(m.created_at)}
                        </TableCell>
                        <TableCell sx={cellSx}>{m.performed_by_name}</TableCell>
                        <TableCell align="center" sx={cellSx}>
                          <Chip
                            label={m.size}
                            size="small"
                            sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: "0.75rem", minWidth: 40 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={cellSx}>
                          <MovementChip direction={m.direction} quantity={m.quantity} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {histHasMore && (
              <Box display="flex" justifyContent="center" mb={4}>
                <Button
                  variant="outlined"
                  onClick={loadMoreMovements}
                  disabled={histLoadingMore}
                  sx={{ borderColor: "rgba(255,204,1,0.4)", color: "#ffcc01", "&:hover": { borderColor: "#ffcc01", bgcolor: "rgba(255,204,1,0.07)" } }}
                >
                  {histLoadingMore ? <CircularProgress size={20} sx={{ color: "#ffcc01" }} /> : "Carregar mais"}
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Reservations section */}
        {!loading && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2} mt={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <PeopleAltIcon sx={{ color: "#ffcc01", fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
                  Reservas dos participantes
                </Typography>
                <Chip
                  label={filteredReservations.length === reservations.length
                    ? reservations.length
                    : `${filteredReservations.length} / ${reservations.length}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,204,1,0.14)", color: "#ffcc01", fontWeight: 700, border: "1px solid rgba(255,204,1,0.28)" }}
                />
              </Box>
              <TextField
                size="small"
                placeholder="Buscar por nome..."
                value={nameFilter}
                onChange={(e) => { setNameFilter(e.target.value); setReservationPage(0); }}
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ mr: 0.5, color: "rgba(255,255,255,0.4)", display: "flex" }}>
                      <SearchIcon fontSize="small" />
                    </Box>
                  ),
                }}
                sx={{
                  minWidth: 220,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.18)" },
                    "&:hover fieldset": { borderColor: "rgba(255,204,1,0.45)" },
                    "&.Mui-focused fieldset": { borderColor: "#ffcc01" },
                  },
                  "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.3)" },
                }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ ...tableSx, mb: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Participante</TableCell>
                    <TableCell sx={headSx}>E-mail</TableCell>
                    <TableCell align="center" sx={headSx}>Tam.</TableCell>
                    <TableCell align="center" sx={headSx}>Status</TableCell>
                    <TableCell sx={headSx}>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservationPageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ ...cellSx, py: 4, textAlign: "center", color: "rgba(255,255,255,0.35)" }}>
                        {nameFilter ? "Nenhum resultado para esta busca." : "Nenhuma reserva ainda."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservationPageItems.map((r) => (
                      <TableRow key={r.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } }}>
                        <TableCell sx={cellSx}>{r.user_name_snapshot}</TableCell>
                        <TableCell sx={{ ...cellSx, color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>
                          {r.user_email_snapshot}
                        </TableCell>
                        <TableCell align="center" sx={cellSx}>
                          <SizeChip size={r.size} />
                        </TableCell>
                        <TableCell align="center" sx={cellSx}>
                          <StatusChip status={r.status} />
                        </TableCell>
                        <TableCell sx={{ ...cellSx, color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}>
                          {formatMovementDate(r.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredReservations.length > PAGE_SIZE && (
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={reservationPage === 0}
                  onClick={() => setReservationPage((p) => p - 1)}
                  sx={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)", minWidth: 100 }}
                >
                  ← Anterior
                </Button>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                  {reservationPage + 1} / {reservationPageCount}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={reservationPage >= reservationPageCount - 1}
                  onClick={() => setReservationPage((p) => p + 1)}
                  sx={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)", minWidth: 100 }}
                >
                  Próximo →
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Edit dialog */}
      <Dialog open={Boolean(editRow)} onClose={closeEdit} PaperProps={{ sx: { bgcolor: "#1a1a1a", color: "#fff", minWidth: 300 } }}>
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          Editar quantidade — <strong>{editRow?.size}</strong>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
            inputProps={{ min: 0 }}
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { color: "#fff" }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEdit} sx={{ color: "rgba(255,255,255,0.55)" }}>Cancelar</Button>
          <Button onClick={submitEdit} disabled={saving} variant="contained" sx={{ bgcolor: "#ffcc01", color: "#111", fontWeight: 700, "&:hover": { bgcolor: "#e6b800" } }}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={Boolean(deleteRow)} onClose={() => setDeleteRow(null)} PaperProps={{ sx: { bgcolor: "#1a1a1a", color: "#fff" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          Excluir tamanho {deleteRow?.size}?
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
            O registro será removido. Você pode cadastrar o tamanho novamente depois.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteRow(null)} sx={{ color: "rgba(255,255,255,0.55)" }}>Cancelar</Button>
          <Button onClick={submitDelete} disabled={saving} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} PaperProps={{ sx: { bgcolor: "#1a1a1a", color: "#fff" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Adicionar tamanho</DialogTitle>
        <DialogContent sx={{ minWidth: 280, pt: 2 }}>
          <FormControl fullWidth margin="normal" sx={{ "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}>
            <InputLabel id="add-size-label">Tamanho</InputLabel>
            <Select
              labelId="add-size-label"
              label="Tamanho"
              value={addSize}
              onChange={(e) => setAddSize(e.target.value)}
              sx={{ color: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" } }}
            >
              {ALLOWED_SIZES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Quantidade inicial"
            type="number"
            fullWidth
            value={addQty}
            onChange={(e) => setAddQty(e.target.value)}
            inputProps={{ min: 0 }}
            sx={{ "& .MuiOutlinedInput-root": { color: "#fff" }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ color: "rgba(255,255,255,0.55)" }}>Cancelar</Button>
          <Button onClick={submitAdd} disabled={saving} variant="contained" sx={{ bgcolor: "#ffcc01", color: "#111", fontWeight: 700, "&:hover": { bgcolor: "#e6b800" } }}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Movement dialog */}
      <Dialog open={Boolean(movDialog)} onClose={closeMovDialog} PaperProps={{ sx: { bgcolor: "#1a1a1a", color: "#fff" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {movDialog?.direction === "in" ? "Registrar entrada" : "Registrar retirada"} —{" "}
          <strong>{movDialog?.row.size}</strong>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            value={movQty}
            onChange={(e) => setMovQty(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { color: "#fff" }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeMovDialog} sx={{ color: "rgba(255,255,255,0.55)" }}>Cancelar</Button>
          <Button
            onClick={submitMovement}
            disabled={saving}
            variant="contained"
            sx={{
              bgcolor: movDialog?.direction === "in" ? "#7bed9f" : "#ff8a80",
              color: "#111",
              fontWeight: 700,
              "&:hover": { bgcolor: movDialog?.direction === "in" ? "#5dd87f" : "#ff6b6b" },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
