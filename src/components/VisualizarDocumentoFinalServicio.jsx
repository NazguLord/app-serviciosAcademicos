// src/components/VisualizarDocumentoFinalServicio.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
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
        const res = await axios.get(
          `${BASE_URL}/api/asolicitud_documentos/mostrarDocumentoFinal.php?DocCod=${docCod}`
        );
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
      mt: 2,
      width: "75%", // mismo ancho que los documentos adjuntos
      mx: "auto",
      pl: { xs: 0, sm: 5, md: 9, lg: 13.5 }, // 👈 mueve todo el contenido hacia la derecha
      display: "flex",
      justifyContent: "flex-start",
    }}
  >
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        p: 2,
        bgcolor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        width: "320px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DescriptionOutlinedIcon sx={{ color: "#1976d2", fontSize: 26 }} />
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: "#333", fontSize: "0.95rem" }}
        >
          Servicio Académico a entregar
        </Typography>
      </Box>

      <Button
        variant="contained"        
        color="success"
        href={rutaCompleta}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<VisibilityIcon />}
        sx={{
          fontWeight: 700,         
          color: "#fff",
          px: 2.5,
          py: 0.6,
          mt: 0.5,
          borderRadius: "8px",
          fontSize: "0.85rem",
          "&:hover": { bgcolor: "#1976d2" },
        }}
      >
        Ver documento
      </Button>
    </Box>
  </Box>
);
}
