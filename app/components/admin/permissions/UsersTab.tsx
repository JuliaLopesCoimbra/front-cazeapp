"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Typography, Alert, CircularProgress } from "@mui/material";
import { Info } from "@mui/icons-material";
import { listUsers } from "@/app/services/auth/authAdminService";
import UserCard from "./UserCard";
import { useInfiniteUsers } from "./useInfiniteUsers";

const STATUS_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Ativos", value: "active" },
  { label: "Inativos", value: "inactive" },
] as const;

type StatusFilter = "" | "active" | "inactive";

interface UsersTabProps {
  onRevoke: (userType: "subadmin" | "colunista" | "user", userId: number, userName: string) => void;
  onReactivate: (userType: "subadmin" | "colunista" | "user", userId: number, userName: string) => void;
  refreshTrigger?: number;
  searchTerm?: string;
}

export default function UsersTab({ onRevoke, onReactivate, refreshTrigger, searchTerm = "" }: UsersTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const { users, loading, hasMore, reset, loaderRef } = useInfiniteUsers(listUsers, searchTerm, statusFilter);

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
            Usuários
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            {users.length} {users.length === 1 ? "usuário" : "usuários"} carregados
          </Typography>
        </Box>
      </Box>

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

      {loading && users.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#ffcc01" }} size={28} />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info" icon={<Info />} sx={{ backgroundColor: "rgba(33, 150, 243, 0.15)", border: "1px solid rgba(33, 150, 243, 0.3)", color: "white", borderRadius: 2 }}>
          {searchTerm ? `Nenhum usuário encontrado para "${searchTerm}"` : "Nenhum usuário encontrado."}
        </Alert>
      ) : (
        <>
          {users.map((user) => (
            <UserCard key={user.id} user={user} userType="user" onRevoke={onRevoke} onReactivate={onReactivate} />
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
