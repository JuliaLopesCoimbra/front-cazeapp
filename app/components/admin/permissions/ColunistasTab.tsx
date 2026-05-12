"use client";

import { useEffect, useState } from "react";
import { Box, Button, Paper, Typography, Alert, CircularProgress } from "@mui/material";
import { PersonAdd, Info, Visibility } from "@mui/icons-material";
import { listColunistas } from "@/app/services/auth/authAdminService";
import { useAuth } from "@/app/context/AuthContext";
import UserCard from "./UserCard";
import { useInfiniteUsers } from "./useInfiniteUsers";

const STATUS_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
] as const;

type StatusFilter = "" | "active" | "inactive";

interface ColunistasTabProps {
  onAddClick: () => void;
  onRevoke: (userType: "subadmin" | "colunista" | "user", userId: number, userName: string) => void;
  onReactivate: (userType: "subadmin" | "colunista" | "user", userId: number, userName: string) => void;
  onResendInvite: (userId: number, userName: string) => void;
  refreshTrigger?: number;
  searchTerm?: string;
}

export default function ColunistasTab({ onAddClick, onRevoke, onReactivate, onResendInvite, refreshTrigger, searchTerm = "" }: ColunistasTabProps) {
  const { isSubadmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const { users: colunistas, loading, hasMore, reset, loaderRef } = useInfiniteUsers(listColunistas, searchTerm, statusFilter);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)",
        borderRadius: 3,
        p: 3,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 0.5 }}>
            Colunistas
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            {colunistas.length} {colunistas.length === 1 ? "colunista" : "colunistas"} carregados
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={onAddClick}
          sx={{
            backgroundColor: "#ffcc01",
            color: "#000",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": { backgroundColor: "#e6b800", transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(255, 204, 1, 0.4)" },
            transition: "all 0.2s ease",
          }}
        >
          Adicionar Colunista
        </Button>
      </Box>

      {/* Info banner for subadmin limitation */}
      {isSubadmin && (
        <Alert
          severity="info"
          icon={<Visibility sx={{ fontSize: 18 }} />}
          sx={{
            mb: 2.5,
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            border: "1px solid rgba(33, 150, 243, 0.25)",
            color: "rgba(255,255,255,0.85)",
            borderRadius: 2,
            fontSize: "0.82rem",
          }}
        >
          Você está visualizando apenas os colunistas que você convidou.
        </Alert>
      )}

      {/* Status filter chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((f) => (
          <Box
            key={f.value || "all"}
            onClick={() => setStatusFilter(f.value)}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: statusFilter === f.value ? 700 : 400,
              color: statusFilter === f.value ? "#000" : "rgba(255,255,255,0.7)",
              backgroundColor: statusFilter === f.value ? "#ffcc01" : "rgba(255,255,255,0.08)",
              border: `1px solid ${statusFilter === f.value ? "#ffcc01" : "rgba(255,255,255,0.12)"}`,
              transition: "all 0.2s",
              userSelect: "none",
            }}
          >
            {f.label}
          </Box>
        ))}
      </Box>

      {loading && colunistas.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#ffcc01" }} size={28} />
        </Box>
      ) : colunistas.length === 0 ? (
        <Alert severity="info" icon={<Info />} sx={{ backgroundColor: "rgba(33, 150, 243, 0.15)", border: "1px solid rgba(33, 150, 243, 0.3)", color: "white", borderRadius: 2 }}>
          {searchTerm ? `Nenhum colunista encontrado para "${searchTerm}"` : "Nenhum colunista encontrado."}
        </Alert>
      ) : (
        <>
          {colunistas.map((colunista) => (
            <UserCard key={colunista.id} user={colunista} userType="colunista" onRevoke={onRevoke} onReactivate={onReactivate} onResendInvite={onResendInvite} />
          ))}

          {hasMore && (
            <Box ref={loaderRef} sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              {loading && <CircularProgress sx={{ color: "#ffcc01" }} size={24} />}
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
