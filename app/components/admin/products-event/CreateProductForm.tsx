"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { createProductEvent, CreateProductEventData, getProductsByEvent } from "@/app/services/productsEvent/productEventService";
import { getEvents, EventResponse } from "@/app/services/events/eventAppService";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";

interface CreateProductFormProps {
  onSuccess?: () => void;
  eventId?: number;
}

export default function CreateProductForm({ onSuccess, eventId: initialEventId }: CreateProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");
  const [stock, setStock] = useState(0);
  const [eventId, setEventId] = useState<number | "">(initialEventId || "");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const { showToast } = useToast();
  const router = useRouter();

  // Função para formatar preço como moeda brasileira (apenas para display)
  const formatPriceDisplay = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    if (!numbers) return "";
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseFloat(numbers) / 100;
    
    // Formata como moeda brasileira
    return amount.toFixed(2).replace(".", ",");
  };

  // Função para converter preço formatado para número (para envio)
  const parsePrice = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "0";
    // Converte para número e divide por 100, depois formata com ponto
    const amount = parseFloat(numbers) / 100;
    return amount.toFixed(2);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove R$ e formata apenas os números
    const formatted = formatPriceDisplay(inputValue);
    setPrice(formatted);
  };

  useEffect(() => {
    if (!initialEventId) {
      loadEvents();
    }
  }, [initialEventId]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await getEvents(100, 0);
      setEvents(data);
    } catch (err) {
      showToast("Erro ao carregar eventos", "error");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validação de tamanho: máximo 5MB por imagem
    const maxSizePerImage = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    
    files.forEach((file) => {
      if (file.size > maxSizePerImage) {
        showToast(`A imagem ${file.name} é muito grande. Máximo de 5MB por imagem.`, "error");
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) return;

    setImages((prev) => [...prev, ...validFiles]);
    
    // Criar previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("O nome é obrigatório", "error");
      return;
    }

    const priceValue = parsePrice(price);
    if (!priceValue || parseFloat(priceValue) <= 0) {
      showToast("O preço deve ser um valor válido e maior que zero", "error");
      return;
    }

    if (stock < 0) {
      showToast("O estoque não pode ser negativo", "error");
      return;
    }

    if (!eventId) {
      showToast("Selecione um evento", "error");
      return;
    }

    setLoading(true);

    try {
      const data: CreateProductEventData = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parsePrice(price),
        status: status,
        stock: stock,
        event_id: Number(eventId),
        images: images.length > 0 ? images : undefined,
      };

      await createProductEvent(data);
      showToast("Produto criado com sucesso!", "success");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/pages/admin/events/${eventId}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Erro ao criar produto", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(/background/dashboard.png)",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 3,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          size="medium"
          sx={{ color: "#fff", fontSize: "1.5rem" }}
        >
          <ArrowBackIosIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="h3" fontWeight={700} sx={{ color: "#fff", fontSize: { xs: "1.1rem", sm: "2rem" } }}>
          Criar Novo Produto
        </Typography>
      </Box>

      {/* Formulário */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          p: { xs: 3, sm: 4 },
          maxWidth: 800,
          width: "100%",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {!initialEventId && (
            <FormControl fullWidth>
              <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>Evento *</InputLabel>
              <Select
                value={eventId}
                onChange={(e) => setEventId(e.target.value as number)}
                disabled={loading || loadingEvents}
                required
                sx={{
                  color: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffc91f",
                  },
                }}
              >
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            label="Nome *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#fff",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ffc91f",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.7)",
                "&.Mui-focused": {
                  color: "#ffc91f",
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#fff",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ffc91f",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.7)",
                "&.Mui-focused": {
                  color: "#ffc91f",
                },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Preço *"
              value={price}
              onChange={handlePriceChange}
              disabled={loading}
              required
              placeholder="0,00"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography sx={{ color: "rgba(255,255,255,0.7)" }}>R$</Typography></InputAdornment>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffc91f",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": {
                    color: "#ffc91f",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Estoque"
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              disabled={loading}
              inputProps={{ min: "0" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffc91f",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": {
                    color: "#ffc91f",
                  },
                },
              }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              sx={{
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.1)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ffc91f",
                },
              }}
            >
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
            </Select>
          </FormControl>

          {/* Upload de imagens */}
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}>
              Fotos do Produto
            </Typography>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: "#ffc91f",
                    backgroundColor: "rgba(255, 201, 31, 0.1)",
                  },
                }}
              >
                Adicionar Fotos
              </Button>
            </label>

            {/* Preview das imagens */}
            {previews.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                {previews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 150,
                      height: 150,
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "rgba(255,0,0,0.7)",
                        },
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{
              backgroundColor: "#ffc91f",
              color: "#000",
              fontWeight: 700,
              fontSize: { xs: "0.875rem", sm: "1.1rem" },
              py: { xs: 1, sm: 1.5 },
              "&:hover": {
                backgroundColor: "#ffd54f",
              },
              "&:disabled": {
                backgroundColor: "rgba(255, 201, 31, 0.5)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Criar Produto"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

