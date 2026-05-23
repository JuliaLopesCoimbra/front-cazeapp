"use client";

import React, { useState } from "react";
import { Box, Avatar, TextField, IconButton, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  submitting?: boolean;
  userPhoto?: string;
  userName?: string;
  userEmail?: string;
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Adicione um comentário...",
  disabled = false,
  submitting = false,
  userPhoto,
  userName,
  userEmail,
}: CommentInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Avatar
        src={userPhoto || undefined}
        sx={{ width: 32, height: 32, mt: 0.5 }}
      >
        {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "U"}
      </Avatar>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 500) {
                onChange(newValue);
              }
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline
            minRows={1}
            maxRows={4}
            disabled={disabled || submitting}
            inputProps={{
              maxLength: 500,
            }}
            helperText={`${value.length}/500 caracteres`}
            FormHelperTextProps={{
              sx: {
                color: "#9E9E9E",
                fontSize: "0.75rem",
                mt: 0.5,
                margin: 0,
              },
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(0,0,0,0.03)",
                color: "#0A0A0A",
                borderRadius: 2,
                "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(0,0,0,0.22)" },
                "&.Mui-focused fieldset": { borderColor: "#009440" },
              },
              "& .MuiInputBase-input": {
                color: "#0A0A0A",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                resize: "none",
                "&::placeholder": { color: "#9E9E9E", opacity: 1 },
              },
              "& .MuiInputBase-inputMultiline": {
                overflow: "hidden !important",
                resize: "none",
              },
            }}
          />
          <IconButton
            onClick={onSubmit}
            disabled={!value.trim() || submitting || disabled}
            sx={{
              color: "#009440",
              alignSelf: "flex-start",
              mt: "8px",
              opacity: !value.trim() ? 0.4 : 1,
              "&.Mui-disabled": { color: "#009440", opacity: 0.4 },
            }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: "#009440" }} />
            ) : (
              <SendIcon sx={{ color: "#009440" }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
