import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";

const BASE_URL = "http://unicahdev.registro.cp.unicah.edu";

export default function VisualizarDocumentoFinalServicio({ docCod }) {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!docCod) return;

    const fetchArchivo = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/asolicitud_documentos/mostrarDocumentoFinal.php?DocCod=${docCod}`);
        if (res.data.success && res.data.data) {
          setArchivo(res.data.data);
        }
      } catch (error) {
        console.error("Error al obtener el documento final:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchArchivo();
  }, [docCod]);

  if (cargando)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={28} />
      </Box>
    );

  if (!archivo) return null;

  const rutaCompleta = `${BASE_URL}${archivo.DocPath}`;

  return (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        mt: 2,
        bgcolor: "#fafafa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Servicio Académico a entregar
      </Typography>

      <Button
        variant="contained"
        color="inherit"
        href={rutaCompleta}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<VisibilityIcon />}
        sx={{
          fontWeight: 700,
          bgcolor: "#000",
          color: "#fff",
          px: 3,
          "&:hover": { bgcolor: "#222" },
        }}
      >
        Ver documento
      </Button>
    </Box>
  );
}
