"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import {
  listDataRemovalRequests,
  finalizeDataRemovalRequest,
  type DataRemovalRequestRow,
} from "@/app/services/privacy/dataRemovalAdminService";

const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");

const cellSx = { color: "#fff", borderColor: "rgba(255,255,255,0.12)" };
const headSx = { color: "#ffcc01", fontWeight: 700, borderColor: "rgba(255,255,255,0.12)" };

export default function DataRemovalRequestsAdminPage() {
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [rows, setRows] = useState<DataRemovalRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [confirmRow, setConfirmRow] = useState<DataRemovalRequestRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDataRemovalRequests(
        statusFilter === "all" ? undefined : statusFilter
      );
      setRows(data);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro ao carregar", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdminMaster && !isSubadmin) {
      router.push("/pages/user/home");
      return;
    }
    load();
  }, [authReady, isAdminMaster, isSubadmin, router, load]);

  const openConfirmModal = (row: DataRemovalRequestRow) => {
    setConfirmRow(row);
  };

  const closeConfirmModal = () => {
    if (actionId !== null) return;
    setConfirmRow(null);
  };

  const handleConfirmFinalize = async () => {
    if (!confirmRow) return;
    const id = confirmRow.id;
    setActionId(id);
    try {
      const res = await finalizeDataRemovalRequest(id);
      showToast(res.message, "success");
      setConfirmRow(null);
      await load();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally {
      setActionId(null);
    }
  };

  if (!authReady || (!isAdminMaster && !isSubadmin)) {
    return null;
  }

  return (
    <Box
      sx={{
        ...torcidaBackgroundSx,
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
          Solicitações de remoção de dados (LGPD)
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}>
          Apenas administradores. Ao concluir, o usuário é desativado e os tokens são invalidados.
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel id="status-filter" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Status
          </InputLabel>
          <Select
            labelId="status-filter"
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "rgba(20,20,20,0.98)",
                  color: "#fff",
                  "& .MuiMenuItem-root": { color: "#fff" },
                  "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,204,1,0.2)" },
                },
              },
            }}
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.6)" },
              "& .MuiSvgIcon-root": { color: "#fff" },
            }}
          >
            <MenuItem value="pending">Pendentes</MenuItem>
            <MenuItem value="completed">Concluídas</MenuItem>
            <MenuItem value="rejected">Rejeitadas</MenuItem>
            <MenuItem value="all">Todas</MenuItem>
          </Select>
        </FormControl>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#ffcc01" }} />
          </Box>
        ) : rows.length === 0 ? (
          <Alert severity="info" sx={{ bgcolor: "rgba(0,0,0,0.35)", color: "#fff" }}>
            Nenhuma solicitação encontrada para este filtro.
          </Alert>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ bgcolor: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>ID</TableCell>
                  <TableCell sx={headSx}>E-mail</TableCell>
                  <TableCell sx={headSx}>CPF</TableCell>
                  <TableCell sx={headSx}>Nome</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Criado em</TableCell>
                  <TableCell sx={headSx}>Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell sx={cellSx}>{r.id}</TableCell>
                    <TableCell sx={cellSx}>{r.email_submitted}</TableCell>
                    <TableCell sx={cellSx}>{r.cpf_masked}</TableCell>
                    <TableCell sx={cellSx}>{r.user_name_snapshot ?? "—"}</TableCell>
                    <TableCell sx={cellSx}>{r.status}</TableCell>
                    <TableCell sx={cellSx}>
                      {r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {r.status === "pending" ? (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={actionId === r.id}
                          onClick={() => openConfirmModal(r)}
                          sx={{
                            textTransform: "none",
                            backgroundColor: "#ffcc01",
                            color: "#000",
                            "&:hover": { backgroundColor: "#e6b800" },
                          }}
                        >
                          {actionId === r.id ? (
                            <CircularProgress size={18} sx={{ color: "#000" }} />
                          ) : (
                            "Remover cadastro"
                          )}
                        </Button>
                      ) : (
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                          {r.processed_at
                            ? `Concluído em ${new Date(r.processed_at).toLocaleString("pt-BR")}`
                            : "—"}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={Boolean(confirmRow)}
          onClose={closeConfirmModal}
          disableEscapeKeyDown={actionId !== null}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(26, 26, 26, 0.96)",
              backdropFilter: "blur(20px)",
              color: "#fff",
              borderRadius: 3,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              minWidth: { xs: "90%", sm: 480 },
            },
          }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, pb: 1 }}>
            <PersonOffIcon sx={{ fontSize: 32, color: "#ffcc01" }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Remover cadastro do usuário
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Solicitação LGPD #{confirmRow?.id}
              </Typography>
            </Box>
          </DialogTitle>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 3 }} />
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText
              component="div"
              sx={{ color: "rgba(255,255,255,0.92)", fontSize: "0.95rem", lineHeight: 1.65 }}
            >
              <p style={{ margin: "0 0 12px 0" }}>
                Você está prestes a <strong style={{ color: "#ffb74d" }}>desativar</strong> o cadastro
                vinculado a esta solicitação e marcar o pedido como <strong>concluído</strong>.
              </p>
              <Box
                sx={{
                  bgcolor: "rgba(0,0,0,0.35)",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
                  <strong>E-mail:</strong> {confirmRow?.email_submitted}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff", mb: 0.5 }}>
                  <strong>CPF:</strong> {confirmRow?.cpf_masked}
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  <strong>Nome:</strong> {confirmRow?.user_name_snapshot ?? "—"}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 2 }}>
                Os tokens de acesso serão invalidados. Esta ação pode ser revertida depois pela tela de
                permissões, se necessário.
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              onClick={closeConfirmModal}
              disabled={actionId !== null}
              sx={{
                color: "rgba(255,255,255,0.85)",
                textTransform: "none",
                borderRadius: "12px",
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmFinalize}
              disabled={actionId !== null}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                backgroundColor: "#ffcc01",
                color: "#000",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#e6b800" },
              }}
            >
              {actionId !== null ? (
                <CircularProgress size={22} sx={{ color: "#000" }} />
              ) : (
                "Confirmar remoção"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
