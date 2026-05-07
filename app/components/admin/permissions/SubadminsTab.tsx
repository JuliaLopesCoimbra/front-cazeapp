"use client";

import { useEffect, useState } from "react";
import { Box, Button, Paper, Typography, Alert, CircularProgress } from "@mui/material";
import { PersonAdd, Info } from "@mui/icons-material";
import { listSubadmins } from "@/app/services/auth/authAdminService";
import UserCard from "./UserCard";
import { useInfiniteUsers } from "./useInfiniteUsers";

const STATUS_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
] as const;

type StatusFilter = "" | "active" | "inactive";

interface SubadminsTabProps {
  onAddClick: () => void;
  onRevoke: (userType: "subadmin" | "colunista" | "user", userId: number, userName: string) => void;
  onReactivate: (userType: "subadmin" | "colunista" | "user", userId: number, userName: string) => void;
  onResendInvite: (userId: number, userName: string) => void;
  refreshTrigger?: number;
  searchTerm?: string;
}

export default function SubadminsTab({ onAddClick, onRevoke, onReactivate, onResendInvite, refreshTrigger, searchTerm = "" }: SubadminsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const { users: subadmins, loading, hasMore, reset, loaderRef } = useInfiniteUsers(listSubadmins, searchTerm, statusFilter);

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
            Administradores
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            {subadmins.length} {subadmins.length === 1 ? "administrador" : "administradores"} carregados
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
          Adicionar Administrador
        </Button>
      </Box>

      {/* Status filter chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((f) => (
          <Box
            key={f.value}
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

      {loading && subadmins.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#ffcc01" }} size={28} />
        </Box>
      ) : subadmins.length === 0 ? (
        <Alert severity="info" icon={<Info />} sx={{ backgroundColor: "rgba(33, 150, 243, 0.15)", border: "1px solid rgba(33, 150, 243, 0.3)", color: "white", borderRadius: 2 }}>
          {searchTerm ? `Nenhum administrador encontrado para "${searchTerm}"` : "Nenhum administrador encontrado."}
        </Alert>
      ) : (
        <>
          {subadmins.map((subadmin) => (
            <UserCard key={subadmin.id} user={subadmin} userType="subadmin" onRevoke={onRevoke} onReactivate={onReactivate} onResendInvite={onResendInvite} />
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
