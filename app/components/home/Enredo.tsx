"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
} from "@mui/material";

import {
  SambaSchoolResponse,
    getSambaSchoolsByEvent,
} from "@/app/services/sambaSchools/sambaSchoolService";

import {
  MusicLyricsResponse,
  getMusicLyricsByEvent,
} from "@/app/services/musicLyrics/musicLyricsService";

interface Props {
  eventId: number;
}

const Enredo: React.FC<Props> = ({ eventId }) => {
  const [schools, setSchools] = useState<SambaSchoolResponse[]>([]);
  const [musics, setMusics] = useState<MusicLyricsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      getSambaSchoolsByEvent(eventId),
      getMusicLyricsByEvent(eventId),
    ])
      .then(([schoolsData, musicsData]) => {
        setSchools(schoolsData);
        setMusics(musicsData);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box px={2} pb={4}>
      {/* ================= ESCOLAS ================= */}
      <Typography 
        variant="h6" 
        fontWeight={700} 
        mb={3}
        sx={{
          color: "#fff",
          textAlign: "center",
        }}
      >
        Escolas de Samba presentes no Camarote
      </Typography>

      {schools.length === 0 ? (
        <Typography 
          sx={{ 
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            mb: 3 
          }}
        >
          Nenhuma escola de samba cadastrada.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {schools.map((school) => (
            <Grid item xs={6} key={school.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 3,
                    pb: 2,
                  }}
                >
                  {/* Logo Circular */}
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      border: "3px solid rgba(255,255,255,0.2)",
                      overflow: "hidden",
                    }}
                  >
                    {school.image_url ? (
                      <Box
                        component="img"
                        src={school.image_url}
                        alt={school.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#000",
                          fontWeight: 700,
                          textAlign: "center",
                          fontSize: "0.9rem",
                        }}
                      >
                        {school.name.charAt(0)}
                      </Typography>
                    )}
                  </Box>

                  {/* Nome da Escola */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: "#fff",
                      mb: 1,
                      textAlign: "center",
                      fontSize: "1rem",
                    }}
                  >
                    {school.name}
                  </Typography>

                  {/* Descrição */}
                  {school.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {school.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      {/* ================= MÚSICAS ================= */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        🎵 Letras de Música
      </Typography>

      {musics.length === 0 ? (
        <Typography color="text.secondary">
          Nenhuma música cadastrada.
        </Typography>
      ) : (
        musics.map((music) => (
          <Card key={music.id} sx={{ mb: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700}>
                {music.song_name}
              </Typography>

              {music.singer && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Intérprete: {music.singer}
                </Typography>
              )}

              <Typography
                variant="body2"
                whiteSpace="pre-line"
                mt={1}
              >
                {music.lyrics}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default Enredo;
