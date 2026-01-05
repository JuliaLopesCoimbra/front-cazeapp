"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
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
      <Typography variant="h6" fontWeight={700} mb={2}>
        🎭 Escolas de Samba
      </Typography>

      {schools.length === 0 ? (
        <Typography color="text.secondary" mb={3}>
          Nenhuma escola de samba cadastrada.
        </Typography>
      ) : (
        schools.map((school) => (
          <Card key={school.id} sx={{ mb: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700}>{school.name}</Typography>

              {school.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={0.5}
                >
                  {school.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
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
