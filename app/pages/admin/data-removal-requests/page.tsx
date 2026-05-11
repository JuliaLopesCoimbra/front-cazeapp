"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import {
  listDataRemovalRequests,
  type DataRemovalRequestRow,
} from "@/app/services/privacy/dataRemovalAdminService";

const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");

const cellSx = { color: "#fff", borderColor: "rgba(255,255,255,0.12)" };
const headSx = { color: "#ffcc01", fontWeight: 700, borderColor: "rgba(255,255,255,0.12)" };

export default function DataRemovalRequestsAdminPage() {
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [rows, setRows] = useState<DataRemovalRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDataRemovalRequests();
      setRows(data);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Erro ao carregar", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdminMaster && !isSubadmin) {
      router.push("/pages/user/home");
      return;
    }
    load();
  }, [authReady, isAdminMaster, isSubadmin, router, load]);

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
          Remoções de dados (LGPD)
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}>
          Histórico de usuários que solicitaram a remoção de seus dados. O cadastro é anonimizado
          automaticamente no momento da solicitação.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#ffcc01" }} />
          </Box>
        ) : rows.length === 0 ? (
          <Alert severity="info" sx={{ bgcolor: "rgba(0,0,0,0.35)", color: "#fff" }}>
            Nenhuma solicitação registrada.
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
                  <TableCell sx={headSx}>Nome (snapshot)</TableCell>
                  <TableCell sx={headSx}>Solicitado em</TableCell>
                  <TableCell sx={headSx}>Removido em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell sx={cellSx}>{r.id}</TableCell>
                    <TableCell sx={cellSx}>{r.email_submitted}</TableCell>
                    <TableCell sx={cellSx}>{r.cpf_masked}</TableCell>
                    <TableCell sx={cellSx}>{r.user_name_snapshot ?? "—"}</TableCell>
                    <TableCell sx={cellSx}>
                      {r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {r.processed_at ? new Date(r.processed_at).toLocaleString("pt-BR") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
