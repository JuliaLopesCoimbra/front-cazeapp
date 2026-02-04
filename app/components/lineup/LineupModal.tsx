"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LineupView from "./LineupView";

interface LineupModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  eventTitle?: string;
}

export default function LineupModal({
  open,
  onClose,
  eventId,
  eventTitle,
}: LineupModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          pb: 2,
        }}
      >
        <Box sx={{ color: "#ffc91f", fontWeight: 600, fontSize: "1.25rem" }}>
          {eventTitle ? `Line Up - ${eventTitle}` : "Line Up"}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 3,
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <LineupView eventId={eventId} />
      </DialogContent>
    </Dialog>
  );
}

