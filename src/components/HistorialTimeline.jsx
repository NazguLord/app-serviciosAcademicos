// src/components/HistorialTimeline.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, CircularProgress, Alert, Stack, Paper, Chip, Tooltip,
} from "@mui/material";
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent,
} from "@mui/lab";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PaidIcon from "@mui/icons-material/Paid";   
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import { obtenerHistorialAcciones } from "../api/solicitudesApi";

function iconoColor(accion = "") {
  const a = (accion || "").toLowerCase();
  if (a.includes("pagado")) {return { icon: <PaidIcon />, color: "success", }}
  if (a.includes("entregado el documento al alumno")) {return { icon: <TaskAltIcon />, color: "success" }}
  if (a.includes("creo") || a.includes("crea")) return { icon: <PersonAddIcon  />, color: "info" };
  if (a.includes("env") || a.includes("solicita")) return { icon: <HourglassBottomIcon />, color: "warning" };
  if (a.includes("aprueba") || a.includes("finaliza") || a.includes("completa"))
    return { icon: <CheckCircleIcon />, color: "success" };
  if (a.includes("rechaza") || a.includes("deniega") || a.includes("denego") || a.includes("cancela")) {return { icon: <CancelIcon />, color: "error" }}
  if (a.includes("modifica") || a.includes("actualiza") || a.includes("edita"))
    return { icon: <EditNoteIcon />, color: "secondary" };
  return { icon: <InfoIcon />, color: "primary" };
}

export default function HistorialTimeline({ docCod, height = 420 }) {
  const [rows, setRows] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const formatearFechaLarga = (s) => {
  const d = dayjs(s);
  return d.isValid()
    ? d.format("D [de] MMMM [de] YYYY [a las] HH:mm")
    : (s || "—");
};

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!docCod) return;
      setCargando(true);
      setError("");
      const r = await obtenerHistorialAcciones(docCod);
      if (!alive) return;

      const ordenados = r.map((it) => {
        const d = it.fecha ? dayjs(it.fecha) : null;
        return {
          ...it,
          _ts: d?.isValid() ? d.valueOf() : 0,
          fechaTexto: formatearFechaLarga(it.fecha),
        };
      }).sort((a, b) => a._ts - b._ts);

      setRows(ordenados);
      if (ordenados === "asc") {
       requestAnimationFrame(() => {
      const cont = document.querySelector('#historial-scroll');
       cont?.scrollTo({ top: cont.scrollHeight, behavior: 'instant' });
  });
}
      setCargando(false);
    })();
    return () => { alive = false; };
  }, [docCod]);

  const contenido = useMemo(() => {
    if (cargando) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} variant="body2">Cargando historial…</Typography>
        </Stack>
      );
    }
    if (error) return <Alert severity="error" variant="outlined">{error}</Alert>;
    if (!rows.length) return <Alert severity="info" variant="outlined">No hay eventos en el historial.</Alert>;

    return (
      <Timeline position="alternate">
        {rows.map((it, idx) => {
          const { icon, color } = iconoColor(it.accion);
          const ultimo = idx === rows.length - 1;
          return (
            <TimelineItem key={idx}>
              <TimelineOppositeContent sx={{ flex: 0.28 }}>
  <Typography
    variant="body2"
    sx={(theme) => ({
      fontWeight: 700, // 👈 negrita
      color:
        theme.palette.mode === "dark"
          ? theme.palette.grey[200] // claro en oscuro
          : theme.palette.text.primary, // normal en claro
    })}
  >
    {it.fechaTexto || "—"}
  </Typography>
</TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={color}>{icon}</TimelineDot>
                {!ultimo && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Chip size="small" color={color} label={it.accion || "Evento"} sx={{ fontWeight: 600 }} />
                    {it.usuario ? (
                      <Tooltip title="Usuario">
                        <Chip size="small" variant="outlined" icon={<PersonIcon />} label={it.usuario} />
                      </Tooltip>
                    ) : null}
                  </Stack>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    );
  }, [cargando, error, rows]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Linea de tiempo del movimiento del documento</Typography>
      <Box id="historial-scroll" sx={{ height, overflowY: "auto", pr: 1 }}>{contenido}</Box>
    </Box>
  );
}
